package com.yatrasetu.web.rest;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.domain.User;
import com.yatrasetu.domain.intelligence.GovernmentActionPriority;
import com.yatrasetu.domain.intelligence.GovernmentActionStatus;
import com.yatrasetu.repository.UserRepository;
import com.yatrasetu.service.intelligence.*;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.intelligence.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/government/intelligence")
@RequiredArgsConstructor
@PreAuthorize("hasRole('GOVERNMENT')")
public class GovernmentIntelligenceController {

    private final GovernmentIntelligenceService intelligenceService;
    private final TourismDemandService demandService;
    private final DestinationHealthService healthService;
    private final TourismForecastService forecastService;
    private final TourismRedistributionService redistributionService;
    private final LocalOpportunityService opportunityService;
    private final HiddenGemDiscoveryService hiddenGemService;
    private final DynamicRedistributionService dynamicRedistributionService;
    private final EcosystemGapDetectionService gapDetectionService;
    private final GovernmentAlertService alertService;
    private final UserRepository userRepository;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<IntelligenceOverviewDto>> getOverview(
            @RequestParam(name = "includeDemo", defaultValue = "true") boolean includeDemo) {
        IntelligenceOverviewDto overview = intelligenceService.getOverview(includeDemo);
        return ResponseEntity.ok(ApiResponse.ok(overview));
    }

    @GetMapping("/demand")
    public ResponseEntity<ApiResponse<List<DemandTrendDto>>> getDemandTrends(
            @RequestParam(name = "windowDays", defaultValue = "14") int windowDays,
            @RequestParam(name = "includeDemo", defaultValue = "true") boolean includeDemo) {
        List<DemandTrendDto> trends = demandService.getDemandTrends(windowDays, includeDemo);
        return ResponseEntity.ok(ApiResponse.ok(trends));
    }

    @GetMapping("/demand/timeseries")
    public ResponseEntity<ApiResponse<List<DemandTrendDto.TimeSeriesPoint>>> getMacroTimeSeries(
            @RequestParam(name = "days", defaultValue = "30") int days,
            @RequestParam(name = "includeDemo", defaultValue = "true") boolean includeDemo) {
        List<DemandTrendDto.TimeSeriesPoint> points = demandService.getMacroTimeSeries(days, includeDemo);
        return ResponseEntity.ok(ApiResponse.ok(points));
    }

    @GetMapping("/destinations")
    public ResponseEntity<ApiResponse<List<DestinationHealthDto>>> getDestinationHealthScores(
            @RequestParam(name = "includeDemo", defaultValue = "true") boolean includeDemo) {
        List<DestinationHealthDto> scores = healthService.getAllDestinationHealthScores(includeDemo);
        return ResponseEntity.ok(ApiResponse.ok(scores));
    }

    @GetMapping("/destinations/{id}")
    public ResponseEntity<ApiResponse<DestinationHealthDto>> getDestinationHealth(
            @PathVariable("id") String id,
            @RequestParam(name = "includeDemo", defaultValue = "true") boolean includeDemo) {
        DestinationHealthDto health = healthService.calculateHealth(id, includeDemo);
        if (health == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.ok(health));
    }

    @GetMapping("/forecast")
    public ResponseEntity<ApiResponse<List<DemandForecastDto>>> getForecast(
            @RequestParam("destinationId") String destinationId,
            @RequestParam(name = "includeDemo", defaultValue = "true") boolean includeDemo) {
        List<DemandForecastDto> forecasts = forecastService.getForecasts(destinationId, includeDemo);
        return ResponseEntity.ok(ApiResponse.ok(forecasts));
    }

    @GetMapping("/redistribution")
    public ResponseEntity<ApiResponse<List<RedistributionRecommendationDto>>> getRedistributionRecommendations(
            @RequestParam(name = "includeDemo", defaultValue = "true") boolean includeDemo) {
        List<RedistributionRecommendationDto> recommendations = redistributionService.getActiveRecommendations(includeDemo);
        return ResponseEntity.ok(ApiResponse.ok(recommendations));
    }

    @GetMapping("/redistribution/dynamic")
    public ResponseEntity<ApiResponse<List<DynamicRedistributionPairDto>>> getDynamicRedistributionCorridors(
            @RequestParam(name = "sourceId", required = false) String sourceId,
            @RequestParam(name = "includeDemo", defaultValue = "true") boolean includeDemo,
            @RequestParam(name = "limit", defaultValue = "15") int limit) {
        List<DynamicRedistributionPairDto> corridors = dynamicRedistributionService.calculateDynamicCorridors(sourceId, includeDemo, limit);
        return ResponseEntity.ok(ApiResponse.ok(corridors));
    }

    @GetMapping("/hidden-gems")
    public ResponseEntity<ApiResponse<List<DynamicHiddenGemDto>>> getHiddenGems(
            @RequestParam(name = "includeDemo", defaultValue = "true") boolean includeDemo,
            @RequestParam(name = "limit", defaultValue = "15") int limit) {
        List<DynamicHiddenGemDto> gems = hiddenGemService.discoverHiddenGems(includeDemo, limit);
        return ResponseEntity.ok(ApiResponse.ok(gems));
    }

    @GetMapping("/ecosystem-gaps")
    public ResponseEntity<ApiResponse<List<EcosystemGapDto>>> getEcosystemGaps() {
        List<EcosystemGapDto> gaps = gapDetectionService.detectAndSyncEcosystemGaps();
        return ResponseEntity.ok(ApiResponse.ok(gaps));
    }

    @GetMapping("/alerts")
    public ResponseEntity<ApiResponse<List<GovernmentAlertDto>>> getPrioritizedAlerts(
            @RequestParam(name = "includeDemo", defaultValue = "true") boolean includeDemo) {
        List<GovernmentAlertDto> alerts = alertService.getPrioritizedAlerts(includeDemo);
        return ResponseEntity.ok(ApiResponse.ok(alerts));
    }

    @GetMapping("/map")
    public ResponseEntity<ApiResponse<List<GovernmentMapMarkerDto>>> getMapMarkers(
            @RequestParam(name = "includeDemo", defaultValue = "true") boolean includeDemo) {
        List<GovernmentMapMarkerDto> markers = intelligenceService.getMapMarkers(includeDemo);
        return ResponseEntity.ok(ApiResponse.ok(markers));
    }

    @GetMapping("/local-opportunity")
    public ResponseEntity<ApiResponse<LocalOpportunityDto>> getLocalOpportunity(
            @RequestParam("destinationId") String destinationId) {
        LocalOpportunityDto dto = opportunityService.calculateLocalOpportunity(destinationId);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @GetMapping("/actions/history")
    public ResponseEntity<ApiResponse<List<GovernmentActionResponseDto>>> getActionHistory(
            @RequestParam(name = "status", required = false) GovernmentActionStatus status,
            @RequestParam(name = "priority", required = false) GovernmentActionPriority priority) {
        List<GovernmentActionResponseDto> history = intelligenceService.getActionHistory(status, priority);
        return ResponseEntity.ok(ApiResponse.ok(history));
    }

    @PatchMapping("/actions/{id}/status")
    public ResponseEntity<ApiResponse<GovernmentActionResponseDto>> updateActionStatus(
            @PathVariable("id") String id,
            @RequestBody GovernmentActionStatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        GovernmentActionResponseDto updated = intelligenceService.updateActionStatus(
                id,
                request.getStatus(),
                request.getResolutionNotes(),
                user
        );
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.ok(updated));
    }

    @PostMapping("/recommendations/{id}/review")
    public ResponseEntity<ApiResponse<String>> reviewRecommendation(
            @PathVariable("id") String id,
            @RequestParam(name = "notes", required = false) String notes,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        boolean updated = redistributionService.reviewRecommendation(id, notes, user);
        if (!updated) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.ok("Recommendation marked as REVIEWED."));
    }

    @PostMapping("/actions")
    public ResponseEntity<ApiResponse<GovernmentActionResponseDto>> recordAction(
            @RequestBody GovernmentActionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        GovernmentActionResponseDto saved = intelligenceService.recordAction(request, user);
        return ResponseEntity.ok(ApiResponse.ok(saved));
    }
}
