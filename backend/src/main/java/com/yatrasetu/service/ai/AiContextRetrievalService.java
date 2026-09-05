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
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiContextRetrievalService {

    private final DestinationRepository destinationRepository;
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

    public Map<String, Object> retrieveContext(String message, String destinationId, String cityId, String role) {
        Map<String, Object> context = new HashMap<>();
        context.put("role", role != null ? role : "GUEST");

        Destination destination = null;
        if (destinationId != null && !destinationId.trim().isEmpty()) {
            destination = destinationRepository.findById(destinationId).orElse(null);
        }

        if (destination == null && message != null) {
            // Attempt simple name match in query
            List<Destination> matches = destinationRepository.searchDestinations(message, PageRequest.of(0, 1));
            if (!matches.isEmpty()) {
                destination = matches.get(0);
            }
        }

        if (destination != null) {
            context.put("destination", formatDestinationInfo(destination));
            context.put("destinationId", destination.getId());
            context.put("destinationName", destination.getDestinationName());

            // Real POIs
            List<DestinationPoi> pois = destinationPoiRepository.findByDestinationId(destination.getId());
            if (pois.isEmpty() && destination.getCity() != null) {
                pois = destinationPoiRepository.findByCityId(destination.getCity().getId());
            }
            if (pois.isEmpty() && destination.getLatitude() != null && destination.getLongitude() != null) {
                pois = destinationPoiRepository.findNearestPois(
                        destination.getLatitude().doubleValue(),
                        destination.getLongitude().doubleValue(),
                        15
                );
            }
            context.put("pois", pois.stream().map(this::formatPoiInfo).collect(Collectors.toList()));

            // Authentic Food
            List<FamousFood> foods = famousFoodRepository.findByDestinationId(destination.getId());
            context.put("foods", foods.stream().map(this::formatFoodInfo).collect(Collectors.toList()));

            // Hotels
            List<Hotel> hotels = hotelRepository.findByDestinationId(destination.getId());
            context.put("hotels", hotels.stream().limit(5).map(this::formatHotelInfo).collect(Collectors.toList()));

            // Experiences
            List<Experience> experiences = experienceRepository.findByDestinationId(destination.getId());
            context.put("experiences", experiences.stream().limit(5).map(this::formatExperienceInfo).collect(Collectors.toList()));

            // Local Hosts
            List<LocalHost> hosts = localHostRepository.findByDestinationId(destination.getId());
            context.put("hosts", hosts.stream().limit(5).map(this::formatHostInfo).collect(Collectors.toList()));

            // Transports
            List<DestinationTransport> transports = destinationTransportRepository.findByDestinationId(destination.getId());
            context.put("transports", transports.stream().map(this::formatTransportInfo).collect(Collectors.toList()));

            // Live Weather
            TripDto.WeatherSummaryDto weather = fetchLiveWeather(destination.getLatitude(), destination.getLongitude());
            if (weather != null) {
                context.put("weather", weather);
            }
        }

        // Government Role: Enrich with structured intelligence facts
        if ("GOVERNMENT".equalsIgnoreCase(role)) {
            try {
                if (destination != null) {
                    var health = destinationHealthService.calculateHealth(destination.getId(), true);
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

    private Map<String, Object> formatDestinationInfo(Destination d) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", d.getId());
        m.put("name", d.getDestinationName());
        m.put("state", d.getState() != null ? d.getState().getStateName() : "");
        m.put("city", d.getCity() != null ? d.getCity().getCityName() : "");
        m.put("description", d.getDescription());
        m.put("bestTimeToVisit", d.getBestSeasons() != null ? d.getBestSeasons() : d.getPeakSeason());
        m.put("idealDurationDays", d.getIdealDays());
        return m;
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
