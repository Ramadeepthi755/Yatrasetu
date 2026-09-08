package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultsDto {
    private String query;
    private long totalResults;
    @Builder.Default
    private List<DestinationSummaryDto> destinations = new ArrayList<>();
    @Builder.Default
    private List<CityDto> cities = new ArrayList<>();
    @Builder.Default
    private List<StateDto> states = new ArrayList<>();
    @Builder.Default
    private List<PoiDto> pois = new ArrayList<>();
    @Builder.Default
    private List<HotelDto> hotels = new ArrayList<>();
}
