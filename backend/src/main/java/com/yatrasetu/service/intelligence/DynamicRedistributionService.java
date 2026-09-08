package com.yatrasetu.service.intelligence;

import com.yatrasetu.domain.Destination;
import com.yatrasetu.domain.intelligence.HealthClassification;
import com.yatrasetu.domain.intelligence.IntelligenceSourceType;
import com.yatrasetu.repository.DestinationRepository;
import com.yatrasetu.web.dto.intelligence.DestinationHealthDto;
import com.yatrasetu.web.dto.intelligence.DynamicRedistributionPairDto;
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
public class DynamicRedistributionService {

    private final DestinationRepository destinationRepository;
    private final DestinationHealthService healthService;

    private static final String LIMITATIONS_DISCLAIMER =
            "Potential demand diversification opportunity; not a guaranteed travel shift. " +
            "Pairing is derived from platform activity differentials, shared travel themes, and verified partner capacity.";

    @Transactional(readOnly = true)
    public List<DynamicRedistributionPairDto> calculateDynamicCorridors(String optionalSourceId, boolean includeDemo, int limit) {
        List<Destination> allDestinations = destinationRepository.findAll();
        Map<String, Destination> destMap = new HashMap<>();
        for (Destination d : allDestinations) {
            destMap.put(d.getId(), d);
        }

        List<DestinationHealthDto> healthScores = healthService.getAllDestinationHealthScores(includeDemo);
        Map<String, DestinationHealthDto> healthMap = new HashMap<>();
        for (DestinationHealthDto h : healthScores) {
            healthMap.put(h.getDestinationId(), h);
        }

        // 1. Identify Candidate Sources: High Pressure or Watch (or specific source if requested)
        List<Destination> sources = new ArrayList<>();
        if (optionalSourceId != null && !optionalSourceId.isBlank() && destMap.containsKey(optionalSourceId)) {
            sources.add(destMap.get(optionalSourceId));
        } else {
            for (Destination d : allDestinations) {
                DestinationHealthDto h = healthMap.get(d.getId());
                if (h != null && (h.getClassification() == HealthClassification.HIGH_PRESSURE
                        || h.getClassification() == HealthClassification.WATCH
                        || h.getActivityPressureScore().compareTo(BigDecimal.valueOf(55.0)) >= 0)) {
                    sources.add(d);
                }
            }
        }

        // 2. Identify Candidate Targets: Underutilized or Healthy with solid Local Opportunity
        List<Destination> targets = new ArrayList<>();
        for (Destination d : allDestinations) {
            DestinationHealthDto h = healthMap.get(d.getId());
            if (h != null && (h.getClassification() == HealthClassification.UNDERUTILIZED
                    || (h.getDemandScore().compareTo(BigDecimal.valueOf(40.0)) <= 0
                    && h.getLocalOpportunityScore().compareTo(BigDecimal.valueOf(35.0)) >= 0))) {
                targets.add(d);
            }
        }

        List<DynamicRedistributionPairDto> pairs = new ArrayList<>();
        Set<String> seenPairs = new HashSet<>();

        for (Destination src : sources) {
            DestinationHealthDto srcHealth = healthMap.get(src.getId());
            if (srcHealth == null) continue;

            for (Destination tgt : targets) {
                if (src.getId().equals(tgt.getId())) continue;

                String pairKey = src.getId() + "->" + tgt.getId();
                if (seenPairs.contains(pairKey)) continue;

                DestinationHealthDto tgtHealth = healthMap.get(tgt.getId());
                if (tgtHealth == null) continue;

                // Must have positive pressure differential
                double pressureDiff = srcHealth.getActivityPressureScore().doubleValue() - tgtHealth.getActivityPressureScore().doubleValue();
                if (pressureDiff <= 10.0 && optionalSourceId == null) continue;

                // Shared Theme Analysis
                List<String> srcThemes = src.getTripTypes() != null ? src.getTripTypes() : Collections.emptyList();
                List<String> tgtThemes = tgt.getTripTypes() != null ? tgt.getTripTypes() : Collections.emptyList();

                List<String> sharedThemes = new ArrayList<>();
                for (String st : srcThemes) {
                    for (String tt : tgtThemes) {
                        if (st.equalsIgnoreCase(tt) || st.toLowerCase().contains(tt.toLowerCase()) || tt.toLowerCase().contains(st.toLowerCase())) {
                            if (!sharedThemes.contains(st)) sharedThemes.add(st);
                        }
                    }
                }

                // Geographic Proximity Bonus (Same State or Same Region)
                boolean sameState = src.getState() != null && tgt.getState() != null && src.getState().getId().equals(tgt.getState().getId());
                boolean sameRegion = src.getRegion() != null && tgt.getRegion() != null && src.getRegion().equalsIgnoreCase(tgt.getRegion());

                // Compatibility score (0 - 100)
                double themeScore = Math.min(40.0, sharedThemes.size() * 20.0);
                if (sharedThemes.isEmpty()) themeScore = 10.0; // General tourism baseline
                double diffScore = Math.min(30.0, Math.max(0.0, pressureDiff * 0.5));
                double oppScore = Math.min(20.0, tgtHealth.getLocalOpportunityScore().doubleValue() * 0.2);
                double geoBonus = sameState ? 10.0 : (sameRegion ? 5.0 : 0.0);

                double rawCompat = themeScore + diffScore + oppScore + geoBonus;
                BigDecimal compatScore = BigDecimal.valueOf(Math.min(100.0, Math.max(10.0, rawCompat))).setScale(1, RoundingMode.HALF_UP);

                if (compatScore.compareTo(BigDecimal.valueOf(40.0)) >= 0) {
                    seenPairs.add(pairKey);

                    String reason = String.format(
                            "Both destinations offer complementary %s experiences. %s exhibits lower activity pressure (%s vs %s in %s) with verified local capacity (%s/100).",
                            sharedThemes.isEmpty() ? "travel" : String.join(", ", sharedThemes),
                            tgt.getDestinationName(), tgtHealth.getActivityPressureScore(), srcHealth.getActivityPressureScore(), src.getDestinationName(), tgtHealth.getLocalOpportunityScore()
                    );

                    String benefit = String.format(
                            "Potential estimated demand diversification toward %s (%s) supporting local ecosystem capacity.",
                            tgt.getDestinationName(), tgt.getState() != null ? tgt.getState().getStateName() : "regional"
                    );

                    pairs.add(DynamicRedistributionPairDto.builder()
                            .sourceDestinationId(src.getId())
                            .sourceDestinationName(src.getDestinationName())
                            .sourceStateName(src.getState() != null ? src.getState().getStateName() : "India")
                            .sourceActivityPressureScore(srcHealth.getActivityPressureScore())
                            .sourceDemandScore(srcHealth.getDemandScore())
                            .targetDestinationId(tgt.getId())
                            .targetDestinationName(tgt.getDestinationName())
                            .targetStateName(tgt.getState() != null ? tgt.getState().getStateName() : "India")
                            .targetActivityPressureScore(tgtHealth.getActivityPressureScore())
                            .targetLocalOpportunityScore(tgtHealth.getLocalOpportunityScore())
                            .pressureDifferential(BigDecimal.valueOf(pressureDiff).setScale(1, RoundingMode.HALF_UP))
                            .compatibilityScore(compatScore)
                            .sharedThemes(sharedThemes)
                            .reason(reason)
                            .expectedPotentialBenefit(benefit)
                            .sourceType(includeDemo ? IntelligenceSourceType.DEMO : IntelligenceSourceType.DERIVED)
                            .limitationsDisclaimer(LIMITATIONS_DISCLAIMER)
                            .build());
                }
            }
        }

        pairs.sort((a, b) -> b.getCompatibilityScore().compareTo(a.getCompatibilityScore()));
        return pairs.stream().limit(Math.max(1, limit)).toList();
    }
}
