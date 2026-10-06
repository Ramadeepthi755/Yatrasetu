package com.yatrasetu.web.dto.intelligence;

import com.yatrasetu.domain.intelligence.HealthClassification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GovernmentMapMarkerDto {
    private String destinationId;
    private String destinationName;
    private String stateName;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private HealthClassification classification;
    private BigDecimal overallScore;
    private BigDecimal demandScore;
    private BigDecimal activityPressureScore;
    private BigDecimal localOpportunityScore;
    private String topRecommendationTarget;
    private String proxyNote;
}
