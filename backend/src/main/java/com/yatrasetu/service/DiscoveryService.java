package com.yatrasetu.service;

import com.yatrasetu.domain.City;
import com.yatrasetu.domain.Destination;
import com.yatrasetu.domain.DestinationPoi;
import com.yatrasetu.domain.Hotel;
import com.yatrasetu.repository.*;
import com.yatrasetu.web.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiscoveryService {

    private final DestinationRepository destinationRepository;
    private final CityRepository cityRepository;
    private final DestinationPoiRepository poiRepository;
    private final HotelRepository hotelRepository;
    private final DestinationService destinationService;
    private final CityService cityService;
    private final PoiService poiService;
    private final HotelService hotelService;

    private static final double EARTH_RADIUS_KM = 6371.0;

    @Transactional(readOnly = true)
    public NearbyResultDto getNearbyPlaces(double lat, double lng, double radiusKm, int limit) {
        double maxRadius = radiusKm > 0 ? radiusKm : 300.0; // Default 300km search radius in India
        int resultLimit = limit > 0 ? Math.min(limit, 30) : 10;

        // 1. Nearby Destinations
        List<DestinationSummaryDto> destinations = destinationRepository.findAll()
                .stream()
                .filter(d -> d.getLatitude() != null && d.getLongitude() != null)
                .map(d -> new Object() {
                    final Destination dest = d;
                    final double distance = calculateDistance(lat, lng, dest.getLatitude().doubleValue(), dest.getLongitude().doubleValue());
                })
                .filter(o -> o.distance <= maxRadius)
                .sorted(Comparator.comparingDouble(o -> o.distance))
                .limit(resultLimit)
                .map(o -> destinationService.toSummaryDto(o.dest))
                .collect(Collectors.toList());

        // 2. Nearby Cities
        List<CityDto> cities = cityRepository.findAll()
                .stream()
                .filter(c -> c.getLatitude() != null && c.getLongitude() != null)
                .map(c -> new Object() {
                    final City city = c;
                    final double distance = calculateDistance(lat, lng, city.getLatitude().doubleValue(), city.getLongitude().doubleValue());
                })
                .filter(o -> o.distance <= maxRadius)
                .sorted(Comparator.comparingDouble(o -> o.distance))
                .limit(resultLimit)
                .map(o -> cityService.toDto(o.city))
                .collect(Collectors.toList());

        // 3. Nearby POIs
        List<PoiDto> pois = poiRepository.findAll()
                .stream()
                .filter(p -> p.getLatitude() != null && p.getLongitude() != null &&
                        (p.getLatitude().doubleValue() != 0.0 || p.getLongitude().doubleValue() != 0.0))
                .map(p -> new Object() {
                    final DestinationPoi poi = p;
                    final double distance = calculateDistance(lat, lng, poi.getLatitude().doubleValue(), poi.getLongitude().doubleValue());
                })
                .filter(o -> o.distance <= maxRadius)
                .sorted(Comparator.comparingDouble(o -> o.distance))
                .limit(resultLimit)
                .map(o -> poiService.toDto(o.poi))
                .collect(Collectors.toList());

        // 4. Nearby Hotels
        List<HotelDto> hotels = hotelRepository.findAll()
                .stream()
                .filter(h -> h.getLatitude() != null && h.getLongitude() != null &&
                        (h.getLatitude().doubleValue() != 0.0 || h.getLongitude().doubleValue() != 0.0))
                .map(h -> new Object() {
                    final Hotel hotel = h;
                    final double distance = calculateDistance(lat, lng, hotel.getLatitude().doubleValue(), hotel.getLongitude().doubleValue());
                })
                .filter(o -> o.distance <= maxRadius)
                .sorted(Comparator.comparingDouble(o -> o.distance))
                .limit(resultLimit)
                .map(o -> hotelService.toDto(o.hotel))
                .collect(Collectors.toList());

        return NearbyResultDto.builder()
                .userLatitude(BigDecimal.valueOf(lat))
                .userLongitude(BigDecimal.valueOf(lng))
                .radiusKm(maxRadius)
                .nearbyDestinations(destinations)
                .nearbyCities(cities)
                .nearbyPois(pois)
                .nearbyHotels(hotels)
                .build();
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }
}
