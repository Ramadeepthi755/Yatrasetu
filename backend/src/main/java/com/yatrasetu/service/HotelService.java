package com.yatrasetu.service;

import com.yatrasetu.domain.Hotel;
import com.yatrasetu.repository.HotelRepository;
import com.yatrasetu.web.dto.HotelDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HotelService {

    private final HotelRepository hotelRepository;

    @Transactional(readOnly = true)
    public List<HotelDto> getHotelsByDestination(String destinationId) {
        return hotelRepository.findByDestinationId(destinationId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HotelDto> getHotelsByCity(String cityId) {
        return hotelRepository.findByCityId(cityId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public HotelDto toDto(Hotel h) {
        return HotelDto.builder()
                .id(h.getId())
                .hotelName(h.getHotelName())
                .cityId(h.getCity() != null ? h.getCity().getId() : null)
                .cityName(h.getCity() != null ? h.getCity().getCityName() : null)
                .destinationId(h.getDestination() != null ? h.getDestination().getId() : null)
                .destinationName(h.getDestination() != null ? h.getDestination().getDestinationName() : null)
                .hotelRating(h.getHotelRating())
                .pricePerNight(h.getPricePerNight())
                .amenities(h.getAmenities())
                .category(h.getCategory())
                .address(h.getAddress())
                .latitude(h.getLatitude())
                .longitude(h.getLongitude())
                .isPartnerProperty(h.getIsPartnerProperty())
                .build();
    }
}
