package com.yatrasetu.service;

import com.yatrasetu.domain.Hotel;
import com.yatrasetu.repository.HotelRepository;
import com.yatrasetu.web.dto.HotelDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HotelService {

    private final HotelRepository hotelRepository;
    private final com.yatrasetu.repository.DestinationRepository destinationRepository;

    @Transactional(readOnly = true)
    public Page<HotelDto> getAllHotels(
            String cityId,
            String destinationId,
            String category,
            BigDecimal minRating,
            BigDecimal maxPrice,
            Boolean isPartnerProperty,
            String search,
            Pageable pageable) {

        String cleanedCity = (cityId != null && !cityId.trim().isEmpty() && !cityId.equalsIgnoreCase("all")) ? cityId.trim() : null;
        String cleanedDest = (destinationId != null && !destinationId.trim().isEmpty() && !destinationId.equalsIgnoreCase("all")) ? destinationId.trim() : null;
        String cleanedCat = (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("all")) ? category.trim() : null;
        String cleanedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        String targetCityId = null;
        if (cleanedDest != null) {
            var destOpt = destinationRepository.findById(cleanedDest);
            if (destOpt.isPresent() && destOpt.get().getCity() != null) {
                targetCityId = destOpt.get().getCity().getId();
            }
        }

        return hotelRepository.findWithFilters(
                cleanedCity,
                cleanedDest,
                targetCityId,
                cleanedCat,
                minRating,
                maxPrice,
                isPartnerProperty,
                cleanedSearch,
                pageable
        ).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<HotelDto> getHotelById(String id) {
        return hotelRepository.findById(id).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<HotelDto> getHotelsByDestination(String destinationId) {
        List<Hotel> hotels = hotelRepository.findByDestinationId(destinationId);
        if (hotels.isEmpty()) {
            var destOpt = destinationRepository.findById(destinationId);
            if (destOpt.isPresent()) {
                var dest = destOpt.get();
                if (dest.getCity() != null) {
                    hotels = hotelRepository.findByCityId(dest.getCity().getId());
                }
                if (hotels.isEmpty() && dest.getLatitude() != null && dest.getLongitude() != null) {
                    hotels = hotelRepository.findNearestHotels(dest.getLatitude().doubleValue(), dest.getLongitude().doubleValue(), 12);
                }
            }
        }
        return hotels.stream()
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

    @Transactional(readOnly = true)
    public List<String> getCategories() {
        return hotelRepository.findDistinctCategories();
    }

    public HotelDto toDto(Hotel h) {
        String stateId = null;
        String stateName = null;
        if (h.getCity() != null && h.getCity().getState() != null) {
            stateId = h.getCity().getState().getId();
            stateName = h.getCity().getState().getStateName();
        } else if (h.getDestination() != null && h.getDestination().getState() != null) {
            stateId = h.getDestination().getState().getId();
            stateName = h.getDestination().getState().getStateName();
        }

        return HotelDto.builder()
                .id(h.getId())
                .hotelName(h.getHotelName())
                .cityId(h.getCity() != null ? h.getCity().getId() : null)
                .cityName(h.getCity() != null ? h.getCity().getCityName() : null)
                .stateId(stateId)
                .stateName(stateName)
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
                .inventoryType(h.getInventoryType() != null ? h.getInventoryType() : "DATASET_PROPERTY")
                .sourceType(h.getSourceType() != null ? h.getSourceType().name() : "DATASET")
                .sourceLabel(com.yatrasetu.domain.ProvenanceUtil.getLabel(h.getSourceType(), h.getIsPartnerProperty()))
                .build();
    }
}
