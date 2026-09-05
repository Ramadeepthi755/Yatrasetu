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
public class DestinationEcosystemDto {
    private String destinationId;
    private String destinationName;

    @Builder.Default
    private List<FamousFoodDto> famousFoods = new ArrayList<>();

    @Builder.Default
    private List<RestaurantDto> restaurants = new ArrayList<>();

    @Builder.Default
    private List<DestinationTransportDto> transports = new ArrayList<>();

    @Builder.Default
    private List<TravelAgencyDto> agencies = new ArrayList<>();

    @Builder.Default
    private List<RentalProviderDto> rentalProviders = new ArrayList<>();

    @Builder.Default
    private List<HotelDto> hotels = new ArrayList<>();

    @Builder.Default
    private List<PoiDto> pois = new ArrayList<>();

    @Builder.Default
    private List<LocalHostDto> localGuides = new ArrayList<>();

    @Builder.Default
    private List<ExperienceDto> experiences = new ArrayList<>();
}
