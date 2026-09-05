package com.yatrasetu.web.dto.intelligence;

import com.yatrasetu.domain.intelligence.HealthClassification;
import com.yatrasetu.domain.intelligence.IntelligenceSourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DestinationHealthDto {
    private String destinationId;
    private String destinationName;
    private String stateName;
    private HealthClassification classification;
    private BigDecimal overallScore;
    private BigDecimal demandScore;
    private BigDecimal activityPressureScore;
    private BigDecimal localOpportunityScore;
    private BigDecimal accessibilityScore;
    private BigDecimal sustainabilityProxyScore;
    private IntelligenceSourceType sourceType;
    private BigDecimal confidence;
    private String explanation;
    private LocalDate scoreDate;
    private int alternativeOptionsCount;
    private String proxyDisclaimer;
}
