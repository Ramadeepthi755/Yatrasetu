package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StateDetailDto {
    private String id;
    private String stateName;
    private String region;
    private String capitalCity;
    private String description;
    private String bannerImageUrl;
    private long cityCount;
    private long destinationCount;
    private List<DestinationSummaryDto> featuredDestinations;
    private List<CityDto> popularCities;
    private List<PoiDto> topPois;
    private List<HotelDto> hotels;
}
