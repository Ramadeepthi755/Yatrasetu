package com.yatrasetu.web.dto.intelligence;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntelligenceOverviewDto {
    private long totalDestinationsMonitored;
    private long risingDestinationsCount;
    private long highActivityPressureCount;
    private long underutilizedDestinationsCount;
    private long activeDemandSignalsCount;
    private long redistributionOpportunitiesCount;
    private boolean isDemoModeActive;
    private long observedSignalsCount;
    private long demoSignalsCount;
    private Map<String, String> provenanceBreakdown;
    private String dataDisclaimer;
    @Builder.Default
    private Instant timestamp = Instant.now();
}
