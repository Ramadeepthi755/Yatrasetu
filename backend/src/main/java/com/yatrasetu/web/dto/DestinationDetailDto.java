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
public class DestinationDetailDto {
    private String id;
    private String destinationName;
    private String stateId;
    private String stateName;
    private String cityId;
    private String cityName;
    private String district;
    private String region;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer altitudeM;
    private BigDecimal popularityScore;
    private String accessibility;
    private String nearestAirport;
    private String nearestRailway;
    private String nearestMajorCity;
    private BigDecimal nearestMajorCityDistanceKm;
    private String roadConnectivity;
    private List<String> tripTypes;
    private List<String> primaryAttractions;
    private List<String> activitiesAvailable;
    private String uniqueExperiences;
    private String hiddenGems;
    private String bestSeasons;
    private String avoidSeasons;
    private String peakSeason;
    private String offSeason;
    private String averageTemperature;
    private String rainfallPattern;
    private List<String> idealFor;
    private String idealForWhy;
    private String specialConsiderations;
    private BigDecimal minimumDays;
    private BigDecimal idealDays;
    private Integer maximumDays;
    private String suggestedItinerary;
    private String accommodationTypes;
    private String foodScene;
    private BigDecimal safetyRating;
    private String safetyNotes;
    private String internetConnectivity;
    private String mobileNetwork;
    private String atmAvailability;
    private String languageSpoken;
    private Boolean permitsRequired;
    private String permitsDetails;
    private String localCulture;
    private String festivalsEvents;
    private String localCustoms;
    private String shoppingHighlights;
    private String localCuisineMustTry;
    private String budgetRangeJson;
    private String midRangeJson;
    private String luxuryRangeJson;
    private String description;
    private String heroImageUrl;
    private String userReviewsSummary;
    private String recentDevelopments;
    private String sustainabilityNotes;
    private List<PoiDto> topPois;
    private List<HotelDto> nearbyHotels;
    private List<ReviewDto> recentReviews;
}
