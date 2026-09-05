package com.yatrasetu.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.web.dto.TripDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiContextRetrievalService {

    private final DestinationRepository destinationRepository;
    private final StateRepository stateRepository;
    private final CityRepository cityRepository;
    private final DestinationPoiRepository destinationPoiRepository;
    private final FamousFoodRepository famousFoodRepository;
    private final HotelRepository hotelRepository;
    private final ExperienceRepository experienceRepository;
    private final LocalHostRepository localHostRepository;
    private final DestinationTransportRepository destinationTransportRepository;
    private final ObjectMapper objectMapper;
    private final com.yatrasetu.service.intelligence.DestinationHealthService destinationHealthService;
    private final com.yatrasetu.service.intelligence.TourismRedistributionService tourismRedistributionService;

    @Value("${app.open-meteo.base-url:https://api.open-meteo.com/v1}")
    private String openMeteoBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final Set<String> STOP_WORDS = Set.of(
            "what", "where", "which", "when", "who", "whom", "how", "why",
            "are", "is", "was", "were", "be", "been", "being",
            "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
            "of", "with", "by", "from", "up", "about", "into", "over", "after",
            "can", "could", "would", "should", "will", "shall", "do", "does", "did",
            "i", "you", "he", "she", "it", "we", "they", "me", "my", "your", "our",
            "best", "top", "good", "great", "places", "place", "destinations", "destination",
            "visit", "travel", "see", "show", "tell", "give", "have", "suggest", "recommend"
    );

    @Transactional(readOnly = true)
    public Map<String, Object> retrieveContext(String message, String destinationId, String cityId, String role) {
        Map<String, Object> context = new HashMap<>();
        context.put("role", role != null ? role : "GUEST");

        LocalDate today = LocalDate.now();
        String currentMonthName = today.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        context.put("serverDate", today.toString());
        context.put("currentMonth", currentMonthName);

        String cleanMsg = (message != null ? message.trim() : "");
        String lowerMsg = cleanMsg.toLowerCase();
        String alphaNumericMsg = lowerMsg.replaceAll("[^a-zA-Z0-9\\s]", " ");
        String collapsedMsg = lowerMsg.replaceAll("[^a-zA-Z0-9]", "");

        // 1. Resolve matching destinations through general retrieval engine
        RetrievalResult result = resolveMatchingDestinations(cleanMsg, lowerMsg, alphaNumericMsg, collapsedMsg, destinationId, cityId, currentMonthName);

        context.put("queryType", result.queryType);
        if (result.matchedState != null) {
            context.put("matchedState", result.matchedState);
        }
        if (result.categoryTitle != null) {
            context.put("categoryTitle", result.categoryTitle);
        }

        List<Destination> matchedDestinations = result.destinations;

        if (matchedDestinations.isEmpty()) {
            boolean isPartnerTopic = "PARTNER".equalsIgnoreCase(role) && (
                    lowerMsg.contains("guide") || lowerMsg.contains("profile") || lowerMsg.contains("host") ||
                    lowerMsg.contains("listing") || lowerMsg.contains("partner") || lowerMsg.contains("payout") ||
                    lowerMsg.contains("verify") || lowerMsg.contains("register") || lowerMsg.contains("business") ||
                    lowerMsg.contains("earnings")
            );
            boolean isGovernmentTopic = "GOVERNMENT".equalsIgnoreCase(role) && (
                    lowerMsg.contains("sustainability") || lowerMsg.contains("capacity") || lowerMsg.contains("footfall") ||
                    lowerMsg.contains("intelligence") || lowerMsg.contains("demand") || lowerMsg.contains("forecast") ||
                    lowerMsg.contains("pressure") || lowerMsg.contains("redistribution") || lowerMsg.contains("policy") ||
                    lowerMsg.contains("action")
            );
            boolean isGeneralGreeting = cleanMsg.toLowerCase().matches("^(hi|hello|hey|namaste|greetings|help|who are you|what can you do).*");

            if (isPartnerTopic) {
                context.put("noMatchesFound", false);
                context.put("queryType", "PARTNER_ADVISORY");
            } else if (isGovernmentTopic) {
                context.put("noMatchesFound", false);
                context.put("queryType", "GOVERNMENT_INSIGHTS");
            } else if (isGeneralGreeting) {
                context.put("noMatchesFound", false);
                context.put("queryType", "GENERAL_GREETING");
            } else {
                // Explicit zero-match signal for destination / travel queries where genuinely no data was found
                context.put("noMatchesFound", true);
                context.put("destinations", Collections.emptyList());
                log.info("No matching destinations found for query: '{}'", message);
            }
        } else {
            context.put("noMatchesFound", false);
            context.put("matchedCount", matchedDestinations.size());

            // 2. Hydrate matched destinations with structured facts (POIs, authentic foods, seasons)
            List<Map<String, Object>> hydratedList = new ArrayList<>();
            for (Destination d : matchedDestinations.stream().limit(6).toList()) {
                hydratedList.add(hydrateDestinationSummary(d));
            }
            context.put("destinations", hydratedList);

            // Backward compatibility for single destination / primary destination
            Destination primary = matchedDestinations.get(0);
            context.put("destination", hydratedList.get(0));
            context.put("destinationId", primary.getId());
            context.put("destinationName", primary.getDestinationName());

            // Primary POIs and authentic foods
            List<DestinationPoi> primaryPois = destinationPoiRepository.findByDestinationId(primary.getId());
            context.put("pois", primaryPois.stream().limit(6).map(this::formatPoiInfo).collect(Collectors.toList()));

            List<FamousFood> primaryFoods = famousFoodRepository.findByDestinationId(primary.getId());
            context.put("foods", primaryFoods.stream().limit(4).map(this::formatFoodInfo).collect(Collectors.toList()));

            // Live Weather integration (Open-Meteo) for the primary destination
            if (primary.getLatitude() != null && primary.getLongitude() != null) {
                TripDto.WeatherSummaryDto weather = fetchLiveWeather(primary.getLatitude(), primary.getLongitude());
                if (weather != null) {
                    context.put("weather", weather);
                }
            }

            // If single target destination, also hydrate hotels, experiences, hosts, and transports
            if (result.isSingleTarget || matchedDestinations.size() == 1) {
                List<Hotel> hotels = hotelRepository.findByDestinationId(primary.getId());
                context.put("hotels", hotels.stream().limit(5).map(this::formatHotelInfo).collect(Collectors.toList()));

                List<Experience> experiences = experienceRepository.findByDestinationId(primary.getId());
                context.put("experiences", experiences.stream().limit(5).map(this::formatExperienceInfo).collect(Collectors.toList()));

                List<LocalHost> hosts = localHostRepository.findByDestinationId(primary.getId());
                context.put("hosts", hosts.stream().limit(5).map(this::formatHostInfo).collect(Collectors.toList()));

                List<DestinationTransport> transports = destinationTransportRepository.findByDestinationId(primary.getId());
                context.put("transports", transports.stream().map(this::formatTransportInfo).collect(Collectors.toList()));
            }
        }

        // 3. Government Role: Enrich with structured intelligence facts
        if ("GOVERNMENT".equalsIgnoreCase(role)) {
            try {
                if (!matchedDestinations.isEmpty()) {
                    var health = destinationHealthService.calculateHealth(matchedDestinations.get(0).getId(), true);
                    context.put("governmentDestinationHealth", health);
                }
                var recommendations = tourismRedistributionService.getActiveRecommendations(true);
                context.put("activeRedistributionOpportunities", recommendations.stream().limit(5).toList());
            } catch (Exception e) {
                log.debug("Government intelligence context enrichment failed: {}", e.getMessage());
            }
        }

        return context;
    }

    private static class RetrievalResult {
        String queryType;
        String matchedState;
        String categoryTitle;
        boolean isSingleTarget;
        List<Destination> destinations = new ArrayList<>();
    }

    private RetrievalResult resolveMatchingDestinations(
            String cleanMsg,
            String lowerMsg,
            String alphaNumericMsg,
            String collapsedMsg,
            String destinationId,
            String cityId,
            String currentMonthName) {

        RetrievalResult result = new RetrievalResult();

        // A. Direct Destination ID provided (e.g. from page context)
        if (destinationId != null && !destinationId.trim().isEmpty()) {
            destinationRepository.findById(destinationId).ifPresent(d -> {
                result.destinations.add(d);
                result.queryType = "SPECIFIC_DESTINATION";
                result.isSingleTarget = true;
            });
            if (!result.destinations.isEmpty()) {
                return result;
            }
        }

        List<Destination> allActive = destinationRepository.findAllActiveWithDetails();
        List<State> allStates = stateRepository.findAll();

        // B. Check for State Query (e.g. "destinations in Tamil Nadu", "which destination can i visit in tamilnadu")
        State matchedState = detectStateInQuery(cleanMsg, alphaNumericMsg, collapsedMsg, allStates);
        if (matchedState != null) {
            result.matchedState = matchedState.getStateName();
            result.queryType = "STATE_SEARCH";
            List<Destination> stateDests = destinationRepository.findByStateIdWithDetails(matchedState.getId());
            if (!stateDests.isEmpty()) {
                result.destinations = stateDests;
                return result;
            }
        }

        // C. Check for Specific Destination Name mentioned directly in query (e.g. "Tell me about Goa", "Tell me about Mysore")
        Destination directNameMatch = detectSpecificDestinationName(lowerMsg, alphaNumericMsg, allActive);
        if (directNameMatch != null && isDirectDestinationInquiry(lowerMsg, directNameMatch.getDestinationName())) {
            result.destinations.add(directNameMatch);
            result.queryType = "SPECIFIC_DESTINATION";
            result.isSingleTarget = true;
            return result;
        }

        // D. Check for Seasonal / Timing Query (e.g. "What are the best heritage destinations to visit this month?")
        boolean isSeasonal = lowerMsg.contains("this month") || lowerMsg.contains("current month") ||
                lowerMsg.contains("now") || lowerMsg.contains("season") || lowerMsg.contains("autumn") ||
                lowerMsg.contains("winter") || lowerMsg.contains("summer") || lowerMsg.contains("monsoon") ||
                hasMonthName(lowerMsg);

        boolean isHeritage = lowerMsg.contains("heritage") || lowerMsg.contains("historic") ||
                lowerMsg.contains("monument") || lowerMsg.contains("unesco") || lowerMsg.contains("ancient") ||
                lowerMsg.contains("architecture") || lowerMsg.contains("palace") || lowerMsg.contains("fort") ||
                lowerMsg.contains("dynasty");

        if (isSeasonal) {
            String targetMonth = extractTargetMonth(lowerMsg, currentMonthName);
            if (isHeritage) {
                result.queryType = "SEASONAL_HERITAGE_SEARCH";
                result.categoryTitle = "Heritage Destinations for " + targetMonth;
                // Filter heritage destinations and rank by seasonal suitability
                result.destinations = allActive.stream()
                        .filter(d -> hasTripType(d, "Heritage", "History", "Architecture", "Cultural") ||
                                isHeritageDescription(d))
                        .sorted((d1, d2) -> {
                            int s2 = scoreSeasonalSuitability(d2, targetMonth);
                            int s1 = scoreSeasonalSuitability(d1, targetMonth);
                            if (s2 != s1) return Integer.compare(s2, s1);
                            BigDecimal p2 = d2.getPopularityScore() != null ? d2.getPopularityScore() : BigDecimal.ZERO;
                            BigDecimal p1 = d1.getPopularityScore() != null ? d1.getPopularityScore() : BigDecimal.ZERO;
                            return p2.compareTo(p1);
                        })
                        .limit(6)
                        .collect(Collectors.toList());
            } else {
                result.queryType = "SEASONAL_SEARCH";
                result.categoryTitle = "Destinations for " + targetMonth;
                result.destinations = allActive.stream()
                        .sorted((d1, d2) -> {
                            int s2 = scoreSeasonalSuitability(d2, targetMonth);
                            int s1 = scoreSeasonalSuitability(d1, targetMonth);
                            if (s2 != s1) return Integer.compare(s2, s1);
                            BigDecimal p2 = d2.getPopularityScore() != null ? d2.getPopularityScore() : BigDecimal.ZERO;
                            BigDecimal p1 = d1.getPopularityScore() != null ? d1.getPopularityScore() : BigDecimal.ZERO;
                            return p2.compareTo(p1);
                        })
                        .limit(6)
                        .collect(Collectors.toList());
            }
            if (!result.destinations.isEmpty()) {
                return result;
            }
        }

        // E. Theme / Category Queries
        if (isHeritage) {
            result.queryType = "CATEGORY_SEARCH";
            result.categoryTitle = "Heritage & Historic Architecture";
            result.destinations = allActive.stream()
                    .filter(d -> hasTripType(d, "Heritage", "History", "Architecture", "Cultural") || isHeritageDescription(d))
                    .sorted(Comparator.comparing(Destination::getPopularityScore, Comparator.nullsLast(Comparator.reverseOrder())))
                    .limit(6)
                    .collect(Collectors.toList());
            return result;
        }

        // Peaceful / Offbeat / Hidden Gems
        if (lowerMsg.contains("peaceful") || lowerMsg.contains("quiet") || lowerMsg.contains("serene") ||
                lowerMsg.contains("calm") || lowerMsg.contains("relax") || lowerMsg.contains("hidden gem") ||
                lowerMsg.contains("offbeat") || lowerMsg.contains("less crowded") || lowerMsg.contains("unexplored")) {
            result.queryType = "CATEGORY_SEARCH";
            result.categoryTitle = "Peaceful & Offbeat Retreats";
            result.destinations = allActive.stream()
                    .filter(d -> (d.getHiddenGems() != null && !d.getHiddenGems().trim().isEmpty()) ||
                            hasTripType(d, "Offbeat", "Nature", "Relaxation") ||
                            hasIdealFor(d, "Offbeat_explorers", "Nature_lovers"))
                    .sorted(Comparator.comparing(Destination::getPopularityScore, Comparator.nullsLast(Comparator.reverseOrder())))
                    .limit(6)
                    .collect(Collectors.toList());
            return result;
        }

        // Spiritual / Pilgrimage / Temples
        if (lowerMsg.contains("spiritual") || lowerMsg.contains("temple") || lowerMsg.contains("pilgrimage") ||
                lowerMsg.contains("religious") || lowerMsg.contains("sacred") || lowerMsg.contains("holy") ||
                lowerMsg.contains("ashram") || lowerMsg.contains("darshan")) {
            result.queryType = "CATEGORY_SEARCH";
            result.categoryTitle = "Spiritual & Pilgrimage Sacred Circuits";
            result.destinations = allActive.stream()
                    .filter(d -> hasTripType(d, "Spiritual", "Pilgrimage", "Temples") ||
                            (d.getDescription() != null && (d.getDescription().toLowerCase().contains("temple") || d.getDescription().toLowerCase().contains("pilgrim"))))
                    .sorted(Comparator.comparing(Destination::getPopularityScore, Comparator.nullsLast(Comparator.reverseOrder())))
                    .limit(6)
                    .collect(Collectors.toList());
            return result;
        }

        // Coastal / Beaches
        if (lowerMsg.contains("beach") || lowerMsg.contains("beaches") || lowerMsg.contains("coast") ||
                lowerMsg.contains("coastal") || lowerMsg.contains("sea") || lowerMsg.contains("ocean")) {
            result.queryType = "CATEGORY_SEARCH";
            result.categoryTitle = "Coastal & Beach Destinations";
            result.destinations = allActive.stream()
                    .filter(d -> hasTripType(d, "Coast", "Beach", "Coastal"))
                    .sorted(Comparator.comparing(Destination::getPopularityScore, Comparator.nullsLast(Comparator.reverseOrder())))
                    .limit(6)
                    .collect(Collectors.toList());
            return result;
        }

        // Hill Stations & Mountains
        if (lowerMsg.contains("hill station") || lowerMsg.contains("hill") || lowerMsg.contains("hills") ||
                lowerMsg.contains("mountain") || lowerMsg.contains("mountains") || lowerMsg.contains("trekking")) {
            result.queryType = "CATEGORY_SEARCH";
            result.categoryTitle = "Hill Stations & Mountain Retreats";
            result.destinations = allActive.stream()
                    .filter(d -> hasTripType(d, "Hill_station", "Hills", "Mountain") ||
                            (d.getAltitudeM() != null && d.getAltitudeM() >= 1000))
                    .sorted(Comparator.comparing(Destination::getPopularityScore, Comparator.nullsLast(Comparator.reverseOrder())))
                    .limit(6)
                    .collect(Collectors.toList());
            return result;
        }

        // Wildlife & Eco-Tourism
        if (lowerMsg.contains("wildlife") || lowerMsg.contains("safari") || lowerMsg.contains("sanctuary") ||
                lowerMsg.contains("national park") || lowerMsg.contains("animals") || lowerMsg.contains("birds")) {
            result.queryType = "CATEGORY_SEARCH";
            result.categoryTitle = "Wildlife Sanctuaries & National Parks";
            result.destinations = allActive.stream()
                    .filter(d -> hasTripType(d, "Wildlife", "Eco-Tourism", "Nature"))
                    .sorted(Comparator.comparing(Destination::getPopularityScore, Comparator.nullsLast(Comparator.reverseOrder())))
                    .limit(6)
                    .collect(Collectors.toList());
            return result;
        }

        // F. Single destination fallback check if destination name appeared anywhere
        if (directNameMatch != null) {
            result.destinations.add(directNameMatch);
            result.queryType = "SPECIFIC_DESTINATION";
            result.isSingleTarget = true;
            return result;
        }

        // G. Keyword Search Fallback using content tokens
        List<String> tokens = Arrays.stream(alphaNumericMsg.split("\\s+"))
                .filter(t -> t.length() >= 3 && !STOP_WORDS.contains(t))
                .toList();

        if (!tokens.isEmpty()) {
            Set<String> seenIds = new HashSet<>();
            List<Destination> keywordMatches = new ArrayList<>();

            for (String token : tokens) {
                List<Destination> found = destinationRepository.searchDestinations(token, PageRequest.of(0, 4));
                for (Destination d : found) {
                    if (seenIds.add(d.getId())) {
                        keywordMatches.add(d);
                    }
                }
                if (keywordMatches.size() >= 5) break;
            }

            // Also check POIs
            if (keywordMatches.size() < 3) {
                for (String token : tokens) {
                    List<DestinationPoi> pois = destinationPoiRepository.searchPois(token, PageRequest.of(0, 3));
                    for (DestinationPoi p : pois) {
                        if (p.getDestination() != null && seenIds.add(p.getDestination().getId())) {
                            destinationRepository.findById(p.getDestination().getId()).ifPresent(keywordMatches::add);
                        }
                    }
                    if (keywordMatches.size() >= 5) break;
                }
            }

            if (!keywordMatches.isEmpty()) {
                result.destinations = keywordMatches;
                result.queryType = "KEYWORD_SEARCH";
                return result;
            }
        }

        // H. Zero matches found
        result.queryType = "NO_MATCH";
        return result;
    }

    private State detectStateInQuery(String cleanMsg, String alphaNumericMsg, String collapsedMsg, List<State> states) {
        for (State s : states) {
            if (s == null || s.getStateName() == null) continue;
            String sName = s.getStateName().toLowerCase();
            String sCollapsed = sName.replaceAll("[^a-zA-Z0-9]", "");

            if (collapsedMsg.contains(sCollapsed) || alphaNumericMsg.matches(".*\\b" + Pattern.quote(sName) + "\\b.*")) {
                return s;
            }

            // Aliases
            if ("tamil nadu".equals(sName) && (alphaNumericMsg.matches(".*\\btn\\b.*") || collapsedMsg.contains("tamilnadu"))) {
                return s;
            }
            if ("karnataka".equals(sName) && (alphaNumericMsg.matches(".*\\bka\\b.*") || collapsedMsg.contains("karnataka"))) {
                return s;
            }
            if ("kerala".equals(sName) && (alphaNumericMsg.matches(".*\\bkl\\b.*") || collapsedMsg.contains("kerala"))) {
                return s;
            }
            if ("himachal pradesh".equals(sName) && (alphaNumericMsg.matches(".*\\bhimachal\\b.*") || collapsedMsg.contains("himachalpradesh"))) {
                return s;
            }
            if ("uttarakhand".equals(sName) && (alphaNumericMsg.matches(".*\\b(uttaranchal|uk)\\b.*") || collapsedMsg.contains("uttarakhand"))) {
                return s;
            }
            if ("uttar pradesh".equals(sName) && (alphaNumericMsg.matches(".*\\bup\\b.*") || collapsedMsg.contains("uttarpradesh"))) {
                return s;
            }
            if ("madhya pradesh".equals(sName) && (alphaNumericMsg.matches(".*\\bmp\\b.*") || collapsedMsg.contains("madhyapradesh"))) {
                return s;
            }
            if ("jammu & kashmir".equals(sName) && (alphaNumericMsg.matches(".*\\b(kashmir|jammu)\\b.*") || collapsedMsg.contains("jammukashmir"))) {
                return s;
            }
            if ("west bengal".equals(sName) && (alphaNumericMsg.matches(".*\\bbengal\\b.*") || collapsedMsg.contains("westbengal"))) {
                return s;
            }
        }
        return null;
    }

    private Destination detectSpecificDestinationName(String lowerMsg, String alphaNumericMsg, List<Destination> destinations) {
        Destination bestMatch = null;
        int maxLen = 0;

        for (Destination d : destinations) {
            String name = d.getDestinationName();
            if (name == null) continue;
            String baseName = name.replaceAll("\\(.*?\\)", "").trim().toLowerCase();

            if (baseName.length() >= 3 && alphaNumericMsg.matches(".*\\b" + Pattern.quote(baseName) + "\\b.*")) {
                if (baseName.length() > maxLen) {
                    maxLen = baseName.length();
                    bestMatch = d;
                }
            }
        }
        return bestMatch;
    }

    private boolean isDirectDestinationInquiry(String lowerMsg, String destName) {
        if (destName == null) return false;
        String dLower = destName.toLowerCase();
        return lowerMsg.contains("tell me about " + dLower) ||
                lowerMsg.contains("about " + dLower) ||
                lowerMsg.contains("visit " + dLower) ||
                lowerMsg.contains("explore " + dLower) ||
                lowerMsg.contains("in " + dLower) ||
                lowerMsg.contains(dLower + " itinerary") ||
                lowerMsg.contains("to " + dLower);
    }

    private boolean hasTripType(Destination d, String... keywords) {
        if (d == null) return false;
        List<String> types = d.getTripTypes();
        if (types != null) {
            for (String t : types) {
                if (t == null) continue;
                for (String kw : keywords) {
                    if (t.toLowerCase().contains(kw.toLowerCase())) return true;
                }
            }
        }
        return false;
    }

    private boolean hasIdealFor(Destination d, String... keywords) {
        if (d == null || d.getIdealFor() == null) return false;
        for (String item : d.getIdealFor()) {
            if (item == null) continue;
            for (String kw : keywords) {
                if (item.toLowerCase().contains(kw.toLowerCase())) return true;
            }
        }
        return false;
    }

    private boolean isHeritageDescription(Destination d) {
        if (d == null || d.getDescription() == null) return false;
        String desc = d.getDescription().toLowerCase();
        return desc.contains("unesco") || desc.contains("heritage") || desc.contains("temple") ||
                desc.contains("monument") || desc.contains("palace") || desc.contains("fort") ||
                desc.contains("historic");
    }

    private int scoreSeasonalSuitability(Destination d, String targetMonth) {
        if (d == null || targetMonth == null) return 0;
        int score = 0;
        String mLower = targetMonth.toLowerCase();
        String best = d.getBestSeasons() != null ? d.getBestSeasons().toLowerCase() : "";
        String peak = d.getPeakSeason() != null ? d.getPeakSeason().toLowerCase() : "";
        String avoid = d.getAvoidSeasons() != null ? d.getAvoidSeasons().toLowerCase() : "";

        if (best.contains(mLower) || peak.contains(mLower)) {
            score += 5;
        }
        if (best.contains("year-round") || best.contains("pleasant year-round") || best.contains("all year")) {
            score += 3;
        }
        if (mLower.equals("september")) {
            if (best.contains("post-monsoon") || best.contains("autumn") || best.contains("october to march") || best.contains("september")) {
                score += 4;
            }
        }
        if (avoid.contains(mLower)) {
            score -= 5;
        }
        return score;
    }

    private boolean hasMonthName(String text) {
        return text.contains("january") || text.contains("february") || text.contains("march") ||
                text.contains("april") || text.contains("may") || text.contains("june") ||
                text.contains("july") || text.contains("august") || text.contains("september") ||
                text.contains("october") || text.contains("november") || text.contains("december");
    }

    private String extractTargetMonth(String lowerMsg, String defaultMonth) {
        String[] months = {"january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"};
        for (String m : months) {
            if (lowerMsg.contains(m)) {
                return m.substring(0, 1).toUpperCase() + m.substring(1);
            }
        }
        return defaultMonth;
    }

    private Map<String, Object> hydrateDestinationSummary(Destination d) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", d.getId());
        m.put("name", d.getDestinationName());
        m.put("state", d.getState() != null ? d.getState().getStateName() : "");
        m.put("city", d.getCity() != null ? d.getCity().getCityName() : "");
        m.put("region", d.getRegion());
        m.put("description", d.getDescription());
        m.put("tripTypes", d.getTripTypes());
        m.put("bestTimeToVisit", d.getBestSeasons() != null ? d.getBestSeasons() : d.getPeakSeason());
        m.put("idealDurationDays", d.getIdealDays());
        m.put("hiddenGems", d.getHiddenGems());

        // Key POIs
        List<DestinationPoi> pois = destinationPoiRepository.findByDestinationId(d.getId());
        m.put("pois", pois.stream().limit(3).map(this::formatPoiInfo).collect(Collectors.toList()));

        // Authentic Food
        List<FamousFood> foods = famousFoodRepository.findByDestinationId(d.getId());
        m.put("foods", foods.stream().limit(2).map(this::formatFoodInfo).collect(Collectors.toList()));

        return m;
    }

    public TripDto.WeatherSummaryDto fetchLiveWeather(BigDecimal latitude, BigDecimal longitude) {
        if (latitude == null || longitude == null) {
            return null;
        }
        try {
            String url = String.format("%s/forecast?latitude=%.4f&longitude=%.4f&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m",
                    openMeteoBaseUrl, latitude.doubleValue(), longitude.doubleValue());

            String response = restTemplate.getForObject(url, String.class);
            if (response != null) {
                JsonNode root = objectMapper.readTree(response);
                if (root.has("current")) {
                    JsonNode current = root.get("current");
                    double temp = current.has("temperature_2m") ? current.get("temperature_2m").asDouble() : 25.0;
                    int code = current.has("weather_code") ? current.get("weather_code").asInt() : 0;
                    String condition = mapWmoWeatherCode(code);
                    String advice = generateWeatherAdvice(temp, code);

                    return TripDto.WeatherSummaryDto.builder()
                            .temperatureC(temp)
                            .condition(condition)
                            .source("Open-Meteo Live API")
                            .advice(advice)
                            .build();
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch live weather from Open-Meteo: {}", e.getMessage());
        }
        return null;
    }

    private String mapWmoWeatherCode(int code) {
        return switch (code) {
            case 0 -> "Clear sky";
            case 1, 2, 3 -> "Partly cloudy";
            case 45, 48 -> "Foggy";
            case 51, 53, 55 -> "Light Drizzle";
            case 61, 63, 65 -> "Rain";
            case 71, 73, 75 -> "Snowfall";
            case 80, 81, 82 -> "Rain showers";
            case 95, 96, 99 -> "Thunderstorm";
            default -> "Pleasant / Fair";
        };
    }

    private String generateWeatherAdvice(double temp, int code) {
        if (code >= 95) {
            return "Thunderstorms expected. Prioritize indoor heritage spots and avoid open vantage points during rain.";
        } else if (code >= 61) {
            return "Rain showers forecast. Carry waterproof gear and check monument opening times.";
        } else if (temp > 35) {
            return "Warm temperatures. Plan monument explorations during early morning or evening; stay hydrated.";
        } else if (temp < 15) {
            return "Pleasant to cool climate. Great for daytime sightseeing; keep a light jacket for late evenings.";
        }
        return "Ideal sightseeing conditions. Perfect for walking tours and outdoor architectural explorations.";
    }

    private Map<String, Object> formatPoiInfo(DestinationPoi p) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", p.getId());
        m.put("name", p.getPoiName());
        m.put("category", p.getCategory());
        m.put("entryFeeInr", p.getEntryFeeInr());
        m.put("typicalDurationHours", p.getTypicalDurationHours());
        m.put("characteristics", p.getCharacteristics());
        return m;
    }

    private Map<String, Object> formatFoodInfo(FamousFood f) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", f.getId());
        m.put("name", f.getDishName());
        m.put("type", f.getCuisineType());
        m.put("bestPlaces", f.getDescription());
        return m;
    }

    private Map<String, Object> formatHotelInfo(Hotel h) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", h.getId());
        m.put("name", h.getHotelName());
        m.put("starRating", h.getHotelRating());
        m.put("priceRange", h.getPricePerNight());
        return m;
    }

    private Map<String, Object> formatExperienceInfo(Experience e) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", e.getId());
        m.put("title", e.getTitle());
        m.put("priceInr", e.getPricePerPerson());
        m.put("durationHours", e.getDurationHours());
        return m;
    }

    private Map<String, Object> formatHostInfo(LocalHost h) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", h.getId());
        m.put("name", h.getName());
        m.put("languages", h.getLanguages());
        m.put("badge", h.getRoleTitle());
        return m;
    }

    private Map<String, Object> formatTransportInfo(DestinationTransport t) {
        Map<String, Object> m = new HashMap<>();
        m.put("mode", t.getMode().name());
        m.put("name", t.getName());
        m.put("distanceKm", t.getDistanceKm());
        m.put("connectivityNotes", t.getDescription());
        return m;
    }
}
