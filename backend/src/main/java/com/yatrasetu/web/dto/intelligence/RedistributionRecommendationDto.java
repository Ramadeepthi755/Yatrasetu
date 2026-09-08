package com.yatrasetu.web.dto.intelligence;

import com.yatrasetu.domain.intelligence.IntelligenceSourceType;
import com.yatrasetu.domain.intelligence.RecommendationPriority;
import com.yatrasetu.domain.intelligence.RecommendationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RedistributionRecommendationDto {
    private String id;
    private String sourceDestinationId;
    private String sourceDestinationName;
    private BigDecimal sourceActivityPressureScore;
    private String targetDestinationId;
    private String targetDestinationName;
    private BigDecimal targetLocalOpportunityScore;
    private BigDecimal targetActivityPressureScore;
    private String compatibilityType;
    private String reason;
    private String expectedPotentialBenefit;
    private BigDecimal confidenceScore;
    private RecommendationPriority priority;
    private RecommendationStatus status;
    private IntelligenceSourceType sourceType;
    private String whyExplanation;
    private String limitations;
}
