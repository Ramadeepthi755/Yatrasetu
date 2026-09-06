package com.yatrasetu.service.intelligence;

import com.yatrasetu.domain.Destination;
import com.yatrasetu.domain.Hotel;
import com.yatrasetu.domain.LocalHost;
import com.yatrasetu.domain.User;
import com.yatrasetu.domain.intelligence.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.repository.intelligence.TourismEcosystemGapRepository;
import com.yatrasetu.repository.intelligence.TourismGovernmentActionRepository;
import com.yatrasetu.web.dto.intelligence.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CulturalActionEngineService {

    private final DestinationRepository destinationRepository;
    private final LocalHostRepository localHostRepository;
    private final HotelRepository hotelRepository;
    private final DestinationPoiRepository poiRepository;
    private final TourismEcosystemGapRepository gapRepository;
    private final TourismGovernmentActionRepository actionRepository;
    private final CulturalOpportunityService culturalOpportunityService;

    private static final String GAP_DISCLAIMER =
            "Platform-derived decision support metric. Gaps represent verified coverage and supply bottlenecks " +
            "visible within the YatraSetu platform. Recommended interventions are policy suggestions, not official government mandates.";

    /**
     * Detect and synchronize cultural ecosystem gaps across all monitored destinations in bulk.
     */
    @Transactional
    public List<CulturalEcosystemGapDto> detectAndSyncCulturalGaps(boolean includeDemo) {
        List<CulturalOpportunityDto> opportunities = culturalOpportunityService.calculateAllCulturalOpportunities(includeDemo);
        Map<String, CulturalOpportunityDto> oppMap = opportunities.stream()
                .collect(Collectors.toMap(CulturalOpportunityDto::getDestinationId, o -> o, (a, b) -> a));

        List<Destination> destinations = destinationRepository.findAll();
        Map<String, Long> poiCounts = toCountMap(poiRepository.countPoisByDestination());
        Map<String, Long> hotelCounts = toCountMap(hotelRepository.countHotelsByDestination());
        Map<String, Long> hostCounts = toCountMap(localHostRepository.countHostsByDestination());

        List<CulturalEcosystemGapDto> resultList = new ArrayList<>();

        for (Destination d : destinations) {
            String destId = d.getId();
            CulturalOpportunityDto opp = oppMap.get(destId);
            if (opp == null || "INSUFFICIENT_DATA".equals(opp.getStatus())) continue;

            double score = opp.getScore() != null ? opp.getScore().doubleValue() : 0.0;
            int tradCount = opp.getTraditionCount();
            long demandSignals = opp.getObservedDemandSignals();
            int verifiedExps = opp.getVerifiedExperienceCount();
            int artisanHosts = opp.getVerifiedArtisanCount();
            long totalHosts = hostCounts.getOrDefault(destId, 0L);
            long totalHotels = hotelCounts.getOrDefault(destId, 0L);
            long totalPois = poiCounts.getOrDefault(destId, 0L);

            // 1. CULTURAL_EXPERIENCE_DEFICIT
            // Traditions exist + active traveler demand, but 0 verified cultural experiences listed
            if (tradCount >= 1 && (demandSignals >= 3 || (opp.getDemandScore() != null && opp.getDemandScore().doubleValue() >= 8.0)) && verifiedExps == 0) {
                String severity = score >= 75.0 ? "CRITICAL" : (score >= 50.0 ? "HIGH" : "MEDIUM");
                String desc = String.format("%s contains %d authentic source-backed cultural traditions alongside active traveler demand (%d signals), but YatraSetu verified cultural experience coverage is insufficient (0 verified workshops listed).",
                        d.getDestinationName(), tradCount, demandSignals);
                String intervention = "Prioritize onboarding and verification of authentic cultural experiences in collaboration with local master artisans.";

                saveOrUpdateGapEntity(d, EcosystemGapType.CULTURAL_EXPERIENCE_DEFICIT, severity, desc, intervention);
                resultList.add(buildGapDto(d, opp, EcosystemGapType.CULTURAL_EXPERIENCE_DEFICIT, severity, desc, intervention));
            }

            // 2. ARTISAN_PARTNER_DEFICIT
            // Traditions exist, but 0 accredited artisan hosts registered
            if (tradCount >= 1 && artisanHosts == 0) {
                String severity = score >= 60.0 ? "HIGH" : "MEDIUM";
                String desc = String.format("%s has authentic cultural craft clusters, but YatraSetu verified artisan partner coverage is currently insufficient (0 accredited artisan hosts registered).",
                        d.getDestinationName());
                String intervention = "Identify and onboard eligible artisan/community craft cooperatives for official YatraSetu partner accreditation.";

                saveOrUpdateGapEntity(d, EcosystemGapType.ARTISAN_PARTNER_DEFICIT, severity, desc, intervention);
                resultList.add(buildGapDto(d, opp, EcosystemGapType.ARTISAN_PARTNER_DEFICIT, severity, desc, intervention));
            }

            // 3. CONNECTIVITY_GAP
            // Transit friction in moderate/difficult accessibility terrain
            if (d.getAccessibility() != null && d.getAccessibility().toLowerCase().contains("difficult")) {
                String severity = score >= 60.0 ? "MEDIUM" : "LOW";
                String desc = String.format("%s features regional terrain constraints with transit nodes presenting moderate access friction for cultural visitors.",
                        d.getDestinationName());
                String intervention = "Review last-mile connectivity information and potential visitor access improvements with regional road transport authorities.";

                saveOrUpdateGapEntity(d, EcosystemGapType.CONNECTIVITY_GAP, severity, desc, intervention);
                resultList.add(buildGapDto(d, opp, EcosystemGapType.CONNECTIVITY_GAP, severity, desc, intervention));
            }

            // 4. STAYS_DEFICIT
            // Has POIs and opportunity but limited verified accommodation coverage
            if (totalHotels <= 1 && totalPois >= 2 && score >= 50.0) {
                String severity = totalHotels == 0 ? "HIGH" : "MEDIUM";
                String desc = String.format("%s contains %d heritage/natural POIs, but YatraSetu accommodation coverage is insufficient (%d registered stays).",
                        d.getDestinationName(), totalPois, totalHotels);
                String intervention = "Encourage verified accommodation ecosystem participation and homestay licensing in regional clusters.";

                saveOrUpdateGapEntity(d, EcosystemGapType.STAYS_DEFICIT, severity, desc, intervention);
                resultList.add(buildGapDto(d, opp, EcosystemGapType.STAYS_DEFICIT, severity, desc, intervention));
            }

            // 5. GUIDE_HOST_DEFICIT
            // Active traveler interest but limited verified local hosts
            if (totalHosts <= 1 && (demandSignals >= 3 || score >= 55.0)) {
                String severity = totalHosts == 0 ? "HIGH" : "MEDIUM";
                String desc = String.format("%s displays active traveler interest, but YatraSetu verified host coverage is insufficient (%d verified hosts).",
                        d.getDestinationName(), totalHosts);
                String intervention = "Organize regional community tourism workshops and incentivize certified local guide onboarding.";

                saveOrUpdateGapEntity(d, EcosystemGapType.GUIDE_HOST_DEFICIT, severity, desc, intervention);
                resultList.add(buildGapDto(d, opp, EcosystemGapType.GUIDE_HOST_DEFICIT, severity, desc, intervention));
            }

            // 6. CULTURAL_DATA_GAP
            // High demand destination with 0 mapped traditions in registry
            if (demandSignals >= 10 && tradCount == 0) {
                String severity = "LOW";
                String desc = String.format("%s displays active traveler interest (%d signals) but has 0 mapped GI or traditional craft assets in the cultural knowledge registry.",
                        d.getDestinationName(), demandSignals);
                String intervention = "Survey local heritage assets and map GI-tagged traditions to this geographic node.";

                saveOrUpdateGapEntity(d, EcosystemGapType.CULTURAL_DATA_GAP, severity, desc, intervention);
                resultList.add(buildGapDto(d, opp, EcosystemGapType.CULTURAL_DATA_GAP, severity, desc, intervention));
            }
        }

        // Sort descending by severity (CRITICAL > HIGH > MEDIUM > LOW)
        resultList.sort((a, b) -> {
            int sA = getSeverityWeight(a.getSeverity());
            int sB = getSeverityWeight(b.getSeverity());
            return Integer.compare(sB, sA);
        });

        return resultList;
    }

    /**
     * Get macro overview statistics for cultural ecosystem gaps.
     */
    @Transactional(readOnly = true)
    public CulturalEcosystemGapOverviewDto getGapsOverview(boolean includeDemo) {
        List<CulturalEcosystemGapDto> allGaps = detectAndSyncCulturalGaps(includeDemo);

        long total = allGaps.size();
        long crit = allGaps.stream().filter(g -> "CRITICAL".equalsIgnoreCase(g.getSeverity())).count();
        long high = allGaps.stream().filter(g -> "HIGH".equalsIgnoreCase(g.getSeverity())).count();
        long med = allGaps.stream().filter(g -> "MEDIUM".equalsIgnoreCase(g.getSeverity())).count();
        long low = allGaps.stream().filter(g -> "LOW".equalsIgnoreCase(g.getSeverity())).count();

        long expDef = allGaps.stream().filter(g -> g.getGapType() == EcosystemGapType.CULTURAL_EXPERIENCE_DEFICIT).count();
        long artDef = allGaps.stream().filter(g -> g.getGapType() == EcosystemGapType.ARTISAN_PARTNER_DEFICIT).count();
        long connGap = allGaps.stream().filter(g -> g.getGapType() == EcosystemGapType.CONNECTIVITY_GAP).count();
        long staysDef = allGaps.stream().filter(g -> g.getGapType() == EcosystemGapType.STAYS_DEFICIT).count();
        long guideDef = allGaps.stream().filter(g -> g.getGapType() == EcosystemGapType.GUIDE_HOST_DEFICIT).count();
        long dataGap = allGaps.stream().filter(g -> g.getGapType() == EcosystemGapType.CULTURAL_DATA_GAP).count();

        Map<String, Long> byType = new LinkedHashMap<>();
        byType.put("CULTURAL_EXPERIENCE_DEFICIT", expDef);
        byType.put("ARTISAN_PARTNER_DEFICIT", artDef);
        byType.put("CONNECTIVITY_GAP", connGap);
        byType.put("STAYS_DEFICIT", staysDef);
        byType.put("GUIDE_HOST_DEFICIT", guideDef);
        byType.put("CULTURAL_DATA_GAP", dataGap);

        Map<String, Long> bySev = new LinkedHashMap<>();
        bySev.put("CRITICAL", crit);
        bySev.put("HIGH", high);
        bySev.put("MEDIUM", med);
        bySev.put("LOW", low);

        List<CulturalEcosystemGapDto> topCritical = allGaps.stream()
                .filter(g -> "CRITICAL".equalsIgnoreCase(g.getSeverity()) || "HIGH".equalsIgnoreCase(g.getSeverity()))
                .limit(8)
                .toList();

        return CulturalEcosystemGapOverviewDto.builder()
                .totalGapsDetected(total)
                .criticalGapsCount(crit)
                .highSeverityGapsCount(high)
                .mediumSeverityGapsCount(med)
                .lowSeverityGapsCount(low)
                .culturalExperienceDeficitCount(expDef)
                .artisanPartnerDeficitCount(artDef)
                .connectivityGapCount(connGap)
                .staysDeficitCount(staysDef)
                .guideHostDeficitCount(guideDef)
                .culturalDataGapCount(dataGap)
                .gapsByType(byType)
                .gapsBySeverity(bySev)
                .topCriticalGaps(topCritical)
                .isDemoModeActive(includeDemo)
                .dataDisclaimer(GAP_DISCLAIMER)
                .generatedAt(Instant.now())
                .build();
    }

    /**
     * Idempotently generate, synchronize, and deduplicate Government Actions for all actionable cultural ecosystem gaps.
     */
    @Transactional
    public List<CulturalGovernmentActionDto> generateAndSyncCulturalActions(boolean includeDemo, User officialUser) {
        List<CulturalEcosystemGapDto> gaps = detectAndSyncCulturalGaps(includeDemo);
        List<TourismGovernmentAction> existingActions = actionRepository.findAll();
        Map<String, TourismGovernmentAction> existingActionMap = existingActions.stream()
                .collect(Collectors.toMap(TourismGovernmentAction::getId, a -> a, (a, b) -> a));

        List<TourismGovernmentAction> toSave = new ArrayList<>();

        for (CulturalEcosystemGapDto gap : gaps) {
            // Only generate actions for CRITICAL, HIGH, and MEDIUM severity gaps
            if ("LOW".equalsIgnoreCase(gap.getSeverity()) || "INSUFFICIENT_DATA".equalsIgnoreCase(gap.getSeverity())) {
                continue;
            }

            String actionId = String.format("act-cult-%s-%s", gap.getDestinationId(), gap.getGapType().name().toLowerCase().replace('_', '-'));
            Destination dest = destinationRepository.findById(gap.getDestinationId()).orElse(null);
            if (dest == null) continue;

            // Deterministic Priority Calculation
            GovernmentActionPriority priority = calculateActionPriority(gap);

            // Action Type Mapping
            GovernmentActionType actionType = switch (gap.getGapType()) {
                case CULTURAL_EXPERIENCE_DEFICIT -> GovernmentActionType.CULTURAL_ECOSYSTEM_INTERVENTION;
                case ARTISAN_PARTNER_DEFICIT -> GovernmentActionType.ARTISAN_ONBOARDING_INITIATIVE;
                case CONNECTIVITY_GAP -> GovernmentActionType.CREATE_INITIATIVE;
                case STAYS_DEFICIT -> GovernmentActionType.CREATE_INITIATIVE;
                case GUIDE_HOST_DEFICIT -> GovernmentActionType.CREATE_INITIATIVE;
                case CULTURAL_DATA_GAP -> GovernmentActionType.NOTE;
                default -> GovernmentActionType.CREATE_INITIATIVE;
            };

            String title = String.format("%s: %s (%s)",
                    formatGapTitle(gap.getGapType()), dest.getDestinationName(), priority.name());

            String whyReason = generateWhyReason(gap, dest);
            String notes = String.format("RECOMMENDATION: %s\n\nREASON: %s", gap.getSuggestedIntervention(), whyReason);

            TourismGovernmentAction action = existingActionMap.get(actionId);
            if (action == null) {
                // New Action: Create in LOGGED status
                action = TourismGovernmentAction.builder()
                        .id(actionId)
                        .destination(dest)
                        .actionType(actionType)
                        .title(title)
                        .notes(notes)
                        .user(officialUser)
                        .status(GovernmentActionStatus.LOGGED)
                        .priority(priority)
                        .createdAt(Instant.now())
                        .build();
                toSave.add(action);
            } else {
                // Existing Action: Preserve lifecycle status (do not overwrite if IN_PROGRESS, RESOLVED, or DISMISSED)
                // Update priority, title, and recommendation notes if still active
                if (action.getStatus() == GovernmentActionStatus.LOGGED) {
                    action.setPriority(priority);
                    action.setTitle(title);
                    action.setNotes(notes);
                    toSave.add(action);
                }
            }
        }

        if (!toSave.isEmpty()) {
            actionRepository.saveAll(toSave);
            log.info("Synchronized and deduplicated {} cultural government actions", toSave.size());
        }

        return getCulturalActions(null, null, null, includeDemo);
    }

    /**
     * Retrieve all Cultural Government Actions with full intelligence enrichment and audit tracking.
     */
    @Transactional(readOnly = true)
    public List<CulturalGovernmentActionDto> getCulturalActions(
            GovernmentActionStatus status,
            GovernmentActionPriority priority,
            EcosystemGapType gapType,
            boolean includeDemo
    ) {
        List<TourismGovernmentAction> allActions = actionRepository.findAllWithDetails();
        List<CulturalOpportunityDto> opportunities = culturalOpportunityService.calculateAllCulturalOpportunities(includeDemo);
        Map<String, CulturalOpportunityDto> oppMap = opportunities.stream()
                .collect(Collectors.toMap(CulturalOpportunityDto::getDestinationId, o -> o, (a, b) -> a));

        List<CulturalGovernmentActionDto> dtos = new ArrayList<>();

        for (TourismGovernmentAction a : allActions) {
            // Filter only cultural action records (identified by prefix or actionType)
            boolean isCultAction = a.getId().startsWith("act-cult-")
                    || a.getActionType() == GovernmentActionType.CULTURAL_ECOSYSTEM_INTERVENTION
                    || a.getActionType() == GovernmentActionType.ARTISAN_ONBOARDING_INITIATIVE
                    || a.getActionType() == GovernmentActionType.CULTURAL_CIRCUIT_PROMOTION;

            if (!isCultAction) continue;

            if (status != null && a.getStatus() != status) continue;
            if (priority != null && a.getPriority() != priority) continue;

            EcosystemGapType extractedGapType = extractGapTypeFromActionId(a.getId());
            if (gapType != null && extractedGapType != gapType) continue;

            Destination dest = a.getDestination();
            String destId = dest != null ? dest.getId() : null;
            CulturalOpportunityDto opp = destId != null ? oppMap.get(destId) : null;

            dtos.add(buildActionDto(a, dest, opp, extractedGapType));
        }

        // Sort descending by priority (CRITICAL > HIGH > MEDIUM > LOW) then by createdAt desc
        dtos.sort((a, b) -> {
            int pA = getPriorityWeight(a.getPriority());
            int pB = getPriorityWeight(b.getPriority());
            if (pA != pB) return Integer.compare(pB, pA);
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });

        return dtos;
    }

    /**
     * Retrieve detailed Cultural Government Action by ID.
     */
    @Transactional(readOnly = true)
    public CulturalGovernmentActionDto getCulturalActionById(String id, boolean includeDemo) {
        TourismGovernmentAction action = actionRepository.findById(id).orElse(null);
        if (action == null) return null;

        Destination dest = action.getDestination();
        CulturalOpportunityDto opp = dest != null ? culturalOpportunityService.calculateDestinationOpportunity(dest.getId(), includeDemo) : null;
        EcosystemGapType extractedGapType = extractGapTypeFromActionId(action.getId());

        return buildActionDto(action, dest, opp, extractedGapType);
    }

    /**
     * Update the lifecycle status of a cultural government action with audit logging.
     */
    @Transactional
    public CulturalGovernmentActionDto updateActionStatus(
            String actionId,
            GovernmentActionStatus newStatus,
            String resolutionNotes,
            User user
    ) {
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

        if (user != null) {
            action.setUser(user);
        }

        TourismGovernmentAction saved = actionRepository.save(action);
        log.info("Government official {} updated action {} to status {}", user != null ? user.getId() : "system", actionId, newStatus);
        return getCulturalActionById(saved.getId(), false);
    }

    private CulturalEcosystemGapDto buildGapDto(
            Destination d,
            CulturalOpportunityDto opp,
            EcosystemGapType gapType,
            String severity,
            String desc,
            String intervention
    ) {
        return CulturalEcosystemGapDto.builder()
                .id(String.format("gap-cult-%s-%s", d.getId(), gapType.name().toLowerCase().replace('_', '-')))
                .destinationId(d.getId())
                .destinationName(d.getDestinationName())
                .stateId(d.getState() != null ? d.getState().getId() : null)
                .stateName(d.getState() != null ? d.getState().getStateName() : "India")
                .cityId(d.getCity() != null ? d.getCity().getId() : null)
                .cityName(d.getCity() != null ? d.getCity().getCityName() : null)
                .gapType(gapType)
                .severity(severity)
                .description(desc)
                .suggestedIntervention(intervention)
                .opportunityScore(opp != null ? opp.getScore() : null)
                .traditionCount(opp != null ? opp.getTraditionCount() : 0)
                .giTraditionCount(opp != null ? opp.getGiTraditionCount() : 0)
                .observedDemandSignals(opp != null ? opp.getObservedDemandSignals() : 0L)
                .verifiedExperienceCount(opp != null ? opp.getVerifiedExperienceCount() : 0)
                .verifiedArtisanCount(opp != null ? opp.getVerifiedArtisanCount() : 0)
                .sourceType(opp != null ? opp.getDataMode() : IntelligenceSourceType.DERIVED)
                .disclaimer(GAP_DISCLAIMER)
                .detectedAt(Instant.now())
                .build();
    }

    private CulturalGovernmentActionDto buildActionDto(
            TourismGovernmentAction a,
            Destination dest,
            CulturalOpportunityDto opp,
            EcosystemGapType gapType
    ) {
        String destName = dest != null ? dest.getDestinationName() : "General Cluster";
        String stateName = dest != null && dest.getState() != null ? dest.getState().getStateName() : "India";
        String cityName = dest != null && dest.getCity() != null ? dest.getCity().getCityName() : null;

        String rec = "";
        String reason = "";
        if (a.getNotes() != null) {
            String[] parts = a.getNotes().split("\n\nREASON: ");
            rec = parts[0].replace("RECOMMENDATION: ", "");
            if (parts.length > 1) reason = parts[1];
        }

        List<String> evidence = generateActionEvidence(opp, gapType, destName);

        return CulturalGovernmentActionDto.builder()
                .id(a.getId())
                .destinationId(dest != null ? dest.getId() : null)
                .destinationName(destName)
                .stateId(dest != null && dest.getState() != null ? dest.getState().getId() : null)
                .stateName(stateName)
                .cityId(dest != null && dest.getCity() != null ? dest.getCity().getId() : null)
                .cityName(cityName)
                .gapType(gapType)
                .actionType(a.getActionType())
                .priority(a.getPriority())
                .status(a.getStatus())
                .title(a.getTitle())
                .recommendedIntervention(rec)
                .whyRecommendedReason(reason)
                .opportunityScore(opp != null ? opp.getScore() : null)
                .traditionScore(opp != null ? opp.getTraditionScore() : BigDecimal.ZERO)
                .demandScore(opp != null ? opp.getDemandScore() : BigDecimal.ZERO)
                .supplyScore(opp != null ? opp.getSupplyScore() : BigDecimal.ZERO)
                .gapPenalty(opp != null ? opp.getGapPenalty() : BigDecimal.ZERO)
                .traditionCount(opp != null ? opp.getTraditionCount() : 0)
                .giTraditionCount(opp != null ? opp.getGiTraditionCount() : 0)
                .observedDemandSignals(opp != null ? opp.getObservedDemandSignals() : 0L)
                .verifiedExperienceCount(opp != null ? opp.getVerifiedExperienceCount() : 0)
                .verifiedArtisanCount(opp != null ? opp.getVerifiedArtisanCount() : 0)
                .notes(a.getNotes())
                .resolutionNotes(a.getResolutionNotes())
                .resolvedAt(a.getResolvedAt())
                .userFullName(a.getUser() != null ? a.getUser().getFullName() : "Government Official")
                .userId(a.getUser() != null ? a.getUser().getId() : null)
                .evidenceBullets(evidence)
                .disclaimer(GAP_DISCLAIMER)
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getResolvedAt() != null ? a.getResolvedAt() : a.getCreatedAt())
                .build();
    }

    private GovernmentActionPriority calculateActionPriority(CulturalEcosystemGapDto gap) {
        double score = gap.getOpportunityScore() != null ? gap.getOpportunityScore().doubleValue() : 0.0;
        if ("CRITICAL".equalsIgnoreCase(gap.getSeverity()) || (score >= 80.0 && gap.getGapType() == EcosystemGapType.CULTURAL_EXPERIENCE_DEFICIT)) {
            return GovernmentActionPriority.CRITICAL;
        } else if ("HIGH".equalsIgnoreCase(gap.getSeverity()) || score >= 65.0) {
            return GovernmentActionPriority.HIGH;
        } else if ("MEDIUM".equalsIgnoreCase(gap.getSeverity()) || score >= 45.0) {
            return GovernmentActionPriority.MEDIUM;
        } else {
            return GovernmentActionPriority.LOW;
        }
    }

    private String generateWhyReason(CulturalEcosystemGapDto gap, Destination dest) {
        double score = gap.getOpportunityScore() != null ? gap.getOpportunityScore().doubleValue() : 0.0;
        return switch (gap.getGapType()) {
            case CULTURAL_EXPERIENCE_DEFICIT -> String.format(
                    "High cultural opportunity (Score: %.1f/100) and observed platform demand (%d signals) coexist with 0 verified cultural experiences.",
                    score, gap.getObservedDemandSignals());
            case ARTISAN_PARTNER_DEFICIT -> String.format(
                    "Identified authentic cultural craft cluster (%d traditions, %d GI-tagged) lacks registered verified artisan partners for direct visitor immersion.",
                    gap.getTraditionCount(), gap.getGiTraditionCount());
            case CONNECTIVITY_GAP -> String.format(
                    "Moderate last-mile access constraints observed for %s, requiring coordination with regional transit authorities.",
                    dest.getDestinationName());
            case STAYS_DEFICIT -> String.format(
                    "Heritage attraction density exists alongside active cultural interest, but verified accommodation listings on YatraSetu remain insufficient.",
                    dest.getDestinationName());
            case GUIDE_HOST_DEFICIT -> String.format(
                    "Active traveler planning activity recorded on YatraSetu without sufficient verified local hosts/guides listed.",
                    dest.getDestinationName());
            case CULTURAL_DATA_GAP -> String.format(
                    "High visitor interest node currently lacking structured cultural tradition mapping in the knowledge registry.",
                    dest.getDestinationName());
            default -> "Platform-derived ecosystem bottleneck identified.";
        };
    }

    private List<String> generateActionEvidence(CulturalOpportunityDto opp, EcosystemGapType gapType, String destName) {
        List<String> list = new ArrayList<>();
        if (opp != null) {
            list.add(String.format("Cultural Opportunity Score: %s / 100 (%s classification)",
                    opp.getScore() != null ? String.format("%.1f", opp.getScore().doubleValue()) : "N/A", opp.getClassification()));
            list.add(String.format("Tradition Component: %s/30.0 (%d authentic traditions, %d GI-tagged)",
                    opp.getTraditionScore() != null ? String.format("%.1f", opp.getTraditionScore().doubleValue()) : "0.0",
                    opp.getTraditionCount(), opp.getGiTraditionCount()));
            list.add(String.format("Demand Component: %s/35.0 (%d observed platform planning signals)",
                    opp.getDemandScore() != null ? String.format("%.1f", opp.getDemandScore().doubleValue()) : "0.0",
                    opp.getObservedDemandSignals()));
            list.add(String.format("Verified Cultural Experiences: %d listed (Supply Room: %s/25.0)",
                    opp.getVerifiedExperienceCount(),
                    opp.getSupplyScore() != null ? String.format("%.1f", opp.getSupplyScore().doubleValue()) : "25.0"));
        } else {
            list.add("Platform-derived ecosystem analysis based on verified listings and observed signals.");
        }
        return list;
    }

    private String formatGapTitle(EcosystemGapType type) {
        return switch (type) {
            case CULTURAL_EXPERIENCE_DEFICIT -> "Cultural Experience Onboarding Initiative";
            case ARTISAN_PARTNER_DEFICIT -> "Artisan Partner Accreditation Drive";
            case CONNECTIVITY_GAP -> "Last-Mile Cultural Connectivity Review";
            case STAYS_DEFICIT -> "Heritage Stays & Homestay Expansion";
            case GUIDE_HOST_DEFICIT -> "Community Tourism Host Certification";
            case CULTURAL_DATA_GAP -> "Local Cultural Heritage Asset Mapping";
            default -> "Cultural Tourism Policy Directive";
        };
    }

    private EcosystemGapType extractGapTypeFromActionId(String actionId) {
        if (actionId.contains("cultural-experience-deficit")) return EcosystemGapType.CULTURAL_EXPERIENCE_DEFICIT;
        if (actionId.contains("artisan-partner-deficit")) return EcosystemGapType.ARTISAN_PARTNER_DEFICIT;
        if (actionId.contains("connectivity-gap")) return EcosystemGapType.CONNECTIVITY_GAP;
        if (actionId.contains("stays-deficit")) return EcosystemGapType.STAYS_DEFICIT;
        if (actionId.contains("guide-host-deficit")) return EcosystemGapType.GUIDE_HOST_DEFICIT;
        if (actionId.contains("cultural-data-gap")) return EcosystemGapType.CULTURAL_DATA_GAP;
        return EcosystemGapType.EXPERIENCE_DEFICIT;
    }

    private int getSeverityWeight(String sev) {
        if ("CRITICAL".equalsIgnoreCase(sev)) return 4;
        if ("HIGH".equalsIgnoreCase(sev)) return 3;
        if ("MEDIUM".equalsIgnoreCase(sev)) return 2;
        return 1;
    }

    private int getPriorityWeight(GovernmentActionPriority prio) {
        if (prio == GovernmentActionPriority.CRITICAL) return 4;
        if (prio == GovernmentActionPriority.HIGH) return 3;
        if (prio == GovernmentActionPriority.MEDIUM) return 2;
        return 1;
    }

    private void saveOrUpdateGapEntity(Destination d, EcosystemGapType gapType, String severity, String description, String intervention) {
        TourismEcosystemGap gap = gapRepository.findByDestinationIdAndGapType(d.getId(), gapType)
                .orElse(TourismEcosystemGap.builder()
                        .id(String.format("gap-cult-%s-%s", d.getId(), gapType.name().toLowerCase().replace('_', '-')))
                        .destination(d)
                        .gapType(gapType)
                        .build());

        gap.setSeverity(severity);
        gap.setDescription(description);
        gap.setSuggested_intervention(intervention);
        gapRepository.save(gap);
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
