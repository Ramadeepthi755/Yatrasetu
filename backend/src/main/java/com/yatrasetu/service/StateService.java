package com.yatrasetu.service;

import com.yatrasetu.domain.State;
import com.yatrasetu.repository.CityRepository;
import com.yatrasetu.repository.DestinationRepository;
import com.yatrasetu.repository.HotelRepository;
import com.yatrasetu.repository.StateRepository;
import com.yatrasetu.web.dto.CityDto;
import com.yatrasetu.web.dto.DestinationSummaryDto;
import com.yatrasetu.web.dto.HotelDto;
import com.yatrasetu.web.dto.PoiDto;
import com.yatrasetu.web.dto.StateDetailDto;
import com.yatrasetu.web.dto.StateDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StateService {

    private final StateRepository stateRepository;
    private final CityRepository cityRepository;
    private final DestinationRepository destinationRepository;
    private final HotelRepository hotelRepository;
    private final DestinationService destinationService;
    private final CityService cityService;
    private final PoiService poiService;
    private final HotelService hotelService;

    @Transactional(readOnly = true)
    public List<StateDto> getAllStates(String region) {
        List<State> states;
        if (region != null && !region.trim().isEmpty() && !region.equalsIgnoreCase("all")) {
            states = stateRepository.findByRegionIgnoreCaseOrderByStateNameAsc(region.trim());
        } else {
            states = stateRepository.findAllByOrderByStateNameAsc();
        }

        return states.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<StateDetailDto> getStateDetail(String id) {
        Optional<State> stateOpt = stateRepository.findByIdOrNameIgnoreCase(id);
        if (stateOpt.isEmpty()) {
            return Optional.empty();
        }

        State s = stateOpt.get();
        List<DestinationSummaryDto> featuredDestinations = destinationRepository
                .findByStateIdOrderByPopularityScoreDesc(s.getId())
                .stream()
                .map(destinationService::toSummaryDto)
                .collect(Collectors.toList());

        List<CityDto> cities = cityRepository
                .findByStateIdOrderByCityNameAsc(s.getId())
                .stream()
                .map(cityService::toDto)
                .collect(Collectors.toList());

        // Gather POIs from the state's cities/destinations
        List<PoiDto> topPois = new ArrayList<>();
        for (DestinationSummaryDto d : featuredDestinations) {
            topPois.addAll(poiService.getPoisByDestination(d.getId()));
            if (topPois.size() >= 20) break;
        }

        // Gather Hotels
        List<HotelDto> hotels = new ArrayList<>();
        for (DestinationSummaryDto d : featuredDestinations) {
            hotels.addAll(hotelService.getHotelsByDestination(d.getId()));
            if (hotels.size() >= 20) break;
        }

        return Optional.of(StateDetailDto.builder()
                .id(s.getId())
                .stateName(s.getStateName())
                .region(s.getRegion())
                .capitalCity(s.getCapitalCity())
                .description(s.getDescription())
                .bannerImageUrl(s.getBannerImageUrl())
                .cityCount(cities.size())
                .destinationCount(featuredDestinations.size())
                .featuredDestinations(featuredDestinations)
                .popularCities(cities)
                .topPois(topPois)
                .hotels(hotels)
                .build());
    }

    public StateDto toDto(State s) {
        long cityCount = cityRepository.findByStateIdOrderByCityNameAsc(s.getId()).size();
        long destinationCount = destinationRepository.countByStateId(s.getId());

        return StateDto.builder()
                .id(s.getId())
                .stateName(s.getStateName())
                .region(s.getRegion())
                .capitalCity(s.getCapitalCity())
                .description(s.getDescription())
                .bannerImageUrl(s.getBannerImageUrl())
                .cityCount(cityCount)
                .destinationCount(destinationCount)
                .build();
    }
}
