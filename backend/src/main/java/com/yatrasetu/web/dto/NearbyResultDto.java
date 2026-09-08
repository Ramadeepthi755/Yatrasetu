package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NearbyResultDto {
    private BigDecimal userLatitude;
    private BigDecimal userLongitude;
    private double radiusKm;
    @Builder.Default
    private List<DestinationSummaryDto> nearbyDestinations = new ArrayList<>();
    @Builder.Default
    private List<CityDto> nearbyCities = new ArrayList<>();
    @Builder.Default
    private List<PoiDto> nearbyPois = new ArrayList<>();
    @Builder.Default
    private List<HotelDto> nearbyHotels = new ArrayList<>();
}
