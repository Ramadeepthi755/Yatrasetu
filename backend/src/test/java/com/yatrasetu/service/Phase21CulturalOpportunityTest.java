package com.yatrasetu.service;

import com.yatrasetu.domain.*;
import com.yatrasetu.domain.intelligence.CulturalOpportunityClassification;
import com.yatrasetu.domain.intelligence.CulturalSupplyDemandMatrixCategory;
import com.yatrasetu.domain.intelligence.IntelligenceSourceType;
import com.yatrasetu.repository.*;
import com.yatrasetu.repository.intelligence.TourismDemandSignalRepository;
import com.yatrasetu.repository.intelligence.TourismEcosystemGapRepository;
import com.yatrasetu.service.intelligence.CulturalOpportunityService;
import com.yatrasetu.web.dto.intelligence.CulturalOpportunityDto;
import com.yatrasetu.web.dto.intelligence.CulturalOpportunityOverviewDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class Phase21CulturalOpportunityTest {

    @Mock
    private DestinationRepository destinationRepository;

    @Mock
    private CulturalTraditionRepository culturalTraditionRepository;

    @Mock
    private ExperienceRepository experienceRepository;

    @Mock
    private LocalHostRepository localHostRepository;

    @Mock
    private TourismDemandSignalRepository signalRepository;

    @Mock
    private TourismEcosystemGapRepository gapRepository;

    @InjectMocks
    private CulturalOpportunityService culturalOpportunityService;

    private State apState;
    private City tirupatiCity;
    private Destination srikalahastiDest;
    private Destination remoteDest;

    private CulturalTradition kalamkariTradition;
    private CulturalTradition kondapalliTradition;

    @BeforeEach
    void setUp() {
        apState = State.builder().id("state-ap").stateName("Andhra Pradesh").build();
        tirupatiCity = City.builder().id("city-tirupati").cityName("Tirupati").state(apState).build();

        srikalahastiDest = Destination.builder()
                .id("dest-srikalahasti")
                .destinationName("Srikalahasti Temple & Craft Town")
                .state(apState)
                .city(tirupatiCity)
                .accessibility("Easy road connectivity")
                .build();

        remoteDest = Destination.builder()
                .id("dest-remote")
                .destinationName("Remote Unmapped Ridge")
                .state(null)
                .city(null)
                .accessibility("Difficult trekking terrain")
                .build();

        kalamkariTradition = CulturalTradition.builder()
                .id("trad-kalamkari")
                .traditionName("Srikalahasti Kalamkari")
                .category("Textiles & Handlooms")
                .state(apState)
                .city(tirupatiCity)
                .destination(srikalahastiDest)
                .isGiTagged(true)
                .isActive(true)
                .sourceType(SourceType.OFFICIAL)
                .build();

        kondapalliTradition = CulturalTradition.builder()
                .id("trad-kondapalli")
                .traditionName("Kondapalli Toys")
                .category("Crafts & Woodwork")
                .state(apState)
                .city(null)
                .destination(null)
                .isGiTagged(true)
                .isActive(true)
                .sourceType(SourceType.OFFICIAL)
                .build();
    }

    private List<Object[]> createSignalRows(String destId, long count) {
        List<Object[]> list = new ArrayList<>();
        list.add(new Object[]{destId, count});
        return list;
    }

    @Test
    @DisplayName("1. Destinations with zero traditions and zero demand signals return INSUFFICIENT_DATA")
    void testInsufficientDataDestination() {
        when(destinationRepository.findAll()).thenReturn(List.of(remoteDest));
        when(culturalTraditionRepository.findAll()).thenReturn(Collections.emptyList());
        when(experienceRepository.findAll()).thenReturn(Collections.emptyList());
        when(localHostRepository.findAll()).thenReturn(Collections.emptyList());
        when(signalRepository.sumSignalsByDestinationBetween(any(LocalDate.class), any(LocalDate.class), anyBoolean()))
                .thenReturn(Collections.emptyList());

        List<CulturalOpportunityDto> results = culturalOpportunityService.calculateAllCulturalOpportunities(false);

        assertThat(results).hasSize(1);
        CulturalOpportunityDto dto = results.get(0);
        assertThat(dto.getStatus()).isEqualTo("INSUFFICIENT_DATA");
        assertThat(dto.getScore()).isNull();
        assertThat(dto.getConfidence()).isEqualTo("INSUFFICIENT");
        assertThat(dto.getClassification()).isEqualTo(CulturalOpportunityClassification.INSUFFICIENT_DATA);
        assertThat(dto.getMatrixCategory()).isEqualTo(CulturalSupplyDemandMatrixCategory.INSUFFICIENT_DATA);
        assertThat(dto.getExplanations().get(0)).contains("Insufficient production data");
    }

    @Test
    @DisplayName("2. Strong authentic tradition presence generates valid tradition score capped at 30")
    void testTraditionScoreCalculation() {
        when(destinationRepository.findAll()).thenReturn(List.of(srikalahastiDest));
        when(culturalTraditionRepository.findAll()).thenReturn(List.of(kalamkariTradition, kondapalliTradition));
        when(experienceRepository.findAll()).thenReturn(Collections.emptyList());
        when(localHostRepository.findAll()).thenReturn(Collections.emptyList());
        when(signalRepository.sumSignalsByDestinationBetween(any(LocalDate.class), any(LocalDate.class), anyBoolean()))
                .thenReturn(Collections.emptyList());

        List<CulturalOpportunityDto> results = culturalOpportunityService.calculateAllCulturalOpportunities(false);

        assertThat(results).hasSize(1);
        CulturalOpportunityDto dto = results.get(0);
        assertThat(dto.getStatus()).isEqualTo("SUFFICIENT_DATA");
        // Kalamkari: destination (10) + city (6) + GI (2) = 18. Kondapalli: state contextual (2) + GI (2) = 4. Total = 22.0.
        assertThat(dto.getTraditionScore()).isGreaterThan(BigDecimal.valueOf(15.0));
        assertThat(dto.getTraditionScore()).isLessThanOrEqualTo(BigDecimal.valueOf(30.0));
        assertThat(dto.getDestinationTraditionCount()).isEqualTo(1);
        assertThat(dto.getGiTraditionCount()).isGreaterThanOrEqualTo(1);
    }

    @Test
    @DisplayName("3. High observed tourism demand signals scale demand component up to 35")
    void testDemandScoreScaling() {
        when(destinationRepository.findAll()).thenReturn(List.of(srikalahastiDest));
        when(culturalTraditionRepository.findAll()).thenReturn(List.of(kalamkariTradition));
        when(experienceRepository.findAll()).thenReturn(Collections.emptyList());
        when(localHostRepository.findAll()).thenReturn(Collections.emptyList());
        when(signalRepository.sumSignalsByDestinationBetween(any(LocalDate.class), any(LocalDate.class), anyBoolean()))
                .thenReturn(createSignalRows("dest-srikalahasti", 50L));

        List<CulturalOpportunityDto> results = culturalOpportunityService.calculateAllCulturalOpportunities(false);

        assertThat(results).hasSize(1);
        CulturalOpportunityDto dto = results.get(0);
        assertThat(dto.getObservedDemandSignals()).isEqualTo(50L);
        assertThat(dto.getDemandScore()).isEqualTo(BigDecimal.valueOf(35.0).setScale(1));
    }

    @Test
    @DisplayName("4. Supply score is highest (25) when verified cultural experience count is zero")
    void testSupplyOpportunityHeadroom() {
        when(destinationRepository.findAll()).thenReturn(List.of(srikalahastiDest));
        when(culturalTraditionRepository.findAll()).thenReturn(List.of(kalamkariTradition));
        when(experienceRepository.findAll()).thenReturn(Collections.emptyList());
        when(localHostRepository.findAll()).thenReturn(Collections.emptyList());
        when(signalRepository.sumSignalsByDestinationBetween(any(LocalDate.class), any(LocalDate.class), anyBoolean()))
                .thenReturn(Collections.emptyList());

        List<CulturalOpportunityDto> results = culturalOpportunityService.calculateAllCulturalOpportunities(false);

        assertThat(results).hasSize(1);
        CulturalOpportunityDto dto = results.get(0);
        assertThat(dto.getVerifiedExperienceCount()).isEqualTo(0);
        assertThat(dto.getSupplyScore()).isEqualTo(BigDecimal.valueOf(25.0).setScale(1));
    }

    @Test
    @DisplayName("5. Unverified drafts and rejected experiences are excluded from verified supply")
    void testUnverifiedExperiencesExcludedFromSupply() {
        Experience draftExp = Experience.builder()
                .id("exp-draft")
                .destination(srikalahastiDest)
                .culturalTradition(kalamkariTradition)
                .verificationStatus(ExperienceVerificationStatus.UNVERIFIED)
                .status(ExperienceStatus.DRAFT)
                .isActive(true)
                .isDemoData(false)
                .build();

        Experience rejectedExp = Experience.builder()
                .id("exp-rejected")
                .destination(srikalahastiDest)
                .culturalTradition(kalamkariTradition)
                .verificationStatus(ExperienceVerificationStatus.REJECTED)
                .status(ExperienceStatus.REJECTED)
                .isActive(true)
                .isDemoData(false)
                .build();

        when(destinationRepository.findAll()).thenReturn(List.of(srikalahastiDest));
        when(culturalTraditionRepository.findAll()).thenReturn(List.of(kalamkariTradition));
        when(experienceRepository.findAll()).thenReturn(List.of(draftExp, rejectedExp));
        when(localHostRepository.findAll()).thenReturn(Collections.emptyList());
        when(signalRepository.sumSignalsByDestinationBetween(any(LocalDate.class), any(LocalDate.class), anyBoolean()))
                .thenReturn(Collections.emptyList());

        List<CulturalOpportunityDto> results = culturalOpportunityService.calculateAllCulturalOpportunities(false);

        assertThat(results).hasSize(1);
        CulturalOpportunityDto dto = results.get(0);
        // Both experiences are unverified / rejected, so verified count remains 0
        assertThat(dto.getVerifiedExperienceCount()).isEqualTo(0);
        assertThat(dto.getSupplyScore()).isEqualTo(BigDecimal.valueOf(25.0).setScale(1));
    }

    @Test
    @DisplayName("6. Demo experiences are isolated from production score when includeDemo is false")
    void testDemoIsolation() {
        Experience demoExp = Experience.builder()
                .id("exp-demo")
                .destination(srikalahastiDest)
                .culturalTradition(kalamkariTradition)
                .verificationStatus(ExperienceVerificationStatus.UNVERIFIED)
                .status(ExperienceStatus.PUBLISHED)
                .isActive(true)
                .isDemoData(true)
                .build();

        when(destinationRepository.findAll()).thenReturn(List.of(srikalahastiDest));
        when(culturalTraditionRepository.findAll()).thenReturn(List.of(kalamkariTradition));
        when(experienceRepository.findAll()).thenReturn(List.of(demoExp));
        when(localHostRepository.findAll()).thenReturn(Collections.emptyList());
        when(signalRepository.sumSignalsByDestinationBetween(any(LocalDate.class), any(LocalDate.class), eq(false)))
                .thenReturn(Collections.emptyList());

        List<CulturalOpportunityDto> results = culturalOpportunityService.calculateAllCulturalOpportunities(false);

        assertThat(results).hasSize(1);
        CulturalOpportunityDto dto = results.get(0);
        assertThat(dto.getDataMode()).isEqualTo(IntelligenceSourceType.OBSERVED);
        assertThat(dto.getVerifiedExperienceCount()).isEqualTo(0);
    }

    @Test
    @DisplayName("7. Cultural experience deficit is detected and applies penalty when demand exists but supply is 0")
    void testCulturalExperienceDeficitGap() {
        when(destinationRepository.findAll()).thenReturn(List.of(srikalahastiDest));
        when(culturalTraditionRepository.findAll()).thenReturn(List.of(kalamkariTradition));
        when(experienceRepository.findAll()).thenReturn(Collections.emptyList());
        when(localHostRepository.findAll()).thenReturn(Collections.emptyList());
        when(signalRepository.sumSignalsByDestinationBetween(any(LocalDate.class), any(LocalDate.class), anyBoolean()))
                .thenReturn(createSignalRows("dest-srikalahasti", 20L));

        List<CulturalOpportunityDto> results = culturalOpportunityService.calculateAllCulturalOpportunities(false);

        assertThat(results).hasSize(1);
        CulturalOpportunityDto dto = results.get(0);
        assertThat(dto.getDetectedGaps()).anyMatch(g -> g.contains("CULTURAL_EXPERIENCE_DEFICIT"));
        assertThat(dto.getGapPenalty()).isGreaterThanOrEqualTo(BigDecimal.valueOf(10.0));
    }

    @Test
    @DisplayName("8. Final score is strictly bounded [0, 100]")
    void testScoreBounding() {
        when(destinationRepository.findAll()).thenReturn(List.of(srikalahastiDest));
        when(culturalTraditionRepository.findAll()).thenReturn(List.of(kalamkariTradition, kondapalliTradition));
        when(experienceRepository.findAll()).thenReturn(Collections.emptyList());
        when(localHostRepository.findAll()).thenReturn(Collections.emptyList());
        when(signalRepository.sumSignalsByDestinationBetween(any(LocalDate.class), any(LocalDate.class), anyBoolean()))
                .thenReturn(createSignalRows("dest-srikalahasti", 100L));

        List<CulturalOpportunityDto> results = culturalOpportunityService.calculateAllCulturalOpportunities(false);

        assertThat(results).hasSize(1);
        CulturalOpportunityDto dto = results.get(0);
        assertThat(dto.getScore()).isNotNull();
        assertThat(dto.getScore()).isGreaterThanOrEqualTo(BigDecimal.ZERO);
        assertThat(dto.getScore()).isLessThanOrEqualTo(BigDecimal.valueOf(100.0));
    }

    @Test
    @DisplayName("9. Matrix category correctly identifies HIGH_DEMAND_LOW_SUPPLY opportunity")
    void testHighDemandLowSupplyClassification() {
        when(destinationRepository.findAll()).thenReturn(List.of(srikalahastiDest));
        when(culturalTraditionRepository.findAll()).thenReturn(List.of(kalamkariTradition));
        when(experienceRepository.findAll()).thenReturn(Collections.emptyList());
        when(localHostRepository.findAll()).thenReturn(Collections.emptyList());
        when(signalRepository.sumSignalsByDestinationBetween(any(LocalDate.class), any(LocalDate.class), anyBoolean()))
                .thenReturn(createSignalRows("dest-srikalahasti", 25L));

        List<CulturalOpportunityDto> results = culturalOpportunityService.calculateAllCulturalOpportunities(false);

        assertThat(results).hasSize(1);
        CulturalOpportunityDto dto = results.get(0);
        assertThat(dto.getMatrixCategory()).isEqualTo(CulturalSupplyDemandMatrixCategory.HIGH_DEMAND_LOW_SUPPLY);
        assertThat(dto.getSuggestedActions().get(0)).contains("High Priority");
    }

    @Test
    @DisplayName("10. Overview aggregation computes macro averages and matrix distribution correctly")
    void testOverviewAggregation() {
        when(destinationRepository.findAll()).thenReturn(List.of(srikalahastiDest, remoteDest));
        when(culturalTraditionRepository.findAll()).thenReturn(List.of(kalamkariTradition));
        when(experienceRepository.findAll()).thenReturn(Collections.emptyList());
        when(localHostRepository.findAll()).thenReturn(Collections.emptyList());
        when(signalRepository.sumSignalsByDestinationBetween(any(LocalDate.class), any(LocalDate.class), anyBoolean()))
                .thenReturn(createSignalRows("dest-srikalahasti", 15L));
        when(signalRepository.countBySourceType(IntelligenceSourceType.OBSERVED)).thenReturn(15L);
        when(signalRepository.countBySourceType(IntelligenceSourceType.DEMO)).thenReturn(5L);

        CulturalOpportunityOverviewDto overview = culturalOpportunityService.getOverview(false);

        assertThat(overview.getTotalDestinationsEvaluated()).isEqualTo(2);
        assertThat(overview.getDestinationsWithSufficientData()).isEqualTo(1);
        assertThat(overview.getDestinationsWithInsufficientData()).isEqualTo(1);
        assertThat(overview.getAverageOpportunityScore()).isNotNull();
        assertThat(overview.getMatrixDistribution()).containsKeys("HIGH_DEMAND_LOW_SUPPLY", "INSUFFICIENT_DATA");
    }
}
