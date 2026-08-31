package com.yatrasetu.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yatrasetu.domain.Destination;
import com.yatrasetu.domain.Review;
import com.yatrasetu.repository.DestinationRepository;
import com.yatrasetu.repository.ReviewRepository;
import com.yatrasetu.web.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DestinationService {

    private final DestinationRepository destinationRepository;
    private final ReviewRepository reviewRepository;
    private final PoiService poiService;
    private final HotelService hotelService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public Page<DestinationSummaryDto> getDestinations(
            String stateId,
            String region,
            String category,
            BigDecimal minPopularity,
            String search,
            int page,
            int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "popularityScore"));
        String cleanRegion = (region != null && !region.equalsIgnoreCase("all") && !region.trim().isEmpty()) ? region.trim() : null;
        String cleanState = (stateId != null && !stateId.equalsIgnoreCase("all") && !stateId.trim().isEmpty()) ? stateId.trim() : null;
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        Page<Destination> destinationPage = destinationRepository.findWithFilters(cleanState, cleanRegion, minPopularity, cleanSearch, pageable);

        return destinationPage.map(this::toSummaryDto);
    }

    @Transactional(readOnly = true)
    public List<DestinationSummaryDto> getFeaturedDestinations(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "popularityScore"));
        return destinationRepository.findTopPopular(pageable)
                .stream()
                .map(this::toSummaryDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DestinationSummaryDto> getTrendingDestinations(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "popularityScore"));
        return destinationRepository.findTrending(pageable)
                .stream()
                .map(this::toSummaryDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DestinationSummaryDto> getHiddenGems(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return destinationRepository.findHiddenGems(pageable)
                .stream()
                .map(this::toSummaryDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<DestinationDetailDto> getDestinationDetail(String id) {
        Optional<Destination> destOpt = destinationRepository.findByIdOrNameIgnoreCase(id);
        if (destOpt.isEmpty()) {
            return Optional.empty();
        }

        Destination d = destOpt.get();
        List<PoiDto> topPois = poiService.getPoisByDestination(d.getId());
        List<HotelDto> nearbyHotels = hotelService.getHotelsByDestination(d.getId());

        // Fetch recent reviews
        List<ReviewDto> recentReviews = reviewRepository.findByDestinationId(d.getId(), PageRequest.of(0, 10))
                .stream()
                .map(this::toReviewDto)
                .collect(Collectors.toList());

        return Optional.of(DestinationDetailDto.builder()
                .id(d.getId())
                .destinationName(d.getDestinationName())
                .stateId(d.getState() != null ? d.getState().getId() : null)
                .stateName(d.getState() != null ? d.getState().getStateName() : null)
                .cityId(d.getCity() != null ? d.getCity().getId() : null)
                .cityName(d.getCity() != null ? d.getCity().getCityName() : null)
                .district(d.getDistrict())
                .region(d.getRegion())
                .latitude(d.getLatitude())
                .longitude(d.getLongitude())
                .altitudeM(d.getAltitudeM())
                .popularityScore(d.getPopularityScore())
                .accessibility(d.getAccessibility())
                .nearestAirport(d.getNearestAirport())
                .nearestRailway(d.getNearestRailway())
                .nearestMajorCity(d.getNearestMajorCity())
                .nearestMajorCityDistanceKm(d.getNearestMajorCityDistanceKm())
                .roadConnectivity(d.getRoadConnectivity())
                .tripTypes(d.getTripTypes())
                .primaryAttractions(d.getPrimaryAttractions())
                .activitiesAvailable(d.getActivitiesAvailable())
                .uniqueExperiences(d.getUniqueExperiences())
                .hiddenGems(d.getHiddenGems())
                .bestSeasons(d.getBestSeasons())
                .avoidSeasons(d.getAvoidSeasons())
                .peakSeason(d.getPeakSeason())
                .offSeason(d.getOffSeason())
                .averageTemperature(d.getAverageTemperature())
                .rainfallPattern(d.getRainfallPattern())
                .idealFor(d.getIdealFor())
                .idealForWhy(d.getIdealForWhy())
                .specialConsiderations(d.getSpecialConsiderations())
                .minimumDays(d.getMinimumDays())
                .idealDays(d.getIdealDays())
                .maximumDays(d.getMaximumDays())
                .suggestedItinerary(d.getSuggestedItinerary())
                .accommodationTypes(d.getAccommodationTypes())
                .foodScene(d.getFoodScene())
                .safetyRating(d.getSafetyRating())
                .safetyNotes(d.getSafetyNotes())
                .internetConnectivity(d.getInternetConnectivity())
                .mobileNetwork(d.getMobileNetwork())
                .atmAvailability(d.getAtmAvailability())
                .languageSpoken(d.getLanguageSpoken())
                .permitsRequired(d.getPermitsRequired())
                .permitsDetails(d.getPermitsDetails())
                .localCulture(d.getLocalCulture())
                .festivalsEvents(d.getFestivalsEvents())
                .localCustoms(d.getLocalCustoms())
                .shoppingHighlights(d.getShoppingHighlights())
                .localCuisineMustTry(d.getLocalCuisineMustTry())
                .budgetRangeJson(d.getBudgetRangeJson())
                .midRangeJson(d.getMidRangeJson())
                .luxuryRangeJson(d.getLuxuryRangeJson())
                .description(d.getDescription())
                .heroImageUrl(d.getHeroImageUrl())
                .userReviewsSummary(d.getUserReviewsSummary())
                .recentDevelopments(d.getRecentDevelopments())
                .sustainabilityNotes(d.getSustainabilityNotes())
                .topPois(topPois)
                .nearbyHotels(nearbyHotels)
                .recentReviews(recentReviews)
                .build());
    }

    public DestinationSummaryDto toSummaryDto(Destination d) {
        String budgetIndicator = parseBudgetIndicator(d.getBudgetRangeJson(), d.getMidRangeJson());

        return DestinationSummaryDto.builder()
                .id(d.getId())
                .destinationName(d.getDestinationName())
                .stateId(d.getState() != null ? d.getState().getId() : null)
                .stateName(d.getState() != null ? d.getState().getStateName() : null)
                .cityId(d.getCity() != null ? d.getCity().getId() : null)
                .cityName(d.getCity() != null ? d.getCity().getCityName() : null)
                .district(d.getDistrict())
                .region(d.getRegion())
                .latitude(d.getLatitude())
                .longitude(d.getLongitude())
                .popularityScore(d.getPopularityScore())
                .accessibility(d.getAccessibility())
                .tripTypes(d.getTripTypes())
                .bestSeasons(d.getBestSeasons())
                .peakSeason(d.getPeakSeason())
                .description(d.getDescription())
                .heroImageUrl(d.getHeroImageUrl())
                .safetyRating(d.getSafetyRating())
                .budgetIndicator(budgetIndicator)
                .hiddenGems(d.getHiddenGems())
                .build();
    }

    private String parseBudgetIndicator(String budgetJson, String midRangeJson) {
        try {
            if (budgetJson != null && !budgetJson.trim().isEmpty()) {
                JsonNode node = objectMapper.readTree(budgetJson);
                if (node.has("total_daily_range")) {
                    JsonNode range = node.get("total_daily_range");
                    if (range.isArray() && range.size() >= 2) {
                        return "₹" + range.get(0).asInt() + " - ₹" + range.get(1).asInt() + "/day";
                    }
                }
            }
            if (midRangeJson != null && !midRangeJson.trim().isEmpty()) {
                JsonNode node = objectMapper.readTree(midRangeJson);
                if (node.has("total_daily_range")) {
                    JsonNode range = node.get("total_daily_range");
                    if (range.isArray() && range.size() >= 2) {
                        return "₹" + range.get(0).asInt() + " - ₹" + range.get(1).asInt() + "/day";
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Failed to parse budget JSON", e);
        }
        return "₹1,500 - ₹3,500/day";
    }

    private ReviewDto toReviewDto(Review r) {
        return ReviewDto.builder()
                .id(r.getId())
                .userName(r.getUser() != null ? r.getUser().getFullName() : "Verified Traveler")
                .userAvatar(r.getUser() != null ? r.getUser().getAvatarUrl() : null)
                .entityType(r.getEntityType())
                .entityId(r.getEntityId())
                .rating(r.getRating())
                .reviewText(r.getReviewText())
                .isVerifiedBooking(r.getIsVerifiedBooking())
                .isImportedDataset(r.getIsImportedDataset())
                .sentimentCategory(r.getSentimentCategory())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
