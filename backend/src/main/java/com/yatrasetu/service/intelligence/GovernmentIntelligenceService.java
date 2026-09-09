package com.yatrasetu.service.intelligence;

import com.yatrasetu.domain.Destination;
import com.yatrasetu.domain.User;
import com.yatrasetu.domain.intelligence.*;
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
    public GovernmentActionResponseDto recordAction(GovernmentActionRequest request, User user) {
        Destination destination = null;
        if (request.getDestinationId() != null) {
            destination = destinationRepository.findById(request.getDestinationId()).orElse(null);
        }

        TourismRedistributionRecommendation rec = null;
        if (request.getRecommendationId() != null) {
            rec = recommendationRepository.findById(request.getRecommendationId()).orElse(null);
        }

        GovernmentActionPriority priority = request.getPriority() != null ? request.getPriority() : GovernmentActionPriority.MEDIUM;

        TourismGovernmentAction action = TourismGovernmentAction.builder()
                .id("act-" + UUID.randomUUID())
                .destination(destination)
                .recommendation(rec)
                .actionType(request.getActionType() != null ? request.getActionType() : GovernmentActionType.CREATE_INITIATIVE)
                .title(request.getTitle() != null ? request.getTitle() : "Government Action Logged")
                .notes(request.getNotes())
                .user(user)
                .status(GovernmentActionStatus.LOGGED)
                .priority(priority)
                .createdAt(Instant.now())
                .build();

        TourismGovernmentAction saved = actionRepository.save(action);
        return mapToResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public List<GovernmentActionResponseDto> getActionHistory(GovernmentActionStatus status, GovernmentActionPriority priority) {
        List<TourismGovernmentAction> actions;
        if (status == null && priority == null) {
            actions = actionRepository.findAllWithDetails();
        } else {
            actions = actionRepository.findByStatusAndPriorityFiltered(status, priority);
        }

        List<GovernmentActionResponseDto> dtos = new ArrayList<>();
        for (TourismGovernmentAction a : actions) {
            dtos.add(mapToResponseDto(a));
        }
        return dtos;
    }

    @Transactional
    public GovernmentActionResponseDto updateActionStatus(String actionId, GovernmentActionStatus newStatus, String resolutionNotes, User user) {
        TourismGovernmentAction action = actionRepository.findById(actionId).orElse(null);
        if (action == null) return null;

        if (newStatus != null) {
            action.setStatus(newStatus);
            if (newStatus == GovernmentActionStatus.RESOLVED || newStatus == GovernmentActionStatus.DISMISSED) {
                action.setResolvedAt(Instant.now());
            }
        }

        if (resolutionNotes != null && !resolutionNotes.isBlank()) {
            action.setResolutionNotes(resolutionNotes);
        }

        TourismGovernmentAction saved = actionRepository.save(action);
        log.info("Government user {} updated action {} to status {}", user != null ? user.getId() : "system", actionId, newStatus);
        return mapToResponseDto(saved);
    }

    private GovernmentActionResponseDto mapToResponseDto(TourismGovernmentAction a) {
        return GovernmentActionResponseDto.builder()
                .id(a.getId())
                .destinationId(a.getDestination() != null ? a.getDestination().getId() : null)
                .destinationName(a.getDestination() != null ? a.getDestination().getDestinationName() : "General Directive")
                .stateName(a.getDestination() != null && a.getDestination().getState() != null ? a.getDestination().getState().getStateName() : "National")
                .recommendationId(a.getRecommendation() != null ? a.getRecommendation().getId() : null)
                .actionType(a.getActionType())
                .title(a.getTitle())
                .notes(a.getNotes())
                .status(a.getStatus() != null ? a.getStatus() : GovernmentActionStatus.LOGGED)
                .priority(a.getPriority() != null ? a.getPriority() : GovernmentActionPriority.MEDIUM)
                .resolutionNotes(a.getResolutionNotes())
                .resolvedAt(a.getResolvedAt())
                .userFullName(a.getUser() != null ? a.getUser().getFullName() : "Government Official")
                .createdAt(a.getCreatedAt())
                .build();
    }
}
