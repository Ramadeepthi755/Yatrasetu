package com.yatrasetu.service;

import com.yatrasetu.domain.DestinationPoi;
import com.yatrasetu.repository.DestinationPoiRepository;
import com.yatrasetu.web.dto.PoiDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PoiService {

    private final DestinationPoiRepository poiRepository;

    @Transactional(readOnly = true)
    public List<PoiDto> getPoisByDestination(String destinationId) {
        return poiRepository.findByDestinationId(destinationId)
                .stream()
                .filter(p -> p.getLatitude() != null && p.getLongitude() != null &&
                        (p.getLatitude().doubleValue() != 0.0 || p.getLongitude().doubleValue() != 0.0))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PoiDto> getPoisByCity(String cityId) {
        return poiRepository.findByCityId(cityId)
                .stream()
                .filter(p -> p.getLatitude() != null && p.getLongitude() != null &&
                        (p.getLatitude().doubleValue() != 0.0 || p.getLongitude().doubleValue() != 0.0))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public PoiDto toDto(DestinationPoi p) {
        return PoiDto.builder()
                .id(p.getId())
                .poiName(p.getPoiName())
                .destinationId(p.getDestination() != null ? p.getDestination().getId() : null)
                .destinationName(p.getDestination() != null ? p.getDestination().getDestinationName() : null)
                .cityId(p.getCity() != null ? p.getCity().getId() : null)
                .cityName(p.getCity() != null ? p.getCity().getCityName() : null)
                .category(p.getCategory())
                .latitude(p.getLatitude())
                .longitude(p.getLongitude())
                .tags(p.getTags())
                .characteristics(p.getCharacteristics())
                .entryFeeInr(p.getEntryFeeInr())
                .typicalDurationHours(p.getTypicalDurationHours())
                .build();
    }
}
