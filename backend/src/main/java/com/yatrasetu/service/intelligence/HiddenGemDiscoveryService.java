package com.yatrasetu.service.intelligence;

import com.yatrasetu.domain.Destination;
import com.yatrasetu.domain.intelligence.HealthClassification;
import com.yatrasetu.domain.intelligence.IntelligenceSourceType;
import com.yatrasetu.repository.DestinationPoiRepository;
import com.yatrasetu.repository.DestinationRepository;
import com.yatrasetu.web.dto.intelligence.DestinationHealthDto;
import com.yatrasetu.web.dto.intelligence.DynamicHiddenGemDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class HiddenGemDiscoveryService {

    private final DestinationRepository destinationRepository;
    private final DestinationPoiRepository poiRepository;
    private final DestinationHealthService healthService;

    private static final String DISCLAIMER =
            "Hidden Gem score is an algorithmic ranking based on verified platform capacity, POI richness, " +
            "and low observed demand concentration. It does not measure physical municipal tourism counts.";

    @Transactional(readOnly = true)
    public List<DynamicHiddenGemDto> discoverHiddenGems(boolean includeDemo, int limit) {
        List<Destination> destinations = destinationRepository.findAll();
        Map<String, Long> poiCounts = toCountMap(poiRepository.countPoisByDestination());
        List<DestinationHealthDto> healthScores = healthService.getAllDestinationHealthScores(includeDemo);

        Map<String, DestinationHealthDto> healthMap = new HashMap<>();
        for (DestinationHealthDto h : healthScores) {
            healthMap.put(h.getDestinationId(), h);
        }

        List<DynamicHiddenGemDto> gems = new ArrayList<>();

        for (Destination dest : destinations) {
            DestinationHealthDto health = healthMap.get(dest.getId());
            if (health == null) continue;

            BigDecimal demand = health.getDemandScore();
            BigDecimal opportunity = health.getLocalOpportunityScore();
            BigDecimal pressure = health.getActivityPressureScore();
            BigDecimal accessibility = health.getAccessibilityScore();
            BigDecimal sustainability = health.getSustainabilityProxyScore();

            // Hidden Gem Criteria: Low/moderate demand (<= 45) and solid local opportunity / capacity (>= 35)
            if (demand.compareTo(BigDecimal.valueOf(45.0)) <= 0 && opportunity.compareTo(BigDecimal.valueOf(35.0)) >= 0) {
                long pois = poiCounts.getOrDefault(dest.getId(), 0L);

                // Algorithmic Hidden Gem Score (0 - 100)
                double rawGemScore = (opportunity.doubleValue() * 0.35)
                        + (sustainability.doubleValue() * 0.25)
                        + (accessibility.doubleValue() * 0.20)
                        + (Math.min(10.0, pois * 2.0) * 1.5)
                        + (Math.max(0.0, (45.0 - demand.doubleValue())) * 0.5);

                double normalizedGemScore = Math.min(100.0, Math.max(10.0, rawGemScore));
                BigDecimal gemScore = BigDecimal.valueOf(normalizedGemScore).setScale(1, RoundingMode.HALF_UP);

                String explanation = String.format(
                        "%s offers rich cultural/natural attraction density (%d key POIs) with strong local partner capacity (%s/100) and low platform activity pressure (%s/100).",
                        dest.getDestinationName(), pois, opportunity, pressure
                );

                gems.add(DynamicHiddenGemDto.builder()
                        .destinationId(dest.getId())
                        .destinationName(dest.getDestinationName())
                        .stateName(dest.getState() != null ? dest.getState().getStateName() : "India")
                        .cityName(dest.getCity() != null ? dest.getCity().getCityName() : "")
                        .classification(health.getClassification())
                        .demandScore(demand)
                        .activityPressureScore(pressure)
                        .localOpportunityScore(opportunity)
                        .accessibilityScore(accessibility)
                        .sustainabilityProxyScore(sustainability)
                        .poiCount((int) pois)
                        .tripTypes(dest.getTripTypes() != null ? dest.getTripTypes() : Collections.emptyList())
                        .hiddenGemScore(gemScore)
                        .explanation(explanation)
                        .sourceType(includeDemo ? IntelligenceSourceType.DEMO : IntelligenceSourceType.DERIVED)
                        .disclaimer(DISCLAIMER)
                        .build());
            }
        }

        gems.sort((a, b) -> b.getHiddenGemScore().compareTo(a.getHiddenGemScore()));
        return gems.stream().limit(Math.max(1, limit)).toList();
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
}
