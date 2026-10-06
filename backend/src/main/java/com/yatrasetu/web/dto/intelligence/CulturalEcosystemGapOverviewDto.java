package com.yatrasetu.web.dto.intelligence;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CulturalEcosystemGapOverviewDto {

    private long totalGapsDetected;
    private long criticalGapsCount;
    private long highSeverityGapsCount;
    private long mediumSeverityGapsCount;
    private long lowSeverityGapsCount;

    private long culturalExperienceDeficitCount;
    private long artisanPartnerDeficitCount;
    private long connectivityGapCount;
    private long staysDeficitCount;
    private long guideHostDeficitCount;
    private long culturalDataGapCount;

    private Map<String, Long> gapsByType;
    private Map<String, Long> gapsBySeverity;
    private List<CulturalEcosystemGapDto> topCriticalGaps;

    private boolean isDemoModeActive;
    private String dataDisclaimer;
    private Instant generatedAt;
}
