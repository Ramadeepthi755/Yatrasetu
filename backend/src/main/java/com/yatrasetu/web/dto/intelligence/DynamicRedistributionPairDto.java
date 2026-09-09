package com.yatrasetu.web.dto.intelligence;

import com.yatrasetu.domain.intelligence.IntelligenceSourceType;
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
public class DynamicRedistributionPairDto {
    private String sourceDestinationId;
    private String sourceDestinationName;
    private String sourceStateName;
    private BigDecimal sourceActivityPressureScore;
    private BigDecimal sourceDemandScore;

    private String targetDestinationId;
    private String targetDestinationName;
    private String targetStateName;
    private BigDecimal targetActivityPressureScore;
    private BigDecimal targetLocalOpportunityScore;

    private BigDecimal pressureDifferential;
    private BigDecimal compatibilityScore;
    private List<String> sharedThemes;
    private String reason;
    private String expectedPotentialBenefit;
    private IntelligenceSourceType sourceType;
    private String limitationsDisclaimer;
}
