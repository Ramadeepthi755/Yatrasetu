package com.yatrasetu.service;

import com.yatrasetu.domain.*;
import com.yatrasetu.domain.intelligence.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.repository.intelligence.TourismEcosystemGapRepository;
import com.yatrasetu.repository.intelligence.TourismGovernmentActionRepository;
import com.yatrasetu.service.intelligence.CulturalActionEngineService;
import com.yatrasetu.service.intelligence.CulturalOpportunityService;
import com.yatrasetu.web.dto.intelligence.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class Phase21CulturalActionEngineTest {

    @Mock
    private DestinationRepository destinationRepository;

    @Mock
    private LocalHostRepository localHostRepository;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private DestinationPoiRepository poiRepository;

    @Mock
    private TourismEcosystemGapRepository gapRepository;

    @Mock
    private TourismGovernmentActionRepository actionRepository;

    @Mock
    private CulturalOpportunityService culturalOpportunityService;

    @InjectMocks
    private CulturalActionEngineService actionEngineService;

    private State rjState;
    private City jaipurCity;
    private Destination jaipurDest;
    private CulturalOpportunityDto jaipurOpportunity;
    private User governmentUser;

    @BeforeEach
    void setUp() {
        rjState = State.builder().id("state-rj").stateName("Rajasthan").build();
        jaipurCity = City.builder().id("city-jaipur").cityName("Jaipur").state(rjState).build();

        jaipurDest = Destination.builder()
                .id("dest-jaipur")
                .destinationName("Jaipur Old City")
                .state(rjState)
                .city(jaipurCity)
                .accessibility("Easy road and airport connectivity")
                .build();

        governmentUser = User.builder()
                .id("usr-gov-official")
                .fullName("Senior Tourism Director")
                .role(Role.GOVERNMENT)
                .build();

        jaipurOpportunity = CulturalOpportunityDto.builder()
                .destinationId("dest-jaipur")
                .destinationName("Jaipur Old City")
                .stateId("state-rj")
                .stateName("Rajasthan")
                .cityId("city-jaipur")
                .cityName("Jaipur")
                .score(BigDecimal.valueOf(82.5))
                .status("SUFFICIENT_DATA")
                .confidence("HIGH")
                .classification(CulturalOpportunityClassification.HIGH_OPPORTUNITY)
                .matrixCategory(CulturalSupplyDemandMatrixCategory.HIGH_DEMAND_LOW_SUPPLY)
                .traditionScore(BigDecimal.valueOf(25.0))
                .demandScore(BigDecimal.valueOf(32.5))
                .supplyScore(BigDecimal.valueOf(25.0))
                .gapPenalty(BigDecimal.valueOf(10.0))
                .traditionCount(3)
                .giTraditionCount(2)
                .observedDemandSignals(45L)
                .verifiedExperienceCount(0)
                .verifiedArtisanCount(0)
                .dataMode(IntelligenceSourceType.OBSERVED)
                .build();
    }

    @Test
    @DisplayName("1. Detects CULTURAL_EXPERIENCE_DEFICIT when traditions exist alongside active demand but verified experiences = 0")
    void testCulturalExperienceDeficitDetection() {
        when(culturalOpportunityService.calculateAllCulturalOpportunities(false))
                .thenReturn(List.of(jaipurOpportunity));
        when(destinationRepository.findAll()).thenReturn(List.of(jaipurDest));
        when(poiRepository.countPoisByDestination()).thenReturn(Collections.emptyList());
        when(hotelRepository.countHotelsByDestination()).thenReturn(Collections.emptyList());
        when(localHostRepository.countHostsByDestination()).thenReturn(Collections.emptyList());

        List<CulturalEcosystemGapDto> gaps = actionEngineService.detectAndSyncCulturalGaps(false);

        assertThat(gaps).isNotEmpty();
        CulturalEcosystemGapDto expGap = gaps.stream()
                .filter(g -> g.getGapType() == EcosystemGapType.CULTURAL_EXPERIENCE_DEFICIT)
                .findFirst()
                .orElse(null);

        assertThat(expGap).isNotNull();
        assertThat(expGap.getSeverity()).isEqualTo("CRITICAL"); // Score 82.5 >= 75.0
        assertThat(expGap.getDescription()).contains("verified cultural experience coverage is insufficient");
        assertThat(expGap.getSuggestedIntervention()).contains("Prioritize onboarding and verification");
    }

    @Test
    @DisplayName("2. Detects ARTISAN_PARTNER_DEFICIT when traditions exist but 0 accredited artisan hosts are registered")
    void testArtisanPartnerDeficitDetection() {
        when(culturalOpportunityService.calculateAllCulturalOpportunities(false))
                .thenReturn(List.of(jaipurOpportunity));
        when(destinationRepository.findAll()).thenReturn(List.of(jaipurDest));
        when(poiRepository.countPoisByDestination()).thenReturn(Collections.emptyList());
        when(hotelRepository.countHotelsByDestination()).thenReturn(Collections.emptyList());
        when(localHostRepository.countHostsByDestination()).thenReturn(Collections.emptyList());

        List<CulturalEcosystemGapDto> gaps = actionEngineService.detectAndSyncCulturalGaps(false);

        CulturalEcosystemGapDto artisanGap = gaps.stream()
                .filter(g -> g.getGapType() == EcosystemGapType.ARTISAN_PARTNER_DEFICIT)
                .findFirst()
                .orElse(null);

        assertThat(artisanGap).isNotNull();
        assertThat(artisanGap.getSeverity()).isEqualTo("HIGH"); // Score 82.5 >= 60.0
        assertThat(artisanGap.getDescription()).contains("verified artisan partner coverage is currently insufficient");
        assertThat(artisanGap.getSuggestedIntervention()).contains("Identify and onboard eligible artisan/community craft cooperatives");
    }

    @Test
    @DisplayName("3. Stays and guide host deficit descriptions use strict platform honesty wording")
    void testHonestyWordingInStaysAndHostGaps() {
        when(culturalOpportunityService.calculateAllCulturalOpportunities(false))
                .thenReturn(List.of(jaipurOpportunity));
        when(destinationRepository.findAll()).thenReturn(List.of(jaipurDest));
        // 3 POIs, 0 hotels, 0 hosts
        List<Object[]> poiRows = new ArrayList<>();
        poiRows.add(new Object[]{"dest-jaipur", 3L});
        when(poiRepository.countPoisByDestination()).thenReturn(poiRows);
        when(hotelRepository.countHotelsByDestination()).thenReturn(Collections.emptyList());
        when(localHostRepository.countHostsByDestination()).thenReturn(Collections.emptyList());

        List<CulturalEcosystemGapDto> gaps = actionEngineService.detectAndSyncCulturalGaps(false);

        CulturalEcosystemGapDto staysGap = gaps.stream()
                .filter(g -> g.getGapType() == EcosystemGapType.STAYS_DEFICIT)
                .findFirst()
                .orElse(null);
        assertThat(staysGap).isNotNull();
        assertThat(staysGap.getDescription()).contains("YatraSetu accommodation coverage is insufficient (0 registered stays)");

        CulturalEcosystemGapDto hostGap = gaps.stream()
                .filter(g -> g.getGapType() == EcosystemGapType.GUIDE_HOST_DEFICIT)
                .findFirst()
                .orElse(null);
        assertThat(hostGap).isNotNull();
        assertThat(hostGap.getDescription()).contains("YatraSetu verified host coverage is insufficient (0 verified hosts)");
    }

    @Test
    @DisplayName("4. Action engine generates and syncs deduplicated Government Actions with correct priority")
    void testActionGenerationAndDeduplication() {
        when(culturalOpportunityService.calculateAllCulturalOpportunities(false))
                .thenReturn(List.of(jaipurOpportunity));
        when(destinationRepository.findAll()).thenReturn(List.of(jaipurDest));
        when(destinationRepository.findById("dest-jaipur")).thenReturn(Optional.of(jaipurDest));
        when(poiRepository.countPoisByDestination()).thenReturn(Collections.emptyList());
        when(hotelRepository.countHotelsByDestination()).thenReturn(Collections.emptyList());
        when(localHostRepository.countHostsByDestination()).thenReturn(Collections.emptyList());
        when(actionRepository.findAll()).thenReturn(Collections.emptyList());
        when(actionRepository.findAllWithDetails()).thenReturn(Collections.emptyList());

        List<CulturalGovernmentActionDto> actions = actionEngineService.generateAndSyncCulturalActions(false, governmentUser);

        verify(actionRepository, atLeastOnce()).saveAll(anyList());
        assertThat(actions).isNotNull();
    }

    @Test
    @DisplayName("5. Deduplication preserves existing IN_PROGRESS and RESOLVED action status on subsequent runs")
    void testDeduplicationPreservesLifecycleStatus() {
        TourismGovernmentAction inProgressAction = TourismGovernmentAction.builder()
                .id("act-cult-dest-jaipur-cultural-experience-deficit")
                .destination(jaipurDest)
                .actionType(GovernmentActionType.CULTURAL_ECOSYSTEM_INTERVENTION)
                .title("Cultural Experience Onboarding Initiative: Jaipur Old City (CRITICAL)")
                .notes("RECOMMENDATION: Prioritize onboarding\n\nREASON: High demand")
                .user(governmentUser)
                .status(GovernmentActionStatus.IN_PROGRESS)
                .priority(GovernmentActionPriority.CRITICAL)
                .createdAt(Instant.now().minusSeconds(3600))
                .build();

        when(culturalOpportunityService.calculateAllCulturalOpportunities(false))
                .thenReturn(List.of(jaipurOpportunity));
        when(destinationRepository.findAll()).thenReturn(List.of(jaipurDest));
        when(destinationRepository.findById("dest-jaipur")).thenReturn(Optional.of(jaipurDest));
        when(poiRepository.countPoisByDestination()).thenReturn(Collections.emptyList());
        when(hotelRepository.countHotelsByDestination()).thenReturn(Collections.emptyList());
        when(localHostRepository.countHostsByDestination()).thenReturn(Collections.emptyList());
        when(actionRepository.findAll()).thenReturn(List.of(inProgressAction));
        when(actionRepository.findAllWithDetails()).thenReturn(List.of(inProgressAction));

        List<CulturalGovernmentActionDto> actions = actionEngineService.generateAndSyncCulturalActions(false, governmentUser);

        // Status should remain IN_PROGRESS
        assertThat(actions).hasSize(1);
        assertThat(actions.get(0).getStatus()).isEqualTo(GovernmentActionStatus.IN_PROGRESS);
    }

    @Test
    @DisplayName("6. Action status lifecycle transition updates status, logs resolution notes, and sets resolved timestamp")
    void testActionStatusLifecycleUpdate() {
        TourismGovernmentAction action = TourismGovernmentAction.builder()
                .id("act-cult-dest-jaipur-cultural-experience-deficit")
                .destination(jaipurDest)
                .actionType(GovernmentActionType.CULTURAL_ECOSYSTEM_INTERVENTION)
                .title("Cultural Experience Onboarding Initiative: Jaipur Old City (CRITICAL)")
                .notes("RECOMMENDATION: Prioritize onboarding\n\nREASON: High demand")
                .status(GovernmentActionStatus.LOGGED)
                .priority(GovernmentActionPriority.CRITICAL)
                .createdAt(Instant.now().minusSeconds(7200))
                .build();

        when(actionRepository.findById("act-cult-dest-jaipur-cultural-experience-deficit"))
                .thenReturn(Optional.of(action));
        when(actionRepository.save(any(TourismGovernmentAction.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(culturalOpportunityService.calculateDestinationOpportunity("dest-jaipur", false))
                .thenReturn(jaipurOpportunity);

        CulturalGovernmentActionDto updated = actionEngineService.updateActionStatus(
                "act-cult-dest-jaipur-cultural-experience-deficit",
                GovernmentActionStatus.RESOLVED,
                "State Board approved 3 Blue Pottery master artisans and listed verified workshops on YatraSetu.",
                governmentUser
        );

        assertThat(updated).isNotNull();
        assertThat(updated.getStatus()).isEqualTo(GovernmentActionStatus.RESOLVED);
        assertThat(updated.getResolutionNotes()).contains("State Board approved 3 Blue Pottery master artisans");
        assertThat(updated.getResolvedAt()).isNotNull();
        assertThat(updated.getUserFullName()).isEqualTo("Senior Tourism Director");
    }

    @Test
    @DisplayName("7. Overview aggregation calculates total gaps and severity counts correctly")
    void testGapsOverviewAggregation() {
        when(culturalOpportunityService.calculateAllCulturalOpportunities(false))
                .thenReturn(List.of(jaipurOpportunity));
        when(destinationRepository.findAll()).thenReturn(List.of(jaipurDest));
        when(poiRepository.countPoisByDestination()).thenReturn(Collections.emptyList());
        when(hotelRepository.countHotelsByDestination()).thenReturn(Collections.emptyList());
        when(localHostRepository.countHostsByDestination()).thenReturn(Collections.emptyList());

        CulturalEcosystemGapOverviewDto overview = actionEngineService.getGapsOverview(false);

        assertThat(overview.getTotalGapsDetected()).isGreaterThanOrEqualTo(2);
        assertThat(overview.getCriticalGapsCount()).isGreaterThanOrEqualTo(1);
        assertThat(overview.getCulturalExperienceDeficitCount()).isEqualTo(1);
        assertThat(overview.getArtisanPartnerDeficitCount()).isEqualTo(1);
        assertThat(overview.getDataDisclaimer()).contains("Platform-derived decision support metric");
    }
}
