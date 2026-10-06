package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CityDetailDto {
    private String id;
    private String cityName;
    private String stateId;
    private String stateName;
    private String districtName;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String tier;
    private Boolean isTourismHub;
    private List<DestinationSummaryDto> destinations;
    private List<PoiDto> pois;
    private List<HotelDto> hotels;
    private List<DestinationSummaryDto> nearbyDestinations;
}
