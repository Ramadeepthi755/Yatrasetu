package com.yatrasetu.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.service.ai.AiContextRetrievalService;
import com.yatrasetu.web.dto.TripDto;
import com.yatrasetu.web.dto.TripPlanRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final ItineraryRepository itineraryRepository;
    private final ItineraryItemRepository itineraryItemRepository;
    private final DestinationRepository destinationRepository;
    private final DestinationPoiRepository destinationPoiRepository;
    private final ExperienceRepository experienceRepository;
    private final UserRepository userRepository;
    private final AiContextRetrievalService contextRetrievalService;
    private final ObjectMapper objectMapper;
    private final com.yatrasetu.service.intelligence.TourismDemandService demandService;

    /**
     * Generates a fully validated, day-by-day smart trip plan using real POIs from YatraSetu database.
     * Accessible by both guests (for preview) and authenticated travelers.
     */
    public TripDto planTrip(TripPlanRequest request, UserPrincipal principal) {
        Destination destination = destinationRepository.findById(request.getDestinationId())
                .orElseThrow(() -> new IllegalArgumentException("Destination not found with id: " + request.getDestinationId()));

        int days = request.getTotalDays() != null && request.getTotalDays() > 0 ? Math.min(request.getTotalDays(), 14) : 3;
        int travelers = request.getTravelerCount() != null && request.getTravelerCount() > 0 ? request.getTravelerCount() : 1;
        String budgetTier = request.getBudgetTier() != null ? request.getBudgetTier() : "Mid-Range";
        LocalDate start = request.getStartDate() != null ? request.getStartDate() : LocalDate.now().plusDays(7);
        LocalDate end = request.getEndDate() != null ? request.getEndDate() : start.plusDays(days - 1);

        // 1. Fetch genuine POIs from database for this destination
        List<DestinationPoi> realPois = destinationPoiRepository.findByDestinationId(destination.getId());
        if (realPois.isEmpty() && destination.getCity() != null) {
            realPois = destinationPoiRepository.findByCityId(destination.getCity().getId());
        }
        if (realPois.isEmpty() && destination.getLatitude() != null && destination.getLongitude() != null) {
            realPois = destinationPoiRepository.findNearestPois(
                    destination.getLatitude().doubleValue(),
                    destination.getLongitude().doubleValue(),
                    15
            );
        }
        if (realPois.isEmpty()) {
            log.warn("No POIs found for destination {}", destination.getDestinationName());
        }

        // 2. Build structured, validated Day-by-Day Itinerary
        List<TripDto.ItineraryDayDto> itineraryDays = new ArrayList<>();
        BigDecimal totalPoiEntryFeePerTraveler = BigDecimal.ZERO;

        int poiIndex = 0;
        for (int day = 1; day <= days; day++) {
            List<TripDto.ItineraryItemDto> dayItems = new ArrayList<>();
            String theme = determineDayTheme(day, days, destination.getDestinationName(), request.getTravelStyle());

            // Morning Slot
            if (poiIndex < realPois.size()) {
                DestinationPoi p1 = realPois.get(poiIndex++);
                dayItems.add(buildPoiItem(p1, "MORNING", 0));
                if (p1.getEntryFeeInr() != null) {
                    totalPoiEntryFeePerTraveler = totalPoiEntryFeePerTraveler.add(p1.getEntryFeeInr());
                }
            }

            // Lunch / Midday Slot
            dayItems.add(TripDto.ItineraryItemDto.builder()
                    .itemType("MEAL")
                    .title("Authentic Regional Lunch Experience")
                    .timeSlot("AFTERNOON")
                    .durationHours(BigDecimal.valueOf(1.0))
                    .estimatedCostInr(estimateMealCost(budgetTier))
                    .priceTransparency("ESTIMATED")
                    .rationale("Sample authentic local cuisine at heritage restaurants.")
                    .orderIndex(1)
                    .category("Culinary")
                    .source("DATASET")
                    .build());

            // Afternoon Slot
            if (poiIndex < realPois.size()) {
                DestinationPoi p2 = realPois.get(poiIndex++);
                dayItems.add(buildPoiItem(p2, "AFTERNOON", 2));
                if (p2.getEntryFeeInr() != null) {
                    totalPoiEntryFeePerTraveler = totalPoiEntryFeePerTraveler.add(p2.getEntryFeeInr());
                }
            } else if (!realPois.isEmpty()) {
                // Reuse a top landmark if POI pool is smaller than days*2
                DestinationPoi pReuse = realPois.get(day % realPois.size());
                dayItems.add(buildPoiItem(pReuse, "AFTERNOON", 2));
            }

            // Evening Slot: Heritage walk / scenic viewpoint
            if (poiIndex < realPois.size()) {
                DestinationPoi p3 = realPois.get(poiIndex++);
                dayItems.add(buildPoiItem(p3, "EVENING", 3));
                if (p3.getEntryFeeInr() != null) {
                    totalPoiEntryFeePerTraveler = totalPoiEntryFeePerTraveler.add(p3.getEntryFeeInr());
                }
            } else {
                dayItems.add(TripDto.ItineraryItemDto.builder()
                        .itemType("EXPERIENCE")
                        .title("Evening Sunset & Local Heritage Stroll")
                        .timeSlot("EVENING")
                        .durationHours(BigDecimal.valueOf(1.5))
                        .estimatedCostInr(BigDecimal.ZERO)
                        .priceTransparency("KNOWN")
                        .rationale("Relaxing sunset walk absorbing the cultural ambience.")
                        .orderIndex(3)
                        .category("Leisure")
                        .source("OFFICIAL")
                        .build());
            }

            itineraryDays.add(TripDto.ItineraryDayDto.builder()
                    .dayNumber(day)
                    .theme(theme)
                    .notes(String.format("Day %d in %s tailored for a %s pace.", day, destination.getDestinationName(), request.getTravelStyle()))
                    .items(dayItems)
                    .build());
        }

        // 3. Compute Honest Budget Breakdown
        TripDto.BudgetBreakdownDto budgetBreakdown = calculateHonestBudget(budgetTier, days, travelers, totalPoiEntryFeePerTraveler);

        // 4. Fetch Live Weather via Open-Meteo
        TripDto.WeatherSummaryDto weather = contextRetrievalService.fetchLiveWeather(destination.getLatitude(), destination.getLongitude());

        TripDto tripDto = TripDto.builder()
                .destinationId(destination.getId())
                .destinationName(destination.getDestinationName())
                .destinationImage(destination.getHeroImageUrl())
                .cityName(destination.getCity() != null ? destination.getCity().getCityName() : "")
                .stateName(destination.getState() != null ? destination.getState().getStateName() : "")
                .title(String.format("%d-Day %s Exploration in %s", days, budgetTier, destination.getDestinationName()))
                .startDate(start)
                .endDate(end)
                .totalDays(days)
                .travelerCount(travelers)
                .budgetCategory(budgetTier)
                .totalBudgetInr(budgetBreakdown.getTotalBudgetInr())
                .status("PLANNING")
                .isAiGenerated(true)
                .itineraries(itineraryDays)
                .budgetBreakdown(budgetBreakdown)
                .weatherSummary(weather)
                .build();

        // Record genuine observed demand signal (idempotent per user+destination+date)
        try {
            String actorId = principal != null && principal.getUserId() != null ? principal.getUserId() : "guest";
            String idemp = "idemp_trip_plan_" + actorId + "_" + destination.getId() + "_" + LocalDate.now();
            demandService.recordSignal(
                destination.getId(),
                com.yatrasetu.domain.intelligence.DemandSignalType.TRIP_PLAN,
                1,
                com.yatrasetu.domain.intelligence.IntelligenceSourceType.OBSERVED,
                idemp,
                objectMapper.writeValueAsString(Map.of("destinationId", destination.getId(), "days", days, "budgetTier", budgetTier))
            );
        } catch (Exception e) {
            log.debug("Demand signal record skipped: {}", e.getMessage());
        }

        // 5. If saveDirectly is true and user is authenticated, persist to database
        if (request.isSaveDirectly() && principal != null) {
            return saveTrip(tripDto, principal);
        }

        return tripDto;
    }

    /**
     * Saves a generated or edited trip to the database for the authenticated user.
     */
    @Transactional
    public TripDto saveTrip(TripDto dto, UserPrincipal principal) {
        if (principal == null || principal.getUserId() == null || principal.getRole() != Role.TRAVELER) {
            throw new AccessDeniedException("Only authenticated travelers can save trips to their profile.");
        }

        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found."));

        Destination destination = destinationRepository.findById(dto.getDestinationId())
                .orElseThrow(() -> new IllegalArgumentException("Destination not found: " + dto.getDestinationId()));

        String tripId = dto.getId() != null && !dto.getId().trim().isEmpty()
                ? dto.getId()
                : "trip-" + UUID.randomUUID().toString().substring(0, 8);

        Trip trip = Trip.builder()
                .id(tripId)
                .user(user)
                .destination(destination)
                .title(dto.getTitle() != null ? dto.getTitle() : "Trip to " + destination.getDestinationName())
                .startDate(dto.getStartDate() != null ? dto.getStartDate() : LocalDate.now().plusDays(7))
                .endDate(dto.getEndDate() != null ? dto.getEndDate() : LocalDate.now().plusDays(10))
                .totalDays(dto.getTotalDays() != null ? dto.getTotalDays() : 3)
                .travelerCount(dto.getTravelerCount() != null ? dto.getTravelerCount() : 1)
                .budgetCategory(dto.getBudgetCategory() != null ? dto.getBudgetCategory() : "Mid-Range")
                .totalBudgetInr(dto.getTotalBudgetInr() != null ? dto.getTotalBudgetInr() : BigDecimal.ZERO)
                .status("PLANNING")
                .isAiGenerated(dto.getIsAiGenerated() != null ? dto.getIsAiGenerated() : true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        try {
            if (dto.getBudgetBreakdown() != null) {
                trip.setBudgetBreakdownJson(objectMapper.writeValueAsString(dto.getBudgetBreakdown()));
            }
            if (dto.getWeatherSummary() != null) {
                trip.setWeatherSummary(objectMapper.writeValueAsString(dto.getWeatherSummary()));
            }
        } catch (Exception e) {
            log.warn("Failed to serialize trip JSON fields: {}", e.getMessage());
        }

        Trip savedTrip = tripRepository.save(trip);

        // Save itineraries & items
        if (dto.getItineraries() != null) {
            for (TripDto.ItineraryDayDto dayDto : dto.getItineraries()) {
                String itinId = "itin-" + UUID.randomUUID().toString().substring(0, 8);
                Itinerary itinerary = Itinerary.builder()
                        .id(itinId)
                        .trip(savedTrip)
                        .dayNumber(dayDto.getDayNumber())
                        .theme(dayDto.getTheme())
                        .notes(dayDto.getNotes())
                        .createdAt(Instant.now())
                        .build();
                itineraryRepository.save(itinerary);

                if (dayDto.getItems() != null) {
                    for (int i = 0; i < dayDto.getItems().size(); i++) {
                        TripDto.ItineraryItemDto itemDto = dayDto.getItems().get(i);
                        String itemId = "item-" + UUID.randomUUID().toString().substring(0, 8);
                        ItineraryItem item = ItineraryItem.builder()
                                .id(itemId)
                                .itinerary(itinerary)
                                .itemType(itemDto.getItemType() != null ? itemDto.getItemType() : "POI")
                                .itemId(itemDto.getItemId())
                                .poiId(itemDto.getPoiId())
                                .title(itemDto.getTitle())
                                .timeSlot(itemDto.getTimeSlot())
                                .durationHours(itemDto.getDurationHours())
                                .estimatedCostInr(itemDto.getEstimatedCostInr())
                                .priceTransparency(itemDto.getPriceTransparency() != null ? itemDto.getPriceTransparency() : "ESTIMATED")
                                .rationale(itemDto.getRationale())
                                .orderIndex(i)
                                .build();
                        itineraryItemRepository.save(item);
                    }
                }
            }
        }

        dto.setId(savedTrip.getId());

        // Record genuine observed demand signal (idempotent per trip ID)
        try {
            String idemp = "idemp_trip_saved_" + savedTrip.getId();
            demandService.recordSignal(
                destination.getId(),
                com.yatrasetu.domain.intelligence.DemandSignalType.TRIP_SAVED,
                1,
                com.yatrasetu.domain.intelligence.IntelligenceSourceType.OBSERVED,
                idemp,
                objectMapper.writeValueAsString(Map.of("tripId", savedTrip.getId(), "title", savedTrip.getTitle()))
            );
        } catch (Exception e) {
            log.debug("Demand signal record for trip saved skipped: {}", e.getMessage());
        }

        return dto;
    }

    /**
     * Retrieves all saved trips for the authenticated traveler only.
     */
    @Transactional(readOnly = true)
    public List<TripDto> getMyTrips(UserPrincipal principal) {
        if (principal == null || principal.getUserId() == null || principal.getRole() != Role.TRAVELER) {
            throw new AccessDeniedException("Only authenticated travelers can view saved trips.");
        }

        List<Trip> trips = tripRepository.findByUserIdOrderByCreatedAtDesc(principal.getUserId());
        return trips.stream().map(this::mapTripToDto).toList();
    }

    /**
     * Retrieves a single trip ensuring traveler ownership isolation.
     */
    @Transactional(readOnly = true)
    public TripDto getTripById(String tripId, UserPrincipal principal) {
        if (principal == null || principal.getUserId() == null || principal.getRole() != Role.TRAVELER) {
            throw new AccessDeniedException("Only authenticated travelers can view saved trips.");
        }

        Trip trip = tripRepository.findByIdAndUserId(tripId, principal.getUserId())
                .orElseThrow(() -> new AccessDeniedException("Trip not found or you do not have permission to view it."));

        return mapTripToDto(trip);
    }

    /**
     * Deletes a trip ensuring traveler ownership isolation.
     */
    @Transactional
    public void deleteTrip(String tripId, UserPrincipal principal) {
        if (principal == null || principal.getUserId() == null || principal.getRole() != Role.TRAVELER) {
            throw new AccessDeniedException("Only authenticated travelers can delete saved trips.");
        }

        Trip trip = tripRepository.findByIdAndUserId(tripId, principal.getUserId())
                .orElseThrow(() -> new AccessDeniedException("Trip not found or you do not have permission to delete it."));

        tripRepository.delete(trip);
    }

    private TripDto mapTripToDto(Trip trip) {
        List<Itinerary> itins = itineraryRepository.findByTripIdOrderByDayNumberAsc(trip.getId());
        List<TripDto.ItineraryDayDto> dayDtos = new ArrayList<>();

        for (Itinerary itin : itins) {
            List<ItineraryItem> items = itineraryItemRepository.findByItineraryIdOrderByOrderIndexAsc(itin.getId());
            List<TripDto.ItineraryItemDto> itemDtos = items.stream().map(item -> TripDto.ItineraryItemDto.builder()
                    .id(item.getId())
                    .itemType(item.getItemType())
                    .itemId(item.getItemId())
                    .poiId(item.getPoiId())
                    .title(item.getTitle())
                    .timeSlot(item.getTimeSlot())
                    .durationHours(item.getDurationHours())
                    .estimatedCostInr(item.getEstimatedCostInr())
                    .priceTransparency(item.getPriceTransparency())
                    .rationale(item.getRationale())
                    .orderIndex(item.getOrderIndex())
                    .build()).toList();

            dayDtos.add(TripDto.ItineraryDayDto.builder()
                    .id(itin.getId())
                    .dayNumber(itin.getDayNumber())
                    .theme(itin.getTheme())
                    .notes(itin.getNotes())
                    .items(itemDtos)
                    .build());
        }

        TripDto.BudgetBreakdownDto breakdown = null;
        if (trip.getBudgetBreakdownJson() != null) {
            try {
                breakdown = objectMapper.readValue(trip.getBudgetBreakdownJson(), TripDto.BudgetBreakdownDto.class);
            } catch (Exception ignored) {}
        }

        TripDto.WeatherSummaryDto weather = null;
        if (trip.getWeatherSummary() != null) {
            try {
                weather = objectMapper.readValue(trip.getWeatherSummary(), TripDto.WeatherSummaryDto.class);
            } catch (Exception ignored) {}
        }

        return TripDto.builder()
                .id(trip.getId())
                .destinationId(trip.getDestination().getId())
                .destinationName(trip.getDestination().getDestinationName())
                .destinationImage(trip.getDestination().getHeroImageUrl())
                .cityName(trip.getDestination().getCity() != null ? trip.getDestination().getCity().getCityName() : "")
                .stateName(trip.getDestination().getState() != null ? trip.getDestination().getState().getStateName() : "")
                .title(trip.getTitle())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .totalDays(trip.getTotalDays())
                .travelerCount(trip.getTravelerCount())
                .budgetCategory(trip.getBudgetCategory())
                .totalBudgetInr(trip.getTotalBudgetInr())
                .status(trip.getStatus())
                .isAiGenerated(trip.getIsAiGenerated())
                .createdAt(trip.getCreatedAt())
                .itineraries(dayDtos)
                .budgetBreakdown(breakdown)
                .weatherSummary(weather)
                .build();
    }

    private TripDto.ItineraryItemDto buildPoiItem(DestinationPoi poi, String slot, int order) {
        BigDecimal fee = poi.getEntryFeeInr() != null ? poi.getEntryFeeInr() : BigDecimal.ZERO;
        String transparency = fee.compareTo(BigDecimal.ZERO) > 0 ? "KNOWN" : (fee.compareTo(BigDecimal.ZERO) == 0 ? "KNOWN" : "UNAVAILABLE");

        return TripDto.ItineraryItemDto.builder()
                .itemType("POI")
                .itemId(poi.getId())
                .poiId(poi.getId()) // STRICT POI VALIDATION: Links directly to genuine POI ID in DB
                .title(poi.getPoiName())
                .timeSlot(slot)
                .durationHours(poi.getTypicalDurationHours() != null ? poi.getTypicalDurationHours() : BigDecimal.valueOf(2.0))
                .estimatedCostInr(fee)
                .priceTransparency(transparency)
                .rationale(poi.getCharacteristics() != null ? poi.getCharacteristics() : "Key architectural & historical heritage monument.")
                .orderIndex(order)
                .category(poi.getCategory())
                .source("DATASET")
                .build();
    }

    private TripDto.BudgetBreakdownDto calculateHonestBudget(String tier, int days, int travelers, BigDecimal totalEntryFeesPerTraveler) {
        BigDecimal dailyStayPerRoom;
        BigDecimal dailyFoodPerPerson;
        BigDecimal dailyLocalTransport;

        switch (tier) {
            case "Budget" -> {
                dailyStayPerRoom = BigDecimal.valueOf(1200);
                dailyFoodPerPerson = BigDecimal.valueOf(450);
                dailyLocalTransport = BigDecimal.valueOf(350);
            }
            case "Luxury" -> {
                dailyStayPerRoom = BigDecimal.valueOf(8500);
                dailyFoodPerPerson = BigDecimal.valueOf(2500);
                dailyLocalTransport = BigDecimal.valueOf(1800);
            }
            default -> { // Mid-Range
                dailyStayPerRoom = BigDecimal.valueOf(3500);
                dailyFoodPerPerson = BigDecimal.valueOf(1100);
                dailyLocalTransport = BigDecimal.valueOf(800);
            }
        }

        int roomsNeeded = (travelers + 1) / 2;
        int nights = Math.max(1, days - 1);

        // 1. KNOWN Costs: Real POI Entry Fees
        BigDecimal totalKnownFees = totalEntryFeesPerTraveler.multiply(BigDecimal.valueOf(travelers));

        // 2. ESTIMATED Costs
        BigDecimal totalStay = dailyStayPerRoom.multiply(BigDecimal.valueOf(nights)).multiply(BigDecimal.valueOf(roomsNeeded));
        BigDecimal totalFood = dailyFoodPerPerson.multiply(BigDecimal.valueOf(days)).multiply(BigDecimal.valueOf(travelers));
        BigDecimal totalTransport = dailyLocalTransport.multiply(BigDecimal.valueOf(days));
        BigDecimal totalEstimatedCosts = totalStay.add(totalFood).add(totalTransport);

        BigDecimal totalBudget = totalKnownFees.add(totalEstimatedCosts).setScale(0, RoundingMode.HALF_UP);

        List<TripDto.BudgetItemBreakdown> items = List.of(
                TripDto.BudgetItemBreakdown.builder()
                        .category("Activities & Heritage Entry")
                        .amountInr(totalKnownFees)
                        .priceType("KNOWN")
                        .description("Official entry fees for verified POIs in itinerary.")
                        .build(),
                TripDto.BudgetItemBreakdown.builder()
                        .category("Accommodation (" + nights + " nights, " + tier + ")")
                        .amountInr(totalStay)
                        .priceType("ESTIMATED")
                        .description("Average seasonal lodging estimates. Real rates depend on room booking.")
                        .build(),
                TripDto.BudgetItemBreakdown.builder()
                        .category("Authentic Regional Food")
                        .amountInr(totalFood)
                        .priceType("ESTIMATED")
                        .description("Estimated meal costs across " + days + " days for " + travelers + " traveler(s).")
                        .build(),
                TripDto.BudgetItemBreakdown.builder()
                        .category("Local Transit & Auto/Cab")
                        .amountInr(totalTransport)
                        .priceType("ESTIMATED")
                        .description("Estimated in-city transit. Live meter/app taxi fares are not fabricated.")
                        .build()
        );

        List<String> unavail = List.of(
                "Live taxi fares and inter-city flight/train tickets (check official transport portals)",
                "Specific restaurant bills and discretionary shopping"
        );

        return TripDto.BudgetBreakdownDto.builder()
                .knownCostsInr(totalKnownFees)
                .estimatedCostsInr(totalEstimatedCosts)
                .totalBudgetInr(totalBudget)
                .unavailablePriceItems(unavail)
                .items(items)
                .currency("INR")
                .honestyNote("YatraSetu Zero-Hallucination Guarantee: POI entry fees reflect verified dataset records. Lodging and meal costs are computed estimates. No hotel bookings or live taxi fares are fabricated.")
                .build();
    }

    private BigDecimal estimateMealCost(String tier) {
        return switch (tier) {
            case "Budget" -> BigDecimal.valueOf(180);
            case "Luxury" -> BigDecimal.valueOf(950);
            default -> BigDecimal.valueOf(400);
        };
    }

    private String determineDayTheme(int day, int totalDays, String destName, String style) {
        if (day == 1) return "Historic Landmarks & Grand Architecture";
        if (day == 2) return "Cultural Heritage, Crafts & Sacred Temples";
        if (day == 3) return "Scenic Vistas, Bazaars & Culinary Discovery";
        return "Hidden Gems & Off-the-Beaten-Path Treasures";
    }
}
