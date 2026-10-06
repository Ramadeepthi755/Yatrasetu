package com.yatrasetu.web.dto.intelligence;

import com.yatrasetu.domain.intelligence.HealthClassification;
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
public class DynamicHiddenGemDto {
    private String destinationId;
    private String destinationName;
    private String stateName;
    private String cityName;
    private HealthClassification classification;
    private BigDecimal demandScore;
    private BigDecimal activityPressureScore;
    private BigDecimal localOpportunityScore;
    private BigDecimal accessibilityScore;
    private BigDecimal sustainabilityProxyScore;
    private int poiCount;
    private List<String> tripTypes;
    private BigDecimal hiddenGemScore;
    private String explanation;
    private IntelligenceSourceType sourceType;
    private String disclaimer;
}
