package com.yatrasetu.service;

import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.web.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DestinationEcosystemService {

    private final DestinationRepository destinationRepository;
    private final FamousFoodRepository famousFoodRepository;
    private final RestaurantRepository restaurantRepository;
    private final DestinationTransportRepository destinationTransportRepository;
    private final TravelAgencyRepository travelAgencyRepository;
    private final RentalProviderRepository rentalProviderRepository;
    private final HotelRepository hotelRepository;
    private final HotelService hotelService;
    private final PoiService poiService;
    private final LocalHostService localHostService;
    private final ExperienceService experienceService;

    @Transactional(readOnly = true)
    public List<FamousFoodDto> getFamousFoods(String destinationId) {
        return famousFoodRepository.findByDestinationId(destinationId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RestaurantDto> getRestaurants(String destinationId) {
        return restaurantRepository.findByDestinationId(destinationId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DestinationTransportDto> getTransports(String destinationId) {
        List<DestinationTransportDto> transports = destinationTransportRepository.findByDestinationId(destinationId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        if (transports.isEmpty()) {
            destinationRepository.findById(destinationId).ifPresent(dest -> {
                if (dest.getNearestAirport() != null && !dest.getNearestAirport().trim().isEmpty()) {
                    String name = dest.getNearestAirport();
                    java.math.BigDecimal dist = null;
                    try {
                        if (name.startsWith("{")) {
                            com.fasterxml.jackson.databind.JsonNode node = new com.fasterxml.jackson.databind.ObjectMapper().readTree(name);
                            if (node.has("name")) name = node.get("name").asText();
                            if (node.has("distance_km")) dist = java.math.BigDecimal.valueOf(node.get("distance_km").asDouble());
                        }
                    } catch (Exception ignored) {}
                    transports.add(DestinationTransportDto.builder()
                            .id("trans-" + destinationId + "-air-meta")
                            .destinationId(destinationId)
                            .mode("AIRPORT")
                            .name(name)
                            .distanceKm(dist)
                            .description("Nearest airport connected to major domestic and international hubs.")
                            .priceType("PRICE_UNAVAILABLE")
                            .sourceType("DATASET")
                            .sourceLabel("Dataset")
                            .build());
                }
                if (dest.getNearestRailway() != null && !dest.getNearestRailway().trim().isEmpty()) {
                    String name = dest.getNearestRailway();
                    java.math.BigDecimal dist = null;
                    try {
                        if (name.startsWith("{")) {
                            com.fasterxml.jackson.databind.JsonNode node = new com.fasterxml.jackson.databind.ObjectMapper().readTree(name);
                            if (node.has("name")) name = node.get("name").asText();
                            if (node.has("distance_km")) dist = java.math.BigDecimal.valueOf(node.get("distance_km").asDouble());
                        }
                    } catch (Exception ignored) {}
                    transports.add(DestinationTransportDto.builder()
                            .id("trans-" + destinationId + "-rail-meta")
                            .destinationId(destinationId)
                            .mode("RAILWAY")
                            .name(name)
                            .distanceKm(dist)
                            .description("Nearest railway station on Indian Railways national network.")
                            .priceType("PRICE_UNAVAILABLE")
                            .sourceType("DATASET")
                            .sourceLabel("Dataset")
                            .build());
                }
            });
        }
        return transports;
    }

    @Transactional(readOnly = true)
    public List<TravelAgencyDto> getTravelAgencies(String destinationId) {
        return travelAgencyRepository.findByDestinationId(destinationId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RentalProviderDto> getRentalProviders(String destinationId) {
        return rentalProviderRepository.findByDestinationId(destinationId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DestinationEcosystemDto getEcosystem(String destinationId) {
        Destination destination = destinationRepository.findById(destinationId)
                .orElse(null);

        String destinationName = destination != null ? destination.getDestinationName() : destinationId;

        List<FamousFoodDto> foods = getFamousFoods(destinationId);
        List<RestaurantDto> restaurants = getRestaurants(destinationId);
        List<DestinationTransportDto> transports = getTransports(destinationId);
        List<TravelAgencyDto> agencies = getTravelAgencies(destinationId);
        List<RentalProviderDto> rentalProviders = getRentalProviders(destinationId);

        List<HotelDto> hotels = hotelRepository.findByDestinationId(destinationId)
                .stream()
                .map(hotelService::toDto)
                .collect(Collectors.toList());

        List<PoiDto> pois = poiService.getPoisByDestination(destinationId);

        List<LocalHostDto> localGuides = localHostService.getHostsByDestination(destinationId);
        List<ExperienceDto> experiences = experienceService.getExperiencesByDestination(destinationId);

        return DestinationEcosystemDto.builder()
                .destinationId(destinationId)
                .destinationName(destinationName)
                .famousFoods(foods)
                .restaurants(restaurants)
                .transports(transports)
                .agencies(agencies)
                .rentalProviders(rentalProviders)
                .hotels(hotels)
                .pois(pois)
                .localGuides(localGuides)
                .experiences(experiences)
                .build();
    }

    public FamousFoodDto toDto(FamousFood f) {
        return FamousFoodDto.builder()
                .id(f.getId())
                .destinationId(f.getDestination() != null ? f.getDestination().getId() : null)
                .dishName(f.getDishName())
                .description(f.getDescription())
                .isVegetarian(f.getIsVegetarian())
                .cuisineType(f.getCuisineType())
                .imageUrl(f.getImageUrl())
                .sourceType(f.getSourceType() != null ? f.getSourceType().name() : "DATASET")
                .sourceLabel(ProvenanceUtil.getLabel(f.getSourceType(), null))
                .build();
    }

    public RestaurantDto toDto(Restaurant r) {
        return RestaurantDto.builder()
                .id(r.getId())
                .destinationId(r.getDestination() != null ? r.getDestination().getId() : null)
                .name(r.getName())
                .cuisineType(r.getCuisineType())
                .address(r.getAddress())
                .latitude(r.getLatitude())
                .longitude(r.getLongitude())
                .rating(r.getRating())
                .reviewsCount(r.getReviewsCount())
                .isVerified(r.getIsVerified())
                .sourceType(r.getSourceType() != null ? r.getSourceType().name() : "PARTNER_SUBMITTED")
                .sourceLabel(ProvenanceUtil.getLabel(r.getSourceType(), r.getIsVerified()))
                .phone(r.getPhone())
                .website(r.getWebsite())
                .openingHours(r.getOpeningHours())
                .priceRange(r.getPriceRange())
                .build();
    }

    public DestinationTransportDto toDto(DestinationTransport t) {
        return DestinationTransportDto.builder()
                .id(t.getId())
                .destinationId(t.getDestination() != null ? t.getDestination().getId() : null)
                .mode(t.getMode() != null ? t.getMode().name() : null)
                .name(t.getName())
                .distanceKm(t.getDistanceKm())
                .description(t.getDescription())
                .roadCondition(t.getRoadCondition())
                .priceType(t.getPriceType() != null ? t.getPriceType().name() : "PRICE_UNAVAILABLE")
                .estimatedFareInr(t.getEstimatedFareInr())
                .sourceType(t.getSourceType() != null ? t.getSourceType().name() : "DATASET")
                .sourceLabel(ProvenanceUtil.getLabel(t.getSourceType(), null))
                .build();
    }

    public TravelAgencyDto toDto(TravelAgency a) {
        return TravelAgencyDto.builder()
                .id(a.getId())
                .destinationId(a.getDestination() != null ? a.getDestination().getId() : null)
                .agencyName(a.getAgencyName())
                .licenseNumber(a.getLicenseNumber())
                .address(a.getAddress())
                .servicesOffered(a.getServicesOffered())
                .rating(a.getRating())
                .isVerified(a.getIsVerified())
                .sourceType(a.getSourceType() != null ? a.getSourceType().name() : "PARTNER_SUBMITTED")
                .sourceLabel(ProvenanceUtil.getLabel(a.getSourceType(), a.getIsVerified()))
                .phone(a.getPhone())
                .website(a.getWebsite())
                .build();
    }

    public RentalProviderDto toDto(RentalProvider p) {
        return RentalProviderDto.builder()
                .id(p.getId())
                .destinationId(p.getDestination() != null ? p.getDestination().getId() : null)
                .providerName(p.getProviderName())
                .vehicleTypes(p.getVehicleTypes())
                .address(p.getAddress())
                .isVerified(p.getIsVerified())
                .sourceType(p.getSourceType() != null ? p.getSourceType().name() : "PARTNER_SUBMITTED")
                .sourceLabel(ProvenanceUtil.getLabel(p.getSourceType(), p.getIsVerified()))
                .phone(p.getPhone())
                .website(p.getWebsite())
                .build();
    }
}
