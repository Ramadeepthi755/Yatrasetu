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
import java.util.regex.Pattern;

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
        if (cleanState != null) {
            if (cleanState.equalsIgnoreCase("andhra pradesh") || cleanState.equalsIgnoreCase("andhra-pradesh") || cleanState.equalsIgnoreCase("ap")) {
                cleanState = "IN-AP";
            }
        }
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
                .map(d -> {
                    DestinationSummaryDto dto = toSummaryDto(d);
                    if (cleanCategory.equalsIgnoreCase("beaches") || cleanCategory.equalsIgnoreCase("beach") || cleanCategory.equalsIgnoreCase("coastal") || cleanCategory.equalsIgnoreCase("coast")) {
                        String beachImg = getBeachImageForDestination(d);
                        if (beachImg != null && !beachImg.isEmpty()) {
                            dto.setHeroImageUrl(beachImg);
                        }
                    }
                    return dto;
                })
                .collect(Collectors.toList());

        int start = Math.min(page * size, filtered.size());
        int end = Math.min(start + size, filtered.size());
        List<DestinationSummaryDto> pageContent = filtered.subList(start, end);

        return new PageImpl<>(pageContent, PageRequest.of(page, size, sort), filtered.size());
    }

    private String getBeachImageForDestination(Destination d) {
        if (d == null || d.getId() == null) return null;
        String id = d.getId().toLowerCase();
        String name = d.getDestinationName() != null ? d.getDestinationName().toLowerCase() : "";

        if (id.equals("dest-160") || name.contains("puri")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/At_Puri_beach_04.jpg?width=800";
        }
        if (id.equals("dest-106") || name.equals("mumbai")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Juhu_Beach_in_Mumbai_15.jpg?width=800";
        }
        if (id.equals("dest-137") || name.contains("visakhapatnam") || name.contains("vizag")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/RK_Beach_Visakhapatnam.jpg?width=800";
        }
        if (id.equals("dest-157") || id.equals("dest-72") || name.contains("kovalam")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Kovalam_Beach_%2C_Kerala.jpg?width=800";
        }
        if (id.equals("dest-30") || name.contains("varkala")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Varkala_Beach%2C_Varkala%2C_Kerala.jpg?width=800";
        }
        if (id.equals("dest-26") || id.equals("dest-148") || name.contains("pondicherry") || name.contains("puducherry")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Rock_Beach%2C_in_Pondicherry_06.jpg?width=800";
        }
        if (id.equals("dest-25") || id.equals("dest-145") || name.contains("gokarna")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/PXL_20260103_101009613_People_and_Beach_Om_Beach_Gokarna%2C_Karnataka_19.jpg?width=800";
        }
        if (id.equals("dest-31") || name.contains("havelock")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Havelock_Island%2C_Radhanagar_Beach_before_sunset%2C_Andaman_Islands.jpg?width=800";
        }
        if (id.equals("dest-32") || name.contains("neil island")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Shaheed_Island%2C_Andamans%2C_Laxmanpur_Beach%2C_Rain.jpg?width=800";
        }
        if (id.equals("dest-154") || name.contains("udupi")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Malpe_Beach_Aerial_view.jpg?width=800";
        }
        if (id.equals("dest-158") || name.contains("bekal")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Beach_view_at_Bekal_Fort..JPG?width=800";
        }
        if (id.equals("dest-161") || name.contains("konark")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Chandrabhaga_Beach_%2817041041972%29.jpg?width=800";
        }
        if (id.equals("dest-162") || name.contains("chilika")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Chilika_Lake_%2811144%29.jpg?width=800";
        }
        if (id.equals("dest-86") || name.contains("mamallapuram") || name.contains("mahabalipuram")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Ideal_Beach_Coconuts_Mahabalipuram_Sep22_R16_06301.jpg?width=800";
        }
        if (id.equals("dest-108") || name.equals("chennai")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Marina_beach_chennai.jpg?width=800";
        }
        if (id.equals("dest-1") || name.equals("goa")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Palolem_Beach%2C_South_Goa.jpg?width=800";
        }
        if (id.equals("dest-87") || name.contains("hidden goa")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Butterfly_Beach_-_panoramio.jpg?width=800";
        }
        if (id.equals("dest-49") || name.contains("agatti")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Agatti_Island_%285800258314%29.jpg?width=800";
        }
        if (id.equals("dest-88") || name.contains("bangaram")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/A_beach_side_resort_at_Kadmat_Island%2C_Lakshadweep.jpg?width=800";
        }
        if (id.equals("dest-50") || name.contains("kalpeni")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Beach_at_Kalpeni_Island_IMG_20190929_094944.jpg?width=800";
        }
        if (id.equals("dest-83") || name.contains("maravanthe")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Maravanthe_Beach%281%29.jpg?width=800";
        }
        if (id.equals("dest-84") || name.contains("astaranga")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Ramachandi_sighting.jpg?width=800";
        }
        if (id.equals("dest-116") || name.contains("diu")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Nagoa_Beach%2C_Diu.jpg?width=800";
        }
        if (id.equals("dest-117") || name.contains("daman")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Jampore_Beach_Daman_India.jpg?width=800";
        }
        if (id.equals("dest-94") || name.contains("rameswaram")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Rameswaram_Beach.jpg?width=800";
        }
        if (id.equals("dest-63") || name.contains("port blair")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Corbyns_cove_beach-3-port_blair-andaman-India.jpg?width=800";
        }
        if (id.equals("dest-21") || name.contains("kanyakumari")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Kanyakumari_Sea_before_sunset.jpg?width=800";
        }
        if (id.equals("dest-52") || name.contains("kutch")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Mandvi_beach_kutch.jpg?width=800";
        }
        if (id.equals("dest-89") || name.contains("malanad")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Fisherman_at_Muzhappilangad_Beach.jpg?width=800";
        }
        if (id.equals("dest-23") || name.contains("dhanushkodi")) {
            return "https://commons.wikimedia.org/wiki/Special:FilePath/Dhanushkodi_Beach_2a.jpg?width=800";
        }

        return d.getHeroImageUrl();
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
        String destName = d.getDestinationName() != null ? d.getDestinationName().toLowerCase() : "";

        switch (cat) {
            case "beaches":
            case "beach":
            case "coastal":
            case "coast":
                // Exclude non-coastal inland places
                if (destName.contains("majuli") || destName.contains("nagarjuna") || destName.contains("loktak") || destName.contains("guwahati") || destName.contains("varanasi") || destName.contains("srisailam") || destName.contains("moirang")) {
                    return false;
                }
                return containsAnyWordBoundary(tripTypes, "beach", "beaches", "coastal", "coast", "shore", "cove", "seaside", "beachfront", "seafront", "maritime", "coromandel", "bay", "island")
                        || containsAnyWordBoundary(primaryAttractions, "beach", "beaches", "coastal", "coast", "shore", "cove", "seaside", "beachfront", "seafront", "bay", "maritime", "coromandel")
                        || containsAnyWordBoundary(activities, "beach", "beaches", "coastal", "surfing", "snorkeling", "scuba", "sea walkway", "boat ride", "beachfront", "seafront")
                        || containsAnyWordBoundary(Collections.singletonList(destName), "beach", "beaches", "coastal", "coast", "cove", "island")
                        || containsAnyWordBoundary(Collections.singletonList(description), "beach", "beaches", "coastal", "seafront", "beachfront", "coromandel");

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

    /**
     * Checks if any item in the list, when normalized to a lowercase underscore token,
     * exactly equals one of the given keywords. This prevents substring false positives
     * (e.g. "seasonal" matching "sea").
     */
    private boolean containsAnyExactToken(List<String> list, String... keywords) {
        if (list == null || list.isEmpty()) {
            return false;
        }
        for (String item : list) {
            if (item == null) continue;
            String normalized = item.toLowerCase().replaceAll("[^a-z0-9]+", "_").replaceAll("^_|_$", "");
            for (String kw : keywords) {
                if (normalized.equals(kw.toLowerCase())) {
                    return true;
                }
            }
            // Also check if any word token in the item matches
            String[] tokens = item.toLowerCase().split("[^a-z0-9]+");
            for (String token : tokens) {
                for (String kw : keywords) {
                    if (token.equals(kw.toLowerCase())) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Checks if any item in the list contains a keyword as a whole word
     * (using regex word boundaries). This prevents "sea" from matching "seasonal"
     * or "research", and "island" from matching non-coastal river islands.
     */
    private boolean containsAnyWordBoundary(List<String> list, String... keywords) {
        if (list == null || list.isEmpty()) {
            return false;
        }
        for (String item : list) {
            if (item == null) continue;
            String lower = item.toLowerCase();
            for (String kw : keywords) {
                Pattern p = Pattern.compile("\\b" + Pattern.quote(kw.toLowerCase()) + "\\b");
                if (p.matcher(lower).find()) {
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

