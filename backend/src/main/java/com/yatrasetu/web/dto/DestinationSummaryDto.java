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
public class DestinationSummaryDto {
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
    private BigDecimal popularityScore;
    private String accessibility;
    private List<String> tripTypes;
    private String bestSeasons;
    private String peakSeason;
    private String description;
    private String heroImageUrl;
    private BigDecimal safetyRating;
    private String budgetIndicator; // e.g. "₹1,400 - ₹2,800/day"
    private String hiddenGems;
}
