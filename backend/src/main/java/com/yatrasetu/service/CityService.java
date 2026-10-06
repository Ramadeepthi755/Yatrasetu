package com.yatrasetu.service;

import com.yatrasetu.domain.City;
import com.yatrasetu.repository.CityRepository;
import com.yatrasetu.repository.DestinationPoiRepository;
import com.yatrasetu.repository.DestinationRepository;
import com.yatrasetu.repository.HotelRepository;
import com.yatrasetu.web.dto.CityDetailDto;
import com.yatrasetu.web.dto.CityDto;
import com.yatrasetu.web.dto.DestinationSummaryDto;
import com.yatrasetu.web.dto.HotelDto;
import com.yatrasetu.web.dto.PoiDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CityService {

    private final CityRepository cityRepository;
    private final DestinationRepository destinationRepository;
    private final DestinationPoiRepository destinationPoiRepository;
    private final HotelRepository hotelRepository;
    private final DestinationService destinationService;
    private final PoiService poiService;
    private final HotelService hotelService;

    @Transactional(readOnly = true)
    public List<CityDto> getCitiesByState(String stateId) {
        return cityRepository.findByStateIdOrderByCityNameAsc(stateId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CityDto> getAllTourismHubCities() {
        return cityRepository.findByIsTourismHubTrueOrderByCityNameAsc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<CityDetailDto> getCityDetail(String id) {
        Optional<City> cityOpt = cityRepository.findByIdOrNameIgnoreCase(id);
        if (cityOpt.isEmpty()) {
            return Optional.empty();
        }

        City c = cityOpt.get();
        List<DestinationSummaryDto> destinations = destinationRepository.findByCityIdOrderByPopularityScoreDesc(c.getId())
                .stream()
                .map(destinationService::toSummaryDto)
                .collect(Collectors.toList());

        List<PoiDto> pois = poiService.getPoisByCity(c.getId());
        List<HotelDto> hotels = hotelService.getHotelsByCity(c.getId());

        // Also fetch nearby destinations in same state if current city has few
        List<DestinationSummaryDto> nearby = destinationRepository.findByStateIdOrderByPopularityScoreDesc(c.getState().getId())
                .stream()
                .filter(d -> !d.getCity().getId().equalsIgnoreCase(c.getId()))
                .limit(6)
                .map(destinationService::toSummaryDto)
                .collect(Collectors.toList());

        return Optional.of(CityDetailDto.builder()
                .id(c.getId())
                .cityName(c.getCityName())
                .stateId(c.getState().getId())
                .stateName(c.getState().getStateName())
                .districtName(c.getDistrictName())
                .latitude(c.getLatitude())
                .longitude(c.getLongitude())
                .tier(c.getTier())
                .isTourismHub(c.getIsTourismHub())
                .destinations(destinations)
                .pois(pois)
                .hotels(hotels)
                .nearbyDestinations(nearby)
                .build());
    }

    public CityDto toDto(City c) {
        long destCount = destinationRepository.countByCityId(c.getId());
        long poiCount = destinationPoiRepository.findByCityId(c.getId()).size();
        long hotelCount = hotelRepository.findByCityId(c.getId()).size();

        return CityDto.builder()
                .id(c.getId())
                .cityName(c.getCityName())
                .stateId(c.getState() != null ? c.getState().getId() : null)
                .stateName(c.getState() != null ? c.getState().getStateName() : null)
                .districtName(c.getDistrictName())
                .latitude(c.getLatitude())
                .longitude(c.getLongitude())
                .tier(c.getTier())
                .isTourismHub(c.getIsTourismHub())
                .destinationCount(destCount)
                .poiCount(poiCount)
                .hotelCount(hotelCount)
                .build();
    }
}
