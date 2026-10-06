package com.yatrasetu.service;

import com.yatrasetu.repository.*;
import com.yatrasetu.web.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final DestinationRepository destinationRepository;
    private final CityRepository cityRepository;
    private final StateRepository stateRepository;
    private final DestinationPoiRepository poiRepository;
    private final HotelRepository hotelRepository;
    private final DestinationService destinationService;
    private final CityService cityService;
    private final StateService stateService;
    private final PoiService poiService;
    private final HotelService hotelService;

    @Transactional(readOnly = true)
    public SearchResultsDto search(String query, String category, int limit) {
        if (query == null || query.trim().isEmpty()) {
            return SearchResultsDto.builder()
                    .query("")
                    .totalResults(0)
                    .destinations(new ArrayList<>())
                    .cities(new ArrayList<>())
                    .states(new ArrayList<>())
                    .pois(new ArrayList<>())
                    .hotels(new ArrayList<>())
                    .build();
        }

        String q = query.trim();
        Pageable pageable = PageRequest.of(0, Math.max(1, Math.min(limit, 50)));

        List<DestinationSummaryDto> destinations = new ArrayList<>();
        List<CityDto> cities = new ArrayList<>();
        List<StateDto> states = new ArrayList<>();
        List<PoiDto> pois = new ArrayList<>();
        List<HotelDto> hotels = new ArrayList<>();

        boolean searchAll = (category == null || category.trim().isEmpty() || category.equalsIgnoreCase("all"));

        if (searchAll || category.equalsIgnoreCase("destination") || category.equalsIgnoreCase("destinations")) {
            destinations = destinationRepository.searchDestinations(q, pageable)
                    .stream()
                    .map(destinationService::toSummaryDto)
                    .collect(Collectors.toList());
        }

        if (searchAll || category.equalsIgnoreCase("city") || category.equalsIgnoreCase("cities")) {
            cities = cityRepository.searchCities(q, pageable)
                    .stream()
                    .map(cityService::toDto)
                    .collect(Collectors.toList());
        }

        if (searchAll || category.equalsIgnoreCase("state") || category.equalsIgnoreCase("states")) {
            states = stateRepository.searchStates(q)
                    .stream()
                    .limit(limit)
                    .map(stateService::toDto)
                    .collect(Collectors.toList());
        }

        if (searchAll || category.equalsIgnoreCase("poi") || category.equalsIgnoreCase("pois") || category.equalsIgnoreCase("attraction")) {
            pois = poiRepository.searchPois(q, pageable)
                    .stream()
                    .map(poiService::toDto)
                    .collect(Collectors.toList());
        }

        if (searchAll || category.equalsIgnoreCase("hotel") || category.equalsIgnoreCase("hotels") || category.equalsIgnoreCase("stay")) {
            hotels = hotelRepository.searchHotels(q, pageable)
                    .stream()
                    .map(hotelService::toDto)
                    .collect(Collectors.toList());
        }

        long total = destinations.size() + cities.size() + states.size() + pois.size() + hotels.size();

        return SearchResultsDto.builder()
                .query(q)
                .totalResults(total)
                .destinations(destinations)
                .cities(cities)
                .states(states)
                .pois(pois)
                .hotels(hotels)
                .build();
    }
}
