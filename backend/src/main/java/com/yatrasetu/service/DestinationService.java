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

import org.springframework.data.domain.PageImpl;
import java.util.Collections;

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

        Sort sort = Sort.by(Sort.Direction.DESC, "popularityScore");
        String cleanRegion = (region != null && !region.equalsIgnoreCase("all") && !region.trim().isEmpty()) ? region.trim() : null;
        String cleanState = (stateId != null && !stateId.equalsIgnoreCase("all") && !stateId.trim().isEmpty()) ? stateId.trim() : null;
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String cleanCategory = (category != null && !category.equalsIgnoreCase("all") && !category.trim().isEmpty()) ? category.trim() : null;

        if (cleanCategory == null) {
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<Destination> destinationPage = destinationRepository.findWithFilters(cleanState, cleanRegion, minPopularity, cleanSearch, pageable);
            return destinationPage.map(this::toSummaryDto);
        }

        List<Destination> allMatches = destinationRepository.findWithFiltersList(cleanState, cleanRegion, minPopularity, cleanSearch, sort);
        List<DestinationSummaryDto> filtered = allMatches.stream()
                .filter(d -> matchesCategory(d, cleanCategory))
                .map(this::toSummaryDto)
                .collect(Collectors.toList());

        int start = Math.min(page * size, filtered.size());
        int end = Math.min(start + size, filtered.size());
        List<DestinationSummaryDto> pageContent = filtered.subList(start, end);

        return new PageImpl<>(pageContent, PageRequest.of(page, size, sort), filtered.size());
    }

    public boolean matchesCategory(Destination d, String category) {
        if (category == null || category.trim().isEmpty() || category.equalsIgnoreCase("all")) {
            return true;
        }
        String cat = category.trim().toLowerCase();

        List<String> tripTypes = d.getTripTypes() != null ? d.getTripTypes() : Collections.emptyList();
        List<String> primaryAttractions = d.getPrimaryAttractions() != null ? d.getPrimaryAttractions() : Collections.emptyList();
        List<String> activities = d.getActivitiesAvailable() != null ? d.getActivitiesAvailable() : Collections.emptyList();
        String description = d.getDescription() != null ? d.getDescription().toLowerCase() : "";
        String localCulture = d.getLocalCulture() != null ? d.getLocalCulture().toLowerCase() : "";
        String foodScene = d.getFoodScene() != null ? d.getFoodScene().toLowerCase() : "";
        String localCuisine = d.getLocalCuisineMustTry() != null ? d.getLocalCuisineMustTry().toLowerCase() : "";
        String uniqueExperiences = d.getUniqueExperiences() != null ? d.getUniqueExperiences().toLowerCase() : "";

        switch (cat) {
            case "beaches":
            case "beach":
            case "coastal":
                return containsAny(tripTypes, "beach", "beaches", "coastal", "coastal_fort", "island", "sea")
                        || containsAny(primaryAttractions, "beach", "coast", "island", "cove", "sea", "lighthouse")
                        || containsAny(activities, "beach", "surfing", "scuba", "snorkeling", "sea walkway", "water sports");

            case "heritage":
            case "history":
            case "historical":
                return containsAny(tripTypes, "heritage", "historical", "history", "unesco", "monuments", "fort", "forts", "palace", "palaces", "architecture", "archaeology", "colonial", "royal architecture", "ancient", "caves", "ruins", "monument")
                        || containsAny(primaryAttractions, "fort", "palace", "unesco", "monument", "ruins", "caves", "mahavihara", "heritage", "archaeological", "stupa", "tomb", "mahal")
                        || containsAny(activities, "heritage walk", "fort exploration", "palace tour", "unesco", "historical")
                        || description.contains("heritage") || description.contains("unesco") || description.contains("centuries-old") || description.contains("ancient ruins") || description.contains("fort");

            case "temples":
            case "temple":
            case "spiritual":
            case "pilgrimage":
            case "religious":
                return containsAny(tripTypes, "temple", "temples", "spiritual", "pilgrimage", "religious", "jyotirlinga", "monastery", "buddhist", "jain", "matha", "shrine", "darshan", "sacred")
                        || containsAny(primaryAttractions, "temple", "mandir", "darshan", "jyotirlinga", "shrine", "pilgrim", "spiritual", "monastery", "stupa", "swamy", "deity", "gurudwara", "church", "mosque", "basilica", "matha", "theertham", "kovil", "ghat", "dargah")
                        || containsAny(activities, "temple darshan", "darshan", "pilgrimage", "ganga aarti", "aarti", "pooja", "snanam", "prayer", "meditation")
                        || description.contains("pilgrimage") || description.contains("temple") || description.contains("spiritual") || description.contains("venerated") || description.contains("sacred");

            case "culture":
            case "cultural":
            case "arts":
            case "handicrafts":
                return containsAny(tripTypes, "culture", "cultural", "art", "arts", "handicrafts", "traditions", "tribal_culture", "living bridges", "folk", "craft", "crafts", "biennale", "music", "dance")
                        || containsAny(primaryAttractions, "culture", "cultural", "handicraft", "museum", "art gallery", "craft", "village", "haat", "theatre", "biennale", "university", "ashram")
                        || containsAny(activities, "cultural", "craft", "handloom", "dance", "folk", "pottery", "artisan", "weaving", "biennale", "theyyam", "kathakali", "handicraft")
                        || (!localCulture.isEmpty() && (description.contains("culture") || description.contains("cultural") || description.contains("tradition") || description.contains("artisan") || description.contains("craft")))
                        || uniqueExperiences.contains("tribal") || uniqueExperiences.contains("craft") || uniqueExperiences.contains("artisan") || uniqueExperiences.contains("tradition");

            case "adventure":
            case "trekking":
                return containsAny(tripTypes, "adventure", "trekking", "hiking", "river_rafting", "rafting", "water sports", "caving", "paragliding", "camping", "safari", "scuba", "climbing", "mountaineering", "snorkeling", "offbeat")
                        || containsAny(activities, "trekking", "hiking", "rafting", "water sports", "safari", "paragliding", "camping", "caving", "scuba", "kayaking", "bungee", "climbing", "snorkeling", "wildlife drive")
                        || containsAny(primaryAttractions, "rafting", "caves", "falls trek", "adventure");

            case "food":
            case "culinary":
            case "gastronomy":
                return containsAny(tripTypes, "food", "culinary", "food_walk", "cuisine", "gastronomy", "street food", "tea_gardens", "spice_plantation", "dining")
                        || containsAny(activities, "food", "culinary", "cuisine", "street food", "tasting", "tea tasting", "spice", "cooking", "thali", "sweets", "dining")
                        || containsAny(primaryAttractions, "food", "spice plantation", "tea garden", "bazaar", "market", "haat")
                        || (!localCuisine.isEmpty() && (description.contains("culinary") || description.contains("cuisine") || description.contains("street food") || description.contains("flavours") || description.contains("food") || description.contains("tea") || description.contains("spice") || !foodScene.isEmpty()))
                        || (!foodScene.isEmpty() && !foodScene.isBlank());

            case "nature":
            case "wildlife":
                return containsAny(tripTypes, "nature", "eco_tourism", "waterfall", "lagoon", "birdwatching", "wildlife", "western_ghats", "scenic", "forest", "valley", "lake", "national_park")
                        || containsAny(primaryAttractions, "falls", "waterfall", "sanctuary", "national park", "valley", "lake", "forest", "wildlife", "lagoon", "hills", "reserve")
                        || containsAny(activities, "birdwatching", "safari", "boat safari", "forest", "waterfall", "canopy walk");

            case "hill station":
            case "hill_station":
            case "mountains":
                return containsAny(tripTypes, "hill_station", "hill station", "himalayan", "mountains", "mountain", "valley", "peaks")
                        || containsAny(primaryAttractions, "hill", "peak", "valley", "viewpoint", "pass", "range")
                        || description.contains("hill station") || description.contains("himalayan") || description.contains("altitude");

            default:
                return containsAny(tripTypes, cat)
                        || containsAny(primaryAttractions, cat)
                        || containsAny(activities, cat)
                        || description.contains(cat);
        }
    }

    private boolean containsAny(List<String> list, String... keywords) {
        if (list == null || list.isEmpty()) {
            return false;
        }
        for (String item : list) {
            if (item == null) continue;
            String lower = item.toLowerCase();
            for (String kw : keywords) {
                if (lower.contains(kw.toLowerCase())) {
                    return true;
                }
            }
        }
        return false;
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
        String userName = "Verified Traveler";
        String userAvatar = null;
        try {
            if (r.getUser() != null) {
                userName = r.getUser().getFullName() != null ? r.getUser().getFullName() : "Verified Traveler";
                userAvatar = r.getUser().getAvatarUrl();
            }
        } catch (Exception e) {
            log.debug("Review user lazy proxy resolution ignored: {}", e.getMessage());
        }

        return ReviewDto.builder()
                .id(r.getId())
                .userName(userName)
                .userAvatar(userAvatar)
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

