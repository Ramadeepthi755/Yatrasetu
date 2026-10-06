package com.yatrasetu.service.intelligence;

import com.yatrasetu.domain.Destination;
import com.yatrasetu.domain.intelligence.HealthClassification;
import com.yatrasetu.domain.intelligence.IntelligenceSourceType;
import com.yatrasetu.domain.intelligence.TourismDestinationScore;
import com.yatrasetu.repository.DestinationPoiRepository;
import com.yatrasetu.repository.DestinationRepository;
import com.yatrasetu.repository.intelligence.TourismDestinationScoreRepository;
import com.yatrasetu.repository.intelligence.TourismRedistributionRecommendationRepository;
import com.yatrasetu.web.dto.intelligence.DemandTrendDto;
import com.yatrasetu.web.dto.intelligence.DestinationHealthDto;
import com.yatrasetu.web.dto.intelligence.LocalOpportunityDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DestinationHealthService {

    private final DestinationRepository destinationRepository;
    private final DestinationPoiRepository poiRepository;
    private final TourismDemandService demandService;
    private final LocalOpportunityService opportunityService;
    private final TourismDestinationScoreRepository scoreRepository;
    private final TourismRedistributionRecommendationRepository redistributionRepository;

    private static final String PROXY_DISCLAIMER =
            "Activity pressure and sustainability scores are derived proxies based on YatraSetu traveler interest, " +
            "attraction density, and seasonal patterns. They do not represent physical crowd counts or environmental sensor data.";

    @Transactional
    public DestinationHealthDto calculateHealth(String destinationId, boolean includeDemo) {
        Destination destination = destinationRepository.findById(destinationId).orElse(null);
        if (destination == null) return null;

        DemandTrendDto demandTrend = demandService.getDestinationDemandTrend(destinationId, 30, includeDemo);
        LocalOpportunityDto opportunity = opportunityService.calculateLocalOpportunity(destinationId);

        BigDecimal demandScore = demandTrend != null ? demandTrend.getDemandScore() : BigDecimal.ZERO;
        long totalSignals = demandTrend != null ? demandTrend.getCurrentDemand() + demandTrend.getPreviousDemand() : 0;

        // POI density proxy: more POIs distribute demand better
        long poiCount = poiRepository.findByDestinationId(destinationId).size();
        double capacityFactor = Math.max(1.0, poiCount * 1.5);

        // Activity Pressure proxy (Demand relative to attraction capacity)
        double rawPressure = (demandScore.doubleValue() * 1.4) / Math.sqrt(capacityFactor);
        double clampedPressure = Math.min(100.0, Math.max(5.0, rawPressure));
        BigDecimal activityPressureScore = BigDecimal.valueOf(clampedPressure).setScale(1, RoundingMode.HALF_UP);

        // Accessibility Score based on destination road/rail/air metadata
        double rawAccessibility = 60.0;
        if (destination.getAccessibility() != null) {
            String acc = destination.getAccessibility().toLowerCase();
            if (acc.contains("easy")) rawAccessibility = 85.0;
            else if (acc.contains("moderate")) rawAccessibility = 60.0;
            else rawAccessibility = 40.0;
        }
        if (destination.getNearestAirport() != null && !destination.getNearestAirport().isBlank()) rawAccessibility += 10.0;
        BigDecimal accessibilityScore = BigDecimal.valueOf(Math.min(100.0, rawAccessibility)).setScale(1, RoundingMode.HALF_UP);

        // Sustainability Proxy Score: inverse of activity pressure balanced with safety rating
        double safetyFactor = destination.getSafetyRating() != null ? destination.getSafetyRating().doubleValue() * 10.0 : 80.0;
        double rawSustainability = ((100.0 - clampedPressure) * 0.6) + (safetyFactor * 0.4);
        BigDecimal sustainabilityProxyScore = BigDecimal.valueOf(Math.min(100.0, Math.max(10.0, rawSustainability))).setScale(1, RoundingMode.HALF_UP);

        BigDecimal localOpportunityScore = opportunity != null ? opportunity.getOpportunityScore() : BigDecimal.valueOf(50.0);

        // Overall Score (Weighted combination)
        double overallRaw = (demandScore.doubleValue() * 0.25)
                + (activityPressureScore.doubleValue() * 0.25)
                + (localOpportunityScore.doubleValue() * 0.20)
                + (accessibilityScore.doubleValue() * 0.15)
                + (sustainabilityProxyScore.doubleValue() * 0.15);
        BigDecimal overallScore = BigDecimal.valueOf(overallRaw).setScale(1, RoundingMode.HALF_UP);

        // Classification
        HealthClassification classification;
        if (totalSignals < 2 && !includeDemo) {
            classification = HealthClassification.INSUFFICIENT_DATA;
        } else if (activityPressureScore.compareTo(BigDecimal.valueOf(75.0)) >= 0 && demandScore.compareTo(BigDecimal.valueOf(60.0)) >= 0) {
            classification = HealthClassification.HIGH_PRESSURE;
        } else if (activityPressureScore.compareTo(BigDecimal.valueOf(60.0)) >= 0) {
            classification = HealthClassification.WATCH;
        } else if (demandScore.compareTo(BigDecimal.valueOf(35.0)) <= 0 && localOpportunityScore.compareTo(BigDecimal.valueOf(50.0)) >= 0) {
            classification = HealthClassification.UNDERUTILIZED;
        } else {
            classification = HealthClassification.HEALTHY;
        }

        String explanation = generateHealthExplanation(destination.getDestinationName(), classification, demandScore, activityPressureScore);
        int altCount = redistributionRepository.findBySourceDestinationId(destinationId).size();

        // Update/Persist score record for today
        LocalDate today = LocalDate.now();
        TourismDestinationScore scoreRecord = scoreRepository.findByDestinationIdAndScoreDate(destinationId, today)
                .orElse(TourismDestinationScore.builder()
                        .id("score-" + destinationId + "-" + today)
                        .destination(destination)
                        .scoreDate(today)
                        .build());

        scoreRecord.setDemandScore(demandScore);
        scoreRecord.setActivityPressureScore(activityPressureScore);
        scoreRecord.setLocalOpportunityScore(localOpportunityScore);
        scoreRecord.setAccessibilityScore(accessibilityScore);
        scoreRecord.setSustainabilityProxyScore(sustainabilityProxyScore);
        scoreRecord.setOverallScore(overallScore);
        scoreRecord.setClassification(classification);
        scoreRecord.setSourceType(includeDemo ? IntelligenceSourceType.DEMO : IntelligenceSourceType.DERIVED);
        scoreRecord.setConfidenceScore(totalSignals > 2 ? BigDecimal.valueOf(0.85) : BigDecimal.valueOf(0.50));
        scoreRecord.setExplanation(explanation);
        scoreRepository.save(scoreRecord);

        return DestinationHealthDto.builder()
                .destinationId(destination.getId())
                .destinationName(destination.getDestinationName())
                .stateName(destination.getState() != null ? destination.getState().getStateName() : "India")
                .classification(classification)
                .overallScore(overallScore)
                .demandScore(demandScore)
                .activityPressureScore(activityPressureScore)
                .localOpportunityScore(localOpportunityScore)
                .accessibilityScore(accessibilityScore)
                .sustainabilityProxyScore(sustainabilityProxyScore)
                .sourceType(includeDemo ? IntelligenceSourceType.DEMO : IntelligenceSourceType.DERIVED)
                .confidence(totalSignals > 2 ? BigDecimal.valueOf(0.85) : BigDecimal.valueOf(0.50))
                .explanation(explanation)
                .scoreDate(today)
                .alternativeOptionsCount(altCount)
                .proxyDisclaimer(PROXY_DISCLAIMER)
                .build();
    }

    @Transactional(readOnly = true)
    public List<DestinationHealthDto> getAllDestinationHealthScores(boolean includeDemo) {
        List<Destination> destinations = destinationRepository.findAll();
        Map<String, Long> poiCounts = toCountMap(poiRepository.countPoisByDestination());
        Map<String, Long> altCounts = toCountMap(redistributionRepository.countBySourceDestination());
        Map<String, LocalOpportunityDto> oppMap = opportunityService.calculateAllLocalOpportunities();
        List<DemandTrendDto> trends = demandService.getDemandTrends(30, includeDemo);
        Map<String, DemandTrendDto> trendMap = new HashMap<>();
        for (DemandTrendDto t : trends) {
            trendMap.put(t.getDestinationId(), t);
        }

        List<DestinationHealthDto> scores = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (Destination destination : destinations) {
            DemandTrendDto demandTrend = trendMap.get(destination.getId());
            LocalOpportunityDto opportunity = oppMap.get(destination.getId());

            BigDecimal demandScore = demandTrend != null ? demandTrend.getDemandScore() : BigDecimal.ZERO;
            long totalSignals = demandTrend != null ? demandTrend.getCurrentDemand() + demandTrend.getPreviousDemand() : 0;

            long poiCount = poiCounts.getOrDefault(destination.getId(), 0L);
            double capacityFactor = Math.max(1.0, poiCount * 1.5);

            double rawPressure = (demandScore.doubleValue() * 1.4) / Math.sqrt(capacityFactor);
            double clampedPressure = Math.min(100.0, Math.max(5.0, rawPressure));
            BigDecimal activityPressureScore = BigDecimal.valueOf(clampedPressure).setScale(1, RoundingMode.HALF_UP);

            double rawAccessibility = 60.0;
            if (destination.getAccessibility() != null) {
                String acc = destination.getAccessibility().toLowerCase();
                if (acc.contains("easy")) rawAccessibility = 85.0;
                else if (acc.contains("moderate")) rawAccessibility = 60.0;
                else rawAccessibility = 40.0;
            }
            if (destination.getNearestAirport() != null && !destination.getNearestAirport().isBlank()) rawAccessibility += 10.0;
            BigDecimal accessibilityScore = BigDecimal.valueOf(Math.min(100.0, rawAccessibility)).setScale(1, RoundingMode.HALF_UP);

            double safetyFactor = destination.getSafetyRating() != null ? destination.getSafetyRating().doubleValue() * 10.0 : 80.0;
            double rawSustainability = ((100.0 - clampedPressure) * 0.6) + (safetyFactor * 0.4);
            BigDecimal sustainabilityProxyScore = BigDecimal.valueOf(Math.min(100.0, Math.max(10.0, rawSustainability))).setScale(1, RoundingMode.HALF_UP);

            BigDecimal localOpportunityScore = opportunity != null ? opportunity.getOpportunityScore() : BigDecimal.valueOf(50.0);

            double overallRaw = (demandScore.doubleValue() * 0.25)
                    + (activityPressureScore.doubleValue() * 0.25)
                    + (localOpportunityScore.doubleValue() * 0.20)
                    + (accessibilityScore.doubleValue() * 0.15)
                    + (sustainabilityProxyScore.doubleValue() * 0.15);
            BigDecimal overallScore = BigDecimal.valueOf(overallRaw).setScale(1, RoundingMode.HALF_UP);

            HealthClassification classification;
            if (totalSignals < 2 && !includeDemo) {
                classification = HealthClassification.INSUFFICIENT_DATA;
            } else if (activityPressureScore.compareTo(BigDecimal.valueOf(75.0)) >= 0 && demandScore.compareTo(BigDecimal.valueOf(60.0)) >= 0) {
                classification = HealthClassification.HIGH_PRESSURE;
            } else if (activityPressureScore.compareTo(BigDecimal.valueOf(60.0)) >= 0) {
                classification = HealthClassification.WATCH;
            } else if (demandScore.compareTo(BigDecimal.valueOf(35.0)) <= 0 && localOpportunityScore.compareTo(BigDecimal.valueOf(50.0)) >= 0) {
                classification = HealthClassification.UNDERUTILIZED;
            } else {
                classification = HealthClassification.HEALTHY;
            }

            String explanation = generateHealthExplanation(destination.getDestinationName(), classification, demandScore, activityPressureScore);
            long altCount = altCounts.getOrDefault(destination.getId(), 0L);

            scores.add(DestinationHealthDto.builder()
                    .destinationId(destination.getId())
                    .destinationName(destination.getDestinationName())
                    .stateName(destination.getState() != null ? destination.getState().getStateName() : "India")
                    .classification(classification)
                    .overallScore(overallScore)
                    .demandScore(demandScore)
                    .activityPressureScore(activityPressureScore)
                    .localOpportunityScore(localOpportunityScore)
                    .accessibilityScore(accessibilityScore)
                    .sustainabilityProxyScore(sustainabilityProxyScore)
                    .sourceType(includeDemo ? IntelligenceSourceType.DEMO : IntelligenceSourceType.DERIVED)
                    .confidence(totalSignals > 2 ? BigDecimal.valueOf(0.85) : BigDecimal.valueOf(0.50))
                    .explanation(explanation)
                    .scoreDate(today)
                    .alternativeOptionsCount((int) altCount)
                    .proxyDisclaimer(PROXY_DISCLAIMER)
                    .build());
        }
        return scores;
    }

    private Map<String, Long> toCountMap(List<Object[]> rows) {
        Map<String, Long> map = new HashMap<>();
        if (rows == null) return map;
        for (Object[] r : rows) {
            if (r != null && r.length >= 2 && r[0] != null) {
                map.put((String) r[0], ((Number) r[1]).longValue());
            }
        }
        return map;
    }

    private String generateHealthExplanation(String name, HealthClassification classification, BigDecimal demand, BigDecimal pressure) {
        return switch (classification) {
            case HIGH_PRESSURE -> String.format("%s exhibits elevated activity pressure (%s) relative to local attraction capacity, indicating demand concentration.", name, pressure);
            case WATCH -> String.format("%s is under observation with rising demand activity (%s) and moderate pressure index (%s).", name, demand, pressure);
            case UNDERUTILIZED -> String.format("%s currently displays low observed platform demand (%s) alongside strong local partner capacity, presenting significant growth opportunity.", name, demand);
            case INSUFFICIENT_DATA -> String.format("Insufficient YatraSetu traveler activity recorded for %s to generate a reliable health classification.", name);
            case HEALTHY -> String.format("%s maintains a balanced ratio of traveler demand (%s) to local capacity and transport connectivity.", name, demand);
        };
    }
}
