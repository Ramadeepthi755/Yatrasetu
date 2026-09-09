package com.yatrasetu.web.dto.intelligence;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CulturalOpportunityOverviewDto {

    private long totalDestinationsEvaluated;
    private long destinationsWithSufficientData;
    private long destinationsWithInsufficientData;

    private BigDecimal averageOpportunityScore;
    private long highOpportunityCount;
    private long moderateOpportunityCount;
    private long emergingOpportunityCount;
    private long lowerOpportunityCount;

    private long culturalExperienceDeficitCount;
    private long giRichDestinationsCount;

    private Map<String, Long> matrixDistribution;
    private List<CulturalOpportunityDto> topOpportunityDestinations;

    private boolean isDemoModeActive;
    private long observedSignalsCount;
    private long demoSignalsCount;

    private Map<String, String> dataProvenance;
    private String dataDisclaimer;
    private Instant generatedAt;
}
