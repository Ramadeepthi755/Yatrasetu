package com.yatrasetu.service;

import com.yatrasetu.domain.SourceType;
import com.yatrasetu.web.dto.HotelDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class GooglePlacesService {

    @Value("${app.google.maps-api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplateBuilder()
            .setConnectTimeout(Duration.ofSeconds(4))
            .setReadTimeout(Duration.ofSeconds(6))
            .build();

    public boolean isConfigured() {
        return apiKey != null && !apiKey.trim().isBlank();
    }

    /**
     * Discovers hotels in vicinity of destination coordinates using Google Places API.
     * Only invoked if a valid Google Maps API Key is configured in environment.
     * Does NOT invent or fabricate places if key is unconfigured.
     */
    public List<HotelDto> searchNearbyHotels(double latitude, double longitude, int radiusMeters, String destinationId, String destinationName) {
        if (!isConfigured()) {
            log.debug("Google Places API Key is not configured. Gracefully skipping external discovery.");
            return Collections.emptyList();
        }

        try {
            String url = String.format(
                    "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=%f,%f&radius=%d&type=lodging&key=%s",
                    latitude, longitude, radiusMeters > 0 ? radiusMeters : 10000, apiKey.trim()
            );

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.warn("Google Places API responded with status: {}", response.getStatusCode());
                return Collections.emptyList();
            }

            Map<String, Object> body = response.getBody();
            String status = (String) body.get("status");
            if (!"OK".equalsIgnoreCase(status) && !"ZERO_RESULTS".equalsIgnoreCase(status)) {
                log.warn("Google Places API status: {} - {}", status, body.get("error_message"));
                return Collections.emptyList();
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> results = (List<Map<String, Object>>) body.get("results");
            if (results == null || results.isEmpty()) {
                return Collections.emptyList();
            }

            List<HotelDto> discoveredHotels = new ArrayList<>();
            for (Map<String, Object> place : results) {
                String placeId = (String) place.get("place_id");
                String name = (String) place.get("name");
                String vicinity = (String) place.get("vicinity");
                Number ratingNum = (Number) place.get("rating");

                BigDecimal rating = ratingNum != null ? BigDecimal.valueOf(ratingNum.doubleValue()) : null;

                BigDecimal lat = null;
                BigDecimal lng = null;
                @SuppressWarnings("unchecked")
                Map<String, Object> geometry = (Map<String, Object>) place.get("geometry");
                if (geometry != null) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> location = (Map<String, Object>) geometry.get("location");
                    if (location != null) {
                        Number latNum = (Number) location.get("lat");
                        Number lngNum = (Number) location.get("lng");
                        if (latNum != null) lat = BigDecimal.valueOf(latNum.doubleValue());
                        if (lngNum != null) lng = BigDecimal.valueOf(lngNum.doubleValue());
                    }
                }

                HotelDto dto = HotelDto.builder()
                        .id("google-" + placeId)
                        .hotelName(name)
                        .address(vicinity)
                        .latitude(lat)
                        .longitude(lng)
                        .destinationId(destinationId)
                        .destinationName(destinationName)
                        .hotelRating(rating)
                        .category("Google Places Discovery")
                        .isPartnerProperty(false)
                        .inventoryType("GOOGLE_PLACES_DISCOVERY")
                        .sourceType("GOOGLE_PLACES")
                        .sourceLabel("Google Places Discovery")
                        .verificationStatus("UNVERIFIED")
                        .bookabilityStatus("EXTERNAL_DISCOVERY_ONLY")
                        .officialWebsite(placeId != null ? "https://www.google.com/maps/place/?q=place_id:" + placeId : null)
                        .build();

                discoveredHotels.add(dto);
            }

            log.info("Google Places discovered {} external accommodation properties near {},{}", discoveredHotels.size(), latitude, longitude);
            return discoveredHotels;

        } catch (Exception e) {
            log.warn("Failed to query Google Places API: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}
