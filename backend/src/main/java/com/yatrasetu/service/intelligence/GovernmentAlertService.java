package com.yatrasetu.service.intelligence;

import com.yatrasetu.domain.Destination;
import com.yatrasetu.domain.intelligence.GovernmentActionPriority;
import com.yatrasetu.domain.intelligence.HealthClassification;
import com.yatrasetu.domain.intelligence.IntelligenceSourceType;
import com.yatrasetu.repository.DestinationRepository;
import com.yatrasetu.web.dto.intelligence.DestinationHealthDto;
import com.yatrasetu.web.dto.intelligence.EcosystemGapDto;
import com.yatrasetu.web.dto.intelligence.GovernmentAlertDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class GovernmentAlertService {

    private final DestinationHealthService healthService;
    private final EcosystemGapDetectionService gapDetectionService;

    @Transactional(readOnly = true)
    public List<GovernmentAlertDto> getPrioritizedAlerts(boolean includeDemo) {
        List<DestinationHealthDto> healthScores = healthService.getAllDestinationHealthScores(includeDemo);
        List<EcosystemGapDto> gaps = gapDetectionService.detectAndSyncEcosystemGaps();

        List<GovernmentAlertDto> alerts = new ArrayList<>();

        // 1. Critical Pressure Alerts
        for (DestinationHealthDto h : healthScores) {
            if (h.getClassification() == HealthClassification.HIGH_PRESSURE || h.getActivityPressureScore().compareTo(BigDecimal.valueOf(75.0)) >= 0) {
                alerts.add(GovernmentAlertDto.builder()
                        .id("alert-press-" + h.getDestinationId())
                        .alertCategory("CRITICAL_PRESSURE")
                        .priority(GovernmentActionPriority.CRITICAL)
                        .destinationId(h.getDestinationId())
                        .destinationName(h.getDestinationName())
                        .stateName(h.getStateName())
                        .metricValue(h.getActivityPressureScore())
                        .metricLabel("Activity Pressure")
                        .title("High Carrying Capacity Strain at " + h.getDestinationName())
                        .explanation(String.format("Platform activity pressure score reached %s/100, indicating intense interest relative to attraction capacity.", h.getActivityPressureScore()))
                        .recommendedAction("Promote alternative regional corridors and issue traveler advisory for off-peak visits.")
                        .sourceType(includeDemo ? IntelligenceSourceType.DEMO : IntelligenceSourceType.DERIVED)
                        .timestamp(Instant.now())
                        .build());
            } else if (h.getClassification() == HealthClassification.WATCH) {
                alerts.add(GovernmentAlertDto.builder()
                        .id("alert-watch-" + h.getDestinationId())
                        .alertCategory("WATCHLIST")
                        .priority(GovernmentActionPriority.MEDIUM)
                        .destinationId(h.getDestinationId())
                        .destinationName(h.getDestinationName())
                        .stateName(h.getStateName())
                        .metricValue(h.getActivityPressureScore())
                        .metricLabel("Activity Pressure")
                        .title("Rising Demand Watchlist: " + h.getDestinationName())
                        .explanation(String.format("Destination is on observation watchlist with activity pressure score %s/100.", h.getActivityPressureScore()))
                        .recommendedAction("Monitor incoming trip planning trends and verify local guide availability.")
                        .sourceType(includeDemo ? IntelligenceSourceType.DEMO : IntelligenceSourceType.DERIVED)
                        .timestamp(Instant.now())
                        .build());
            }
        }

        // 2. Supply Bottleneck Alerts (from High Severity Ecosystem Gaps)
        for (EcosystemGapDto gap : gaps) {
            if ("HIGH".equals(gap.getSeverity())) {
                alerts.add(GovernmentAlertDto.builder()
                        .id("alert-gap-" + gap.getId())
                        .alertCategory("SUPPLY_BOTTLENECK")
                        .priority(GovernmentActionPriority.HIGH)
                        .destinationId(gap.getDestinationId())
                        .destinationName(gap.getDestinationName())
                        .stateName(gap.getStateName())
                        .metricValue(BigDecimal.valueOf(gap.getObservedDemand()))
                        .metricLabel("Demand Signals")
                        .title("Supply Bottleneck (" + gap.getGapType() + ") in " + gap.getDestinationName())
                        .explanation(gap.getDescription())
                        .recommendedAction(gap.getSuggestedIntervention())
                        .sourceType(IntelligenceSourceType.DERIVED)
                        .timestamp(Instant.now())
                        .build());
            }
        }

        // 3. Underutilized Gem Opportunity Alerts
        for (DestinationHealthDto h : healthScores) {
            if (h.getClassification() == HealthClassification.UNDERUTILIZED && h.getLocalOpportunityScore().compareTo(BigDecimal.valueOf(60.0)) >= 0) {
                alerts.add(GovernmentAlertDto.builder()
                        .id("alert-gem-" + h.getDestinationId())
                        .alertCategory("UNDERUTILIZED_ASSET")
                        .priority(GovernmentActionPriority.MEDIUM)
                        .destinationId(h.getDestinationId())
                        .destinationName(h.getDestinationName())
                        .stateName(h.getStateName())
                        .metricValue(h.getLocalOpportunityScore())
                        .metricLabel("Local Opportunity Score")
                        .title("High Potential Underutilized Asset: " + h.getDestinationName())
                        .explanation(String.format("Destination possesses exceptional local capacity (%s/100) with low demand (%s/100).", h.getLocalOpportunityScore(), h.getDemandScore()))
                        .recommendedAction("Include in upcoming state heritage marketing campaigns and featured seasonal travel circuits.")
                        .sourceType(includeDemo ? IntelligenceSourceType.DEMO : IntelligenceSourceType.DERIVED)
                        .timestamp(Instant.now())
                        .build());
            }
        }

        alerts.sort((a, b) -> {
            int pA = a.getPriority() == GovernmentActionPriority.CRITICAL ? 4 :
                     a.getPriority() == GovernmentActionPriority.HIGH ? 3 :
                     a.getPriority() == GovernmentActionPriority.MEDIUM ? 2 : 1;
            int pB = b.getPriority() == GovernmentActionPriority.CRITICAL ? 4 :
                     b.getPriority() == GovernmentActionPriority.HIGH ? 3 :
                     b.getPriority() == GovernmentActionPriority.MEDIUM ? 2 : 1;
            return Integer.compare(pB, pA);
        });

        return alerts;
    }
}
