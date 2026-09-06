package com.yatrasetu.service.intelligence;

import com.yatrasetu.domain.CulturalTradition;
import com.yatrasetu.domain.Destination;
import com.yatrasetu.domain.Experience;
import com.yatrasetu.domain.ExperienceVerificationStatus;
import com.yatrasetu.domain.LocalHost;
import com.yatrasetu.domain.PartnerSubtype;
import com.yatrasetu.domain.intelligence.CulturalOpportunityClassification;
import com.yatrasetu.domain.intelligence.CulturalSupplyDemandMatrixCategory;
import com.yatrasetu.domain.intelligence.IntelligenceSourceType;
import com.yatrasetu.repository.CulturalTraditionRepository;
import com.yatrasetu.repository.DestinationRepository;
import com.yatrasetu.repository.ExperienceRepository;
import com.yatrasetu.repository.LocalHostRepository;
import com.yatrasetu.repository.intelligence.TourismDemandSignalRepository;
import com.yatrasetu.repository.intelligence.TourismEcosystemGapRepository;
import com.yatrasetu.web.dto.intelligence.CulturalOpportunityDto;
import com.yatrasetu.web.dto.intelligence.CulturalOpportunityOverviewDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CulturalOpportunityService {

    private final DestinationRepository destinationRepository;
    private final CulturalTraditionRepository culturalTraditionRepository;
    private final ExperienceRepository experienceRepository;
    private final LocalHostRepository localHostRepository;
    private final TourismDemandSignalRepository signalRepository;
    private final TourismEcosystemGapRepository gapRepository;

    private static final String DATA_DISCLAIMER =
            "Platform-derived intelligence proxy based on YatraSetu authentic cultural traditions, " +
            "verified experience supply, and observed traveler activity. Does not represent official government GDP or physical footfall.";

    /**
     * Calculate Cultural Opportunity for a single destination.
     */
    @Transactional(readOnly = true)
    public CulturalOpportunityDto calculateDestinationOpportunity(String destinationId, boolean includeDemo) {
        Destination destination = destinationRepository.findById(destinationId).orElse(null);
        if (destination == null) return null;

        List<CulturalOpportunityDto> all = calculateAllCulturalOpportunities(includeDemo);
        return all.stream()
                .filter(o -> o.getDestinationId().equals(destinationId))
                .findFirst()
                .orElse(null);
    }

    /**
     * Calculate Cultural Opportunity Scores in bulk across all destinations with zero N+1 database queries.
     */
    @Transactional(readOnly = true)
    public List<CulturalOpportunityDto> calculateAllCulturalOpportunities(boolean includeDemo) {
        List<Destination> destinations = destinationRepository.findAll();
        List<CulturalTradition> allTraditions = culturalTraditionRepository.findAll().stream()
                .filter(CulturalTradition::getIsActive)
                .toList();

        // Group traditions by destination, city, and state
        Map<String, List<CulturalTradition>> traditionsByDest = new HashMap<>();
        Map<String, List<CulturalTradition>> traditionsByCity = new HashMap<>();
        Map<String, List<CulturalTradition>> traditionsByState = new HashMap<>();

        for (CulturalTradition ct : allTraditions) {
            if (ct.getDestination() != null) {
                traditionsByDest.computeIfAbsent(ct.getDestination().getId(), k -> new ArrayList<>()).add(ct);
            }
            if (ct.getCity() != null) {
                traditionsByCity.computeIfAbsent(ct.getCity().getId(), k -> new ArrayList<>()).add(ct);
            }
            if (ct.getState() != null) {
                traditionsByState.computeIfAbsent(ct.getState().getId(), k -> new ArrayList<>()).add(ct);
            }
        }

        // Verified cultural experiences
        List<Experience> allExperiences = experienceRepository.findAll();
        Map<String, List<Experience>> verifiedExpByDest = new HashMap<>();
        for (Experience exp : allExperiences) {
            boolean isVerifiedCultural = exp.getIsActive()
                    && exp.getCulturalTradition() != null
                    && (exp.getVerificationStatus() == ExperienceVerificationStatus.VERIFIED || (includeDemo && Boolean.TRUE.equals(exp.getIsDemoData())));

            if (isVerifiedCultural && exp.getDestination() != null) {
                verifiedExpByDest.computeIfAbsent(exp.getDestination().getId(), k -> new ArrayList<>()).add(exp);
            }
        }

        // Verified Artisan Hosts
        List<LocalHost> allHosts = localHostRepository.findAll();
        Map<String, Long> artisanHostsByDest = new HashMap<>();
        for (LocalHost host : allHosts) {
            if (host.getDestination() != null && host.getUser() != null && host.getUser().getPartnerSubtype() == PartnerSubtype.ARTISAN) {
                artisanHostsByDest.put(host.getDestination().getId(), artisanHostsByDest.getOrDefault(host.getDestination().getId(), 0L) + 1);
            }
        }

        // Demand signals in past 30 days
        LocalDate now = LocalDate.now();
        LocalDate startDate = now.minusDays(30);
        List<Object[]> signalRows = signalRepository.sumSignalsByDestinationBetween(startDate, now, includeDemo);
        Map<String, Long> demandSignalsByDest = new HashMap<>();
        for (Object[] row : signalRows) {
            if (row != null && row.length >= 2 && row[0] != null) {
                demandSignalsByDest.put((String) row[0], ((Number) row[1]).longValue());
            }
        }

        long maxDemand = demandSignalsByDest.values().stream().max(Long::compare).orElse(1L);
        if (maxDemand < 1) maxDemand = 1;

        List<CulturalOpportunityDto> results = new ArrayList<>();

        for (Destination dest : destinations) {
            String destId = dest.getId();
            String cityId = dest.getCity() != null ? dest.getCity().getId() : null;
            String stateId = dest.getState() != null ? dest.getState().getId() : null;

            List<CulturalTradition> destTraditions = traditionsByDest.getOrDefault(destId, Collections.emptyList());
            List<CulturalTradition> cityTraditions = cityId != null ? traditionsByCity.getOrDefault(cityId, Collections.emptyList()) : Collections.emptyList();
            List<CulturalTradition> stateTraditions = stateId != null ? traditionsByState.getOrDefault(stateId, Collections.emptyList()) : Collections.emptyList();

            // Distinct union of traditions associated with this destination node
            Set<String> uniqueTraditionIds = new HashSet<>();
            List<CulturalTradition> applicableTraditions = new ArrayList<>();
            for (CulturalTradition ct : destTraditions) {
                if (uniqueTraditionIds.add(ct.getId())) applicableTraditions.add(ct);
            }
            for (CulturalTradition ct : cityTraditions) {
                if (uniqueTraditionIds.add(ct.getId())) applicableTraditions.add(ct);
            }
            for (CulturalTradition ct : stateTraditions) {
                if (uniqueTraditionIds.add(ct.getId())) applicableTraditions.add(ct);
            }

            int destTradCount = destTraditions.size();
            int cityTradCount = cityTraditions.size();
            int stateTradCount = stateTraditions.size();
            int giCount = (int) applicableTraditions.stream().filter(t -> Boolean.TRUE.equals(t.getIsGiTagged())).count();
            int totalTradCount = applicableTraditions.size();

            long demandSignals = demandSignalsByDest.getOrDefault(destId, 0L);
            List<Experience> verifiedExps = verifiedExpByDest.getOrDefault(destId, Collections.emptyList());
            int verifiedExpCount = verifiedExps.size();
            int artisanHostCount = artisanHostsByDest.getOrDefault(destId, 0L).intValue();

            // Insufficient data evaluation
            if (totalTradCount == 0 && demandSignals == 0) {
                results.add(CulturalOpportunityDto.builder()
                        .destinationId(destId)
                        .destinationName(dest.getDestinationName())
                        .cityId(cityId)
                        .cityName(dest.getCity() != null ? dest.getCity().getCityName() : null)
                        .stateId(stateId)
                        .stateName(dest.getState() != null ? dest.getState().getStateName() : "India")
                        .score(null)
                        .status("INSUFFICIENT_DATA")
                        .confidence("INSUFFICIENT")
                        .classification(CulturalOpportunityClassification.INSUFFICIENT_DATA)
                        .matrixCategory(CulturalSupplyDemandMatrixCategory.INSUFFICIENT_DATA)
                        .traditionScore(BigDecimal.ZERO)
                        .demandScore(BigDecimal.ZERO)
                        .supplyScore(BigDecimal.ZERO)
                        .gapPenalty(BigDecimal.ZERO)
                        .traditionCount(0)
                        .destinationTraditionCount(0)
                        .cityTraditionCount(0)
                        .stateTraditionCount(0)
                        .giTraditionCount(0)
                        .observedDemandSignals(0L)
                        .verifiedExperienceCount(0)
                        .verifiedArtisanCount(0)
                        .detectedGaps(Collections.emptyList())
                        .explanations(List.of("Insufficient production data to calculate a reliable Cultural Opportunity Score."))
                        .suggestedActions(List.of("Map authentic local cultural traditions and establish baseline tourism monitoring for this hub."))
                        .dataMode(includeDemo ? IntelligenceSourceType.DEMO : IntelligenceSourceType.OBSERVED)
                        .disclaimer(DATA_DISCLAIMER)
                        .generatedAt(Instant.now())
                        .build());
                continue;
            }

            // 1. Tradition Component (0 to 30)
            double rawTradition = 0.0;
            rawTradition += (destTradCount * 10.0);
            rawTradition += (cityTradCount * 6.0);
            double contextualState = Math.min(8.0, stateTradCount * 2.0);
            rawTradition += contextualState;
            rawTradition += (giCount * 2.0); // GI bonus
            double clampedTradition = Math.min(30.0, Math.max(0.0, rawTradition));
            BigDecimal traditionScore = BigDecimal.valueOf(clampedTradition).setScale(1, RoundingMode.HALF_UP);

            // 2. Demand Component (0 to 35)
            double demandRatio = (double) demandSignals / (double) maxDemand;
            double rawDemand = demandRatio * 35.0;
            double clampedDemand = Math.min(35.0, Math.max(0.0, rawDemand));
            BigDecimal demandScore = BigDecimal.valueOf(clampedDemand).setScale(1, RoundingMode.HALF_UP);

            // 3. Supply Component (0 to 25)
            // Represents headroom/opportunity to create new verified cultural experiences
            double rawSupply;
            if (verifiedExpCount == 0) rawSupply = 25.0;
            else if (verifiedExpCount == 1) rawSupply = 18.0;
            else if (verifiedExpCount == 2) rawSupply = 12.0;
            else if (verifiedExpCount == 3) rawSupply = 8.0;
            else rawSupply = 5.0; // Mature ecosystem
            BigDecimal supplyScore = BigDecimal.valueOf(rawSupply).setScale(1, RoundingMode.HALF_UP);

            // 4. Gap Penalty (0 to 20)
            List<String> gaps = new ArrayList<>();
            double rawPenalty = 0.0;

            // CULTURAL_EXPERIENCE_DEFICIT
            if (totalTradCount >= 1 && (demandSignals >= 3 || clampedDemand >= 8.0) && verifiedExpCount == 0) {
                rawPenalty += 10.0;
                gaps.add("CULTURAL_EXPERIENCE_DEFICIT: Authentic cultural traditions exist alongside active traveler demand, but 0 verified cultural experiences are listed.");
            }

            // ARTISAN_PARTNER_DEFICIT
            if (totalTradCount >= 1 && artisanHostCount == 0) {
                rawPenalty += 5.0;
                gaps.add("ARTISAN_PARTNER_DEFICIT: No registered artisan partners verified in this destination cluster.");
            }

            // CONNECTIVITY_GAP
            if (dest.getAccessibility() != null && dest.getAccessibility().toLowerCase().contains("difficult")) {
                rawPenalty += 5.0;
                gaps.add("CONNECTIVITY_CONSTRAINT: Regional transport transit nodes present moderate access friction.");
            }

            double clampedPenalty = Math.min(20.0, Math.max(0.0, rawPenalty));
            BigDecimal gapPenalty = BigDecimal.valueOf(clampedPenalty).setScale(1, RoundingMode.HALF_UP);

            // Final Opportunity Score = min(100, max(0, Tradition + Demand + Supply - Gap Penalty))
            double finalRaw = clampedTradition + clampedDemand + rawSupply - clampedPenalty;
            double finalClamped = Math.min(100.0, Math.max(0.0, finalRaw));
            BigDecimal score = BigDecimal.valueOf(finalClamped).setScale(1, RoundingMode.HALF_UP);

            // Classification
            CulturalOpportunityClassification classification;
            if (score.compareTo(BigDecimal.valueOf(80.0)) >= 0) {
                classification = CulturalOpportunityClassification.HIGH_OPPORTUNITY;
            } else if (score.compareTo(BigDecimal.valueOf(60.0)) >= 0) {
                classification = CulturalOpportunityClassification.MODERATE_OPPORTUNITY;
            } else if (score.compareTo(BigDecimal.valueOf(40.0)) >= 0) {
                classification = CulturalOpportunityClassification.EMERGING_OPPORTUNITY;
            } else {
                classification = CulturalOpportunityClassification.LOWER_OPPORTUNITY;
            }

            // Matrix Category
            CulturalSupplyDemandMatrixCategory matrixCat;
            boolean isHighDemand = clampedDemand >= 12.0;
            boolean isHighSupply = verifiedExpCount >= 2;

            if (isHighDemand && !isHighSupply) {
                matrixCat = CulturalSupplyDemandMatrixCategory.HIGH_DEMAND_LOW_SUPPLY;
            } else if (isHighDemand && isHighSupply) {
                matrixCat = CulturalSupplyDemandMatrixCategory.HIGH_DEMAND_HIGH_SUPPLY;
            } else if (!isHighDemand && !isHighSupply) {
                matrixCat = CulturalSupplyDemandMatrixCategory.LOW_DEMAND_LOW_SUPPLY;
            } else {
                matrixCat = CulturalSupplyDemandMatrixCategory.LOW_DEMAND_HIGH_SUPPLY;
            }

            // Confidence
            String confidence;
            if (destTradCount >= 1 && demandSignals >= 4) {
                confidence = "HIGH";
            } else if ((cityTradCount >= 1 || totalTradCount >= 2) && demandSignals >= 1) {
                confidence = "MEDIUM";
            } else {
                confidence = "LOW";
            }

            // Generate Explanations
            List<String> explanations = generateExplanations(dest.getDestinationName(), clampedTradition, clampedDemand, rawSupply, clampedPenalty, destTradCount, giCount, demandSignals, verifiedExpCount);

            // Generate Suggested Actions
            List<String> suggestedActions = generateSuggestedActions(dest.getDestinationName(), matrixCat, verifiedExpCount, artisanHostCount, totalTradCount);

            results.add(CulturalOpportunityDto.builder()
                    .destinationId(destId)
                    .destinationName(dest.getDestinationName())
                    .cityId(cityId)
                    .cityName(dest.getCity() != null ? dest.getCity().getCityName() : null)
                    .stateId(stateId)
                    .stateName(dest.getState() != null ? dest.getState().getStateName() : "India")
                    .score(score)
                    .status("SUFFICIENT_DATA")
                    .confidence(confidence)
                    .classification(classification)
                    .matrixCategory(matrixCat)
                    .traditionScore(traditionScore)
                    .demandScore(demandScore)
                    .supplyScore(supplyScore)
                    .gapPenalty(gapPenalty)
                    .traditionCount(totalTradCount)
                    .destinationTraditionCount(destTradCount)
                    .cityTraditionCount(cityTradCount)
                    .stateTraditionCount(stateTradCount)
                    .giTraditionCount(giCount)
                    .observedDemandSignals(demandSignals)
                    .verifiedExperienceCount(verifiedExpCount)
                    .verifiedArtisanCount(artisanHostCount)
                    .detectedGaps(gaps)
                    .explanations(explanations)
                    .suggestedActions(suggestedActions)
                    .dataMode(includeDemo ? IntelligenceSourceType.DEMO : IntelligenceSourceType.OBSERVED)
                    .disclaimer(DATA_DISCLAIMER)
                    .generatedAt(Instant.now())
                    .build());
        }

        // Sort descending by score (nulls last)
        results.sort((a, b) -> {
            if (a.getScore() == null && b.getScore() == null) return 0;
            if (a.getScore() == null) return 1;
            if (b.getScore() == null) return -1;
            return b.getScore().compareTo(a.getScore());
        });

        return results;
    }

    /**
     * Get macro overview statistics for government dashboard.
     */
    @Transactional(readOnly = true)
    public CulturalOpportunityOverviewDto getOverview(boolean includeDemo) {
        List<CulturalOpportunityDto> all = calculateAllCulturalOpportunities(includeDemo);

        long total = all.size();
        long sufficient = all.stream().filter(o -> "SUFFICIENT_DATA".equals(o.getStatus())).count();
        long insufficient = total - sufficient;

        List<CulturalOpportunityDto> scoredList = all.stream().filter(o -> o.getScore() != null).toList();
        double avgScore = scoredList.isEmpty() ? 0.0 :
                scoredList.stream().mapToDouble(o -> o.getScore().doubleValue()).average().orElse(0.0);

        long highCount = all.stream().filter(o -> o.getClassification() == CulturalOpportunityClassification.HIGH_OPPORTUNITY).count();
        long modCount = all.stream().filter(o -> o.getClassification() == CulturalOpportunityClassification.MODERATE_OPPORTUNITY).count();
        long emergCount = all.stream().filter(o -> o.getClassification() == CulturalOpportunityClassification.EMERGING_OPPORTUNITY).count();
        long lowCount = all.stream().filter(o -> o.getClassification() == CulturalOpportunityClassification.LOWER_OPPORTUNITY).count();

        long expDeficitCount = all.stream().filter(o -> o.getDetectedGaps() != null && o.getDetectedGaps().stream().anyMatch(g -> g.contains("CULTURAL_EXPERIENCE_DEFICIT"))).count();
        long giRichCount = all.stream().filter(o -> o.getGiTraditionCount() >= 2).count();

        Map<String, Long> matrixDist = new LinkedHashMap<>();
        matrixDist.put("HIGH_DEMAND_LOW_SUPPLY", all.stream().filter(o -> o.getMatrixCategory() == CulturalSupplyDemandMatrixCategory.HIGH_DEMAND_LOW_SUPPLY).count());
        matrixDist.put("HIGH_DEMAND_HIGH_SUPPLY", all.stream().filter(o -> o.getMatrixCategory() == CulturalSupplyDemandMatrixCategory.HIGH_DEMAND_HIGH_SUPPLY).count());
        matrixDist.put("LOW_DEMAND_LOW_SUPPLY", all.stream().filter(o -> o.getMatrixCategory() == CulturalSupplyDemandMatrixCategory.LOW_DEMAND_LOW_SUPPLY).count());
        matrixDist.put("LOW_DEMAND_HIGH_SUPPLY", all.stream().filter(o -> o.getMatrixCategory() == CulturalSupplyDemandMatrixCategory.LOW_DEMAND_HIGH_SUPPLY).count());
        matrixDist.put("INSUFFICIENT_DATA", all.stream().filter(o -> o.getMatrixCategory() == CulturalSupplyDemandMatrixCategory.INSUFFICIENT_DATA).count());

        List<CulturalOpportunityDto> topDestinations = all.stream()
                .filter(o -> o.getScore() != null)
                .limit(8)
                .toList();

        long observedSignals = signalRepository.countBySourceType(IntelligenceSourceType.OBSERVED);
        long demoSignals = signalRepository.countBySourceType(IntelligenceSourceType.DEMO);

        Map<String, String> provenance = new LinkedHashMap<>();
        provenance.put("AUTHENTIC_TRADITIONS", "100 official source-backed traditions from DC Handicrafts / GI Registry");
        provenance.put("VERIFIED_SUPPLY", "Real verified cultural experiences and registered artisan partners on YatraSetu");
        provenance.put("OBSERVED_DEMAND", observedSignals + " genuine platform planning activity signals (itineraries, connects, searches)");
        if (includeDemo) {
            provenance.put("DEMO_SIGNALS", demoSignals + " demonstration signals enabled for evaluation showcase");
        }

        return CulturalOpportunityOverviewDto.builder()
                .totalDestinationsEvaluated(total)
                .destinationsWithSufficientData(sufficient)
                .destinationsWithInsufficientData(insufficient)
                .averageOpportunityScore(BigDecimal.valueOf(avgScore).setScale(1, RoundingMode.HALF_UP))
                .highOpportunityCount(highCount)
                .moderateOpportunityCount(modCount)
                .emergingOpportunityCount(emergCount)
                .lowerOpportunityCount(lowCount)
                .culturalExperienceDeficitCount(expDeficitCount)
                .giRichDestinationsCount(giRichCount)
                .matrixDistribution(matrixDist)
                .topOpportunityDestinations(topDestinations)
                .isDemoModeActive(includeDemo)
                .observedSignalsCount(observedSignals)
                .demoSignalsCount(demoSignals)
                .dataProvenance(provenance)
                .dataDisclaimer(DATA_DISCLAIMER)
                .generatedAt(Instant.now())
                .build();
    }

    private List<String> generateExplanations(
            String destName,
            double tradScore,
            double demandScore,
            double supplyScore,
            double gapPenalty,
            int destTradCount,
            int giCount,
            long demandSignals,
            int verifiedExpCount
    ) {
        List<String> list = new ArrayList<>();
        if (destTradCount > 0) {
            list.add(String.format("+ Direct authentic cultural tradition presence: %d destination-linked craft/heritage asset(s)%s.",
                    destTradCount, giCount > 0 ? " (" + giCount + " GI-tagged)" : ""));
        } else {
            list.add("+ Regional cultural context available from state-level traditions.");
        }

        if (demandSignals > 0) {
            list.add(String.format("+ Active traveler interest: %d observed platform demand signals recorded.", demandSignals));
        } else {
            list.add("• Minimal traveler activity recorded on YatraSetu for this node.");
        }

        if (verifiedExpCount == 0) {
            list.add("+ High expansion opportunity: 0 verified cultural experiences currently available, providing maximum headroom for artisan onboarding.");
        } else {
            list.add(String.format("• Established experience ecosystem with %d verified cultural workshop(s) active.", verifiedExpCount));
        }

        if (gapPenalty > 0) {
            list.add(String.format("- Friction detected: -%.1f point penalty applied due to detected supply deficits or infrastructure constraints.", gapPenalty));
        }

        return list;
    }

    private List<String> generateSuggestedActions(
            String destName,
            CulturalSupplyDemandMatrixCategory matrixCat,
            int verifiedExpCount,
            int artisanHostCount,
            int traditionCount
    ) {
        List<String> actions = new ArrayList<>();
        switch (matrixCat) {
            case HIGH_DEMAND_LOW_SUPPLY -> {
                actions.add("High Priority: Partner with local master artisans to onboard authentic workshops and cultural walks.");
                actions.add("Expedite government verification for submitted cultural experiences in this cluster.");
            }
            case HIGH_DEMAND_HIGH_SUPPLY -> {
                actions.add("Maintain Quality Standards: Monitor artisan masterclasses and promote off-peak cultural immersion slots.");
                actions.add("Integrate verified cultural experiences into primary state tourism marketing campaigns.");
            }
            case LOW_DEMAND_HIGH_SUPPLY -> {
                actions.add("Promote Discovery: Featured listings on destination discovery portal to direct traveler interest to rich artisan supply.");
                actions.add("Incorporate into regional cultural circuits connecting nearby high-pressure hubs.");
            }
            case LOW_DEMAND_LOW_SUPPLY -> {
                actions.add("Grassroots Development: Identify regional craft cooperatives for future YatraSetu partner onboarding.");
                actions.add("Document authentic cultural provenance to establish local cultural heritage identity.");
            }
            case INSUFFICIENT_DATA -> {
                actions.add("Survey local heritage assets and map GI-tagged traditions to this geographic node.");
            }
        }
        return actions;
    }
}
