package com.yatrasetu.service.intelligence;

import com.yatrasetu.domain.Destination;
import com.yatrasetu.domain.User;
import com.yatrasetu.domain.intelligence.HealthClassification;
import com.yatrasetu.domain.intelligence.IntelligenceSourceType;
import com.yatrasetu.domain.intelligence.TourismGovernmentAction;
import com.yatrasetu.domain.intelligence.TourismRedistributionRecommendation;
import com.yatrasetu.repository.DestinationRepository;
import com.yatrasetu.repository.intelligence.TourismDemandSignalRepository;
import com.yatrasetu.repository.intelligence.TourismGovernmentActionRepository;
import com.yatrasetu.repository.intelligence.TourismRedistributionRecommendationRepository;
import com.yatrasetu.web.dto.intelligence.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class GovernmentIntelligenceService {

    private final DestinationRepository destinationRepository;
    private final TourismDemandSignalRepository signalRepository;
    private final TourismDemandService demandService;
    private final DestinationHealthService healthService;
    private final TourismRedistributionService redistributionService;
    private final TourismRedistributionRecommendationRepository recommendationRepository;
    private final TourismGovernmentActionRepository actionRepository;

    @Transactional(readOnly = true)
    public IntelligenceOverviewDto getOverview(boolean includeDemo) {
        long totalDestinations = destinationRepository.count();
        List<DemandTrendDto> trends = demandService.getDemandTrends(14, includeDemo);
        List<DestinationHealthDto> healthScores = healthService.getAllDestinationHealthScores(includeDemo);

        long risingCount = trends.stream().filter(t -> "RISING".equals(t.getTrend())).count();
        long highPressureCount = healthScores.stream().filter(h -> h.getClassification() == HealthClassification.HIGH_PRESSURE).count();
        long underutilizedCount = healthScores.stream().filter(h -> h.getClassification() == HealthClassification.UNDERUTILIZED).count();

        long observedSignals = signalRepository.countBySourceType(IntelligenceSourceType.OBSERVED);
        long demoSignals = signalRepository.countBySourceType(IntelligenceSourceType.DEMO);
        long activeSignals = includeDemo ? (observedSignals + demoSignals) : observedSignals;

        long redistributionCount = recommendationRepository.count();

        Map<String, String> provenance = new LinkedHashMap<>();
        provenance.put("OBSERVED", observedSignals + " genuine YatraSetu activity events (trips, reviews, travel connect)");
        provenance.put("DERIVED", "Algorithmic health and pressure scores calculated strictly from platform capacity and activity");
        provenance.put("ESTIMATED", "Deterministic baseline forecasts (7D, 30D, 90D) scaled by seasonal calendar weighting");
        if (includeDemo) {
            provenance.put("DEMO", demoSignals + " demonstration signals enabled for SIH evaluation showcase");
        }

        return IntelligenceOverviewDto.builder()
                .totalDestinationsMonitored(totalDestinations)
                .risingDestinationsCount(risingCount)
                .highActivityPressureCount(highPressureCount)
                .underutilizedDestinationsCount(underutilizedCount)
                .activeDemandSignalsCount(activeSignals)
                .redistributionOpportunitiesCount(redistributionCount)
                .isDemoModeActive(includeDemo)
                .observedSignalsCount(observedSignals)
                .demoSignalsCount(demoSignals)
                .provenanceBreakdown(provenance)
                .dataDisclaimer("Data-driven insights from the YatraSetu ecosystem. All metrics are platform-derived proxies and do not represent physical crowd censuses or official government arrivals.")
                .timestamp(Instant.now())
                .build();
    }

    @Transactional(readOnly = true)
    public List<GovernmentMapMarkerDto> getMapMarkers(boolean includeDemo) {
        List<Destination> destinations = destinationRepository.findAll();
        List<DestinationHealthDto> healthList = healthService.getAllDestinationHealthScores(includeDemo);
        Map<String, DestinationHealthDto> healthMap = new HashMap<>();
        for (DestinationHealthDto h : healthList) {
            healthMap.put(h.getDestinationId(), h);
        }

        List<TourismRedistributionRecommendation> allRecs = recommendationRepository.findAll();
        Map<String, String> topTargetMap = new HashMap<>();
        for (TourismRedistributionRecommendation r : allRecs) {
            if (r.getSourceDestination() != null && r.getTargetDestination() != null && !topTargetMap.containsKey(r.getSourceDestination().getId())) {
                topTargetMap.put(r.getSourceDestination().getId(), r.getTargetDestination().getDestinationName());
            }
        }

        List<GovernmentMapMarkerDto> markers = new ArrayList<>();
        for (Destination d : destinations) {
            if (d.getLatitude() == null || d.getLongitude() == null) continue;

            DestinationHealthDto health = healthMap.get(d.getId());
            String topTarget = topTargetMap.get(d.getId());

            markers.add(GovernmentMapMarkerDto.builder()
                    .destinationId(d.getId())
                    .destinationName(d.getDestinationName())
                    .stateName(d.getState() != null ? d.getState().getStateName() : "India")
                    .latitude(d.getLatitude())
                    .longitude(d.getLongitude())
                    .classification(health != null ? health.getClassification() : HealthClassification.INSUFFICIENT_DATA)
                    .overallScore(health != null ? health.getOverallScore() : null)
                    .demandScore(health != null ? health.getDemandScore() : null)
                    .activityPressureScore(health != null ? health.getActivityPressureScore() : null)
                    .localOpportunityScore(health != null ? health.getLocalOpportunityScore() : null)
                    .topRecommendationTarget(topTarget)
                    .proxyNote("YatraSetu Activity Proxy (Not a physical sensor count)")
                    .build());
        }

        return markers;
    }

    @Transactional
    public TourismGovernmentAction recordAction(GovernmentActionRequest request, User user) {
        Destination destination = null;
        if (request.getDestinationId() != null) {
            destination = destinationRepository.findById(request.getDestinationId()).orElse(null);
        }

        TourismRedistributionRecommendation rec = null;
        if (request.getRecommendationId() != null) {
            rec = recommendationRepository.findById(request.getRecommendationId()).orElse(null);
        }

        TourismGovernmentAction action = TourismGovernmentAction.builder()
                .id("act-" + UUID.randomUUID())
                .destination(destination)
                .recommendation(rec)
                .actionType(request.getActionType())
                .title(request.getTitle() != null ? request.getTitle() : "Government Action Logged")
                .notes(request.getNotes())
                .user(user)
                .build();

        return actionRepository.save(action);
    }
}
