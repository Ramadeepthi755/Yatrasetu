package com.yatrasetu.service.intelligence;

import com.yatrasetu.domain.Destination;
import com.yatrasetu.domain.intelligence.EcosystemGapType;
import com.yatrasetu.domain.intelligence.IntelligenceSourceType;
import com.yatrasetu.domain.intelligence.TourismEcosystemGap;
import com.yatrasetu.repository.*;
import com.yatrasetu.repository.intelligence.TourismDemandSignalRepository;
import com.yatrasetu.repository.intelligence.TourismEcosystemGapRepository;
import com.yatrasetu.web.dto.intelligence.EcosystemGapDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class EcosystemGapDetectionService {

    private final DestinationRepository destinationRepository;
    private final LocalHostRepository localHostRepository;
    private final HotelRepository hotelRepository;
    private final ExperienceRepository experienceRepository;
    private final DestinationPoiRepository poiRepository;
    private final DestinationTransportRepository transportRepository;
    private final TourismDemandSignalRepository signalRepository;
    private final TourismEcosystemGapRepository gapRepository;

    private static final String GAP_DISCLAIMER =
            "Gaps represent infrastructure bottlenecks visible within YatraSetu's verified platform listings. " +
            "Suggested interventions are data-driven policy recommendations, not guarantees.";

    @Transactional
    public List<EcosystemGapDto> detectAndSyncEcosystemGaps() {
        List<Destination> destinations = destinationRepository.findAll();
        Map<String, Long> hostsMap = toCountMap(localHostRepository.countHostsByDestination());
        Map<String, Long> hotelsMap = toCountMap(hotelRepository.countHotelsByDestination());
        Map<String, Long> experiencesMap = toCountMap(experienceRepository.countExperiencesByDestination());
        Map<String, Long> poisMap = toCountMap(poiRepository.countPoisByDestination());
        Map<String, Long> transportsMap = toCountMap(transportRepository.countTransportsByDestination());

        List<Object[]> signalCounts = signalRepository.countSignalsByDestination();
        Map<String, Long> signalsMap = toCountMap(signalCounts);

        List<EcosystemGapDto> dtos = new ArrayList<>();

        for (Destination d : destinations) {
            long hosts = hostsMap.getOrDefault(d.getId(), 0L);
            long hotels = hotelsMap.getOrDefault(d.getId(), 0L);
            long exps = experiencesMap.getOrDefault(d.getId(), 0L);
            long pois = poisMap.getOrDefault(d.getId(), 0L);
            long transports = transportsMap.getOrDefault(d.getId(), 0L);
            long demand = signalsMap.getOrDefault(d.getId(), 0L);

            // 1. GUIDE_HOST_DEFICIT: Significant demand or popular destination with 0 or < 2 local hosts
            if (hosts < 2 && (demand >= 3 || (d.getPopularityScore() != null && d.getPopularityScore().doubleValue() >= 75.0))) {
                String sev = hosts == 0 ? "HIGH" : "MEDIUM";
                String desc = String.format("%s displays active traveler demand (%d signals) but has only %d verified local host(s) listed.", d.getDestinationName(), demand, hosts);
                String intervention = "Organize regional community tourism workshops and incentivize certified local guide onboarding.";
                saveOrUpdateGap(d, EcosystemGapType.GUIDE_HOST_DEFICIT, sev, desc, intervention);

                dtos.add(buildGapDto(d, EcosystemGapType.GUIDE_HOST_DEFICIT, sev, desc, intervention, demand, hosts, hotels, exps));
            }

            // 2. STAYS_DEFICIT: Has POIs and demand but 0 or < 2 verified accommodation listings
            if (hotels < 2 && pois >= 2) {
                String sev = hotels == 0 ? "HIGH" : "MEDIUM";
                String desc = String.format("%s contains %d heritage/natural POIs but has only %d registered accommodation stay(s).", d.getDestinationName(), pois, hotels);
                String intervention = "Promote rural homestay licensing schemes and partner with state tourism development corporations for guest houses.";
                saveOrUpdateGap(d, EcosystemGapType.STAYS_DEFICIT, sev, desc, intervention);

                dtos.add(buildGapDto(d, EcosystemGapType.STAYS_DEFICIT, sev, desc, intervention, demand, hosts, hotels, exps));
            }

            // 3. EXPERIENCE_DEFICIT: Has key POIs but 0 registered cultural/heritage experiences
            if (exps == 0 && pois >= 2) {
                String sev = "MEDIUM";
                String desc = String.format("%s has %d attractions but 0 immersive cultural or guided experiences listed.", d.getDestinationName(), pois);
                String intervention = "Encourage local youth and artisan cooperatives to list heritage walks, culinary tastings, and cultural tours.";
                saveOrUpdateGap(d, EcosystemGapType.EXPERIENCE_DEFICIT, sev, desc, intervention);

                dtos.add(buildGapDto(d, EcosystemGapType.EXPERIENCE_DEFICIT, sev, desc, intervention, demand, hosts, hotels, exps));
            }

            // 4. CONNECTIVITY_GAP: Has moderate/difficult accessibility and <= 1 transport connectivity node
            if (transports <= 1 && d.getAccessibility() != null && d.getAccessibility().toLowerCase().contains("moderate")) {
                String sev = "LOW";
                String desc = String.format("%s has limited direct transit connections (%d transport node registered).", d.getDestinationName(), transports);
                String intervention = "Coordinate with state road transport corporations for weekend tourist shuttle services from nearest major railhead.";
                saveOrUpdateGap(d, EcosystemGapType.CONNECTIVITY_GAP, sev, desc, intervention);

                dtos.add(buildGapDto(d, EcosystemGapType.CONNECTIVITY_GAP, sev, desc, intervention, demand, hosts, hotels, exps));
            }
        }

        dtos.sort((a, b) -> {
            int sA = "HIGH".equals(a.getSeverity()) ? 3 : "MEDIUM".equals(a.getSeverity()) ? 2 : 1;
            int sB = "HIGH".equals(b.getSeverity()) ? 3 : "MEDIUM".equals(b.getSeverity()) ? 2 : 1;
            return Integer.compare(sB, sA);
        });

        return dtos;
    }

    private void saveOrUpdateGap(Destination d, EcosystemGapType gapType, String severity, String description, String intervention) {
        TourismEcosystemGap gap = gapRepository.findByDestinationIdAndGapType(d.getId(), gapType)
                .orElse(TourismEcosystemGap.builder()
                        .id("gap-" + d.getId() + "-" + gapType.name().toLowerCase().replace("_", "-"))
                        .destination(d)
                        .gapType(gapType)
                        .build());

        gap.setSeverity(severity);
        gap.setDescription(description);
        gap.setSuggested_intervention(intervention);
        gapRepository.save(gap);
    }

    private EcosystemGapDto buildGapDto(
            Destination d,
            EcosystemGapType gapType,
            String severity,
            String desc,
            String intervention,
            long demand,
            long hosts,
            long hotels,
            long exps
    ) {
        return EcosystemGapDto.builder()
                .id("gap-" + d.getId() + "-" + gapType.name())
                .destinationId(d.getId())
                .destinationName(d.getDestinationName())
                .stateName(d.getState() != null ? d.getState().getStateName() : "India")
                .cityName(d.getCity() != null ? d.getCity().getCityName() : "")
                .gapType(gapType)
                .severity(severity)
                .description(desc)
                .suggestedIntervention(intervention)
                .observedDemand(demand)
                .hostCount(hosts)
                .hotelCount(hotels)
                .experienceCount(exps)
                .sourceType(IntelligenceSourceType.DERIVED)
                .detectedAt(Instant.now())
                .disclaimer(GAP_DISCLAIMER)
                .build();
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
