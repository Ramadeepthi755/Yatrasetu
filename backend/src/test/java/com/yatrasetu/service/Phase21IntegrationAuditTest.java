package com.yatrasetu.service;

import com.yatrasetu.domain.*;
import com.yatrasetu.domain.intelligence.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.repository.intelligence.TourismEcosystemGapRepository;
import com.yatrasetu.repository.intelligence.TourismGovernmentActionRepository;
import com.yatrasetu.service.intelligence.CulturalActionEngineService;
import com.yatrasetu.service.intelligence.CulturalOpportunityService;
import com.yatrasetu.web.dto.CreateExperienceRequest;
import com.yatrasetu.web.dto.ExperienceDto;
import com.yatrasetu.web.dto.ExperienceVerificationRequest;
import com.yatrasetu.web.dto.UpdateExperienceRequest;
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
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class Phase21IntegrationAuditTest {

    @Mock
    private DestinationRepository destinationRepository;

    @Mock
    private CulturalTraditionRepository culturalTraditionRepository;

    @Mock
    private LocalHostRepository localHostRepository;

    @Mock
    private ExperienceRepository experienceRepository;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private DestinationPoiRepository poiRepository;

    @Mock
    private TourismEcosystemGapRepository gapRepository;

    @Mock
    private TourismGovernmentActionRepository actionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CulturalOpportunityService culturalOpportunityService;

    @InjectMocks
    private CulturalActionEngineService culturalActionEngineService;

    @InjectMocks
    private ExperienceService experienceService;

    private State karnatakaState;
    private City hampiCity;
    private Destination hampiDest;
    private CulturalTradition hampiTradition;
    private User artisanUser;
    private User governmentUser;
    private LocalHost artisanHost;

    @BeforeEach
    void setUp() {
        karnatakaState = State.builder().id("state-ka").stateName("Karnataka").build();
        hampiCity = City.builder().id("city-hampi").cityName("Hampi").state(karnatakaState).build();

        hampiDest = Destination.builder()
                .id("dest-hampi")
                .destinationName("Hampi Monuments")
                .state(karnatakaState)
                .city(hampiCity)
                .accessibility("Nearest railway Hospet 13km, Hubli Airport 140km")
                .build();

        hampiTradition = CulturalTradition.builder()
                .id("cult-ka-hampi-stone-carving")
                .traditionName("Hampi Stone Carving & Temple Architecture")
                .category("Traditional Craft")
                .state(karnatakaState)
                .city(hampiCity)
                .destination(hampiDest)
                .isGiTagged(true)
                .giTagYear("2010")
                .provenance("OFFICIAL")
                .isActive(true)
                .build();

        artisanUser = User.builder()
                .id("usr-artisan-hampi")
                .authUserId("auth-artisan-hampi")
                .fullName("Master Craftsman Ravi")
                .email("ravi.artisan@yatrasetu.org")
                .role(Role.PARTNER)
                .partnerSubtype(PartnerSubtype.ARTISAN)
                .verified(true)
                .verificationStatus(VerificationStatus.APPROVED)
                .build();

        governmentUser = User.builder()
                .id("usr-gov-officer")
                .authUserId("auth-gov-officer")
                .fullName("Karnataka Tourism Director")
                .email("director@karnatakatourism.gov.in")
                .role(Role.GOVERNMENT)
                .build();

        artisanHost = LocalHost.builder()
                .id("host-artisan-ravi")
                .user(artisanUser)
                .name("Master Craftsman Ravi")
                .destination(hampiDest)
                .city(hampiCity)
                .state(karnatakaState)
                .isVerified(true)
                .build();
    }

    @Test
    @DisplayName("1. End-to-End Pipeline: Opportunity -> Gap -> Action -> Resolution Audit")
    void testFullEcosystemPipeline_FromOpportunityToGapToActionToResolution() {
        // Step 1: Cultural Opportunity indicates High Opportunity with supply deficit
        CulturalOpportunityDto hampiOpportunity = CulturalOpportunityDto.builder()
                .destinationId("dest-hampi")
                .destinationName("Hampi Monuments")
                .stateId("state-ka")
                .stateName("Karnataka")
                .cityId("city-hampi")
                .cityName("Hampi")
                .score(BigDecimal.valueOf(85.0))
                .status("SUFFICIENT_DATA")
                .confidence("HIGH")
                .classification(CulturalOpportunityClassification.HIGH_OPPORTUNITY)
                .matrixCategory(CulturalSupplyDemandMatrixCategory.HIGH_DEMAND_LOW_SUPPLY)
                .traditionScore(BigDecimal.valueOf(25.0))
                .demandScore(BigDecimal.valueOf(30.0))
                .supplyScore(BigDecimal.valueOf(25.0))
                .gapPenalty(BigDecimal.valueOf(10.0))
                .traditionCount(1)
                .giTraditionCount(1)
                .observedDemandSignals(40L)
                .verifiedExperienceCount(0)
                .verifiedArtisanCount(0)
                .build();

        when(culturalOpportunityService.calculateAllCulturalOpportunities(false))
                .thenReturn(List.of(hampiOpportunity));
        when(destinationRepository.findAll()).thenReturn(List.of(hampiDest));
        when(destinationRepository.findById("dest-hampi")).thenReturn(Optional.of(hampiDest));
        when(localHostRepository.countHostsByDestination()).thenReturn(Collections.emptyList());
        when(hotelRepository.countHotelsByDestination()).thenReturn(Collections.emptyList());
        when(poiRepository.countPoisByDestination()).thenReturn(Collections.emptyList());
        when(actionRepository.findAll()).thenReturn(Collections.emptyList());

        // Step 2: Gap Engine detects CULTURAL_EXPERIENCE_DEFICIT and ARTISAN_PARTNER_DEFICIT
        List<CulturalEcosystemGapDto> gaps = culturalActionEngineService.detectAndSyncCulturalGaps(false);
        assertThat(gaps).isNotEmpty();
        assertThat(gaps).anyMatch(g -> g.getGapType() == EcosystemGapType.CULTURAL_EXPERIENCE_DEFICIT && "CRITICAL".equalsIgnoreCase(g.getSeverity()));
        assertThat(gaps).anyMatch(g -> g.getGapType() == EcosystemGapType.ARTISAN_PARTNER_DEFICIT);

        // Step 3: Action Engine generates idempotent interventions
        TourismGovernmentAction mockSavedAction = TourismGovernmentAction.builder()
                .id("act-cult-dest-hampi-cultural-experience-deficit")
                .destination(hampiDest)
                .actionType(GovernmentActionType.CULTURAL_ECOSYSTEM_INTERVENTION)
                .title("Intervention: Cultural Experience Deficit in Hampi Monuments")
                .notes("RECOMMENDATION: Prioritize onboarding and verification\n\nREASON: High cultural opportunity")
                .status(GovernmentActionStatus.LOGGED)
                .priority(GovernmentActionPriority.CRITICAL)
                .user(governmentUser)
                .createdAt(Instant.now())
                .build();
        when(actionRepository.findAllWithDetails()).thenReturn(List.of(mockSavedAction));

        List<CulturalGovernmentActionDto> actions = culturalActionEngineService.generateAndSyncCulturalActions(false, governmentUser);
        assertThat(actions).isNotEmpty();
        CulturalGovernmentActionDto expAction = actions.stream()
                .filter(a -> a.getGapType() == EcosystemGapType.CULTURAL_EXPERIENCE_DEFICIT)
                .findFirst()
                .orElseThrow();
        assertThat(expAction.getPriority()).isEqualTo(GovernmentActionPriority.CRITICAL);
        assertThat(expAction.getStatus()).isEqualTo(GovernmentActionStatus.LOGGED);
        assertThat(expAction.getRecommendedIntervention()).contains("Prioritize onboarding and verification");

        // Step 4: Government Official marks action as RESOLVED with notes
        when(actionRepository.findById(expAction.getId())).thenReturn(Optional.of(mockSavedAction));
        TourismGovernmentAction resolvedActionEntity = TourismGovernmentAction.builder()
                .id(expAction.getId())
                .destination(hampiDest)
                .actionType(GovernmentActionType.CULTURAL_ECOSYSTEM_INTERVENTION)
                .title(expAction.getTitle())
                .status(GovernmentActionStatus.RESOLVED)
                .priority(GovernmentActionPriority.CRITICAL)
                .resolutionNotes("Intervention completed: 2 authentic stone carving workshops accredited with Hampi Guild.")
                .resolvedAt(Instant.now())
                .user(governmentUser)
                .createdAt(Instant.now())
                .build();
        when(actionRepository.save(any(TourismGovernmentAction.class))).thenReturn(resolvedActionEntity);
        when(culturalOpportunityService.calculateDestinationOpportunity("dest-hampi", false)).thenReturn(hampiOpportunity);

        CulturalGovernmentActionDto resolvedAction = culturalActionEngineService.updateActionStatus(
                expAction.getId(),
                GovernmentActionStatus.RESOLVED,
                "Intervention completed: 2 authentic stone carving workshops accredited with Hampi Guild.",
                governmentUser
        );

        assertThat(resolvedAction.getStatus()).isEqualTo(GovernmentActionStatus.RESOLVED);
        assertThat(resolvedAction.getResolutionNotes()).contains("Hampi Guild");
        assertThat(resolvedAction.getResolvedAt()).isNotNull();
    }

    @Test
    @DisplayName("2. Deterministic Action Deduplication: Multiple Generations Preserve Identity and History")
    void testActionIdempotencyAndDeduplicationOnMultipleGenerations() {
        CulturalOpportunityDto hampiOpportunity = CulturalOpportunityDto.builder()
                .destinationId("dest-hampi")
                .destinationName("Hampi Monuments")
                .stateId("state-ka")
                .score(BigDecimal.valueOf(80.0))
                .status("SUFFICIENT_DATA")
                .confidence("HIGH")
                .classification(CulturalOpportunityClassification.HIGH_OPPORTUNITY)
                .matrixCategory(CulturalSupplyDemandMatrixCategory.HIGH_DEMAND_LOW_SUPPLY)
                .traditionScore(BigDecimal.valueOf(20.0))
                .demandScore(BigDecimal.valueOf(25.0))
                .supplyScore(BigDecimal.valueOf(25.0))
                .gapPenalty(BigDecimal.valueOf(5.0))
                .traditionCount(1)
                .observedDemandSignals(30L)
                .verifiedExperienceCount(0)
                .verifiedArtisanCount(0)
                .build();

        when(culturalOpportunityService.calculateAllCulturalOpportunities(false))
                .thenReturn(List.of(hampiOpportunity));
        when(destinationRepository.findAll()).thenReturn(List.of(hampiDest));
        when(destinationRepository.findById("dest-hampi")).thenReturn(Optional.of(hampiDest));
        when(localHostRepository.countHostsByDestination()).thenReturn(Collections.emptyList());
        when(hotelRepository.countHotelsByDestination()).thenReturn(Collections.emptyList());
        when(poiRepository.countPoisByDestination()).thenReturn(Collections.emptyList());

        // Pre-existing RESOLVED action in DB
        TourismGovernmentAction existingResolvedAction = TourismGovernmentAction.builder()
                .id("act-cult-dest-hampi-cultural-experience-deficit")
                .destination(hampiDest)
                .actionType(GovernmentActionType.CULTURAL_ECOSYSTEM_INTERVENTION)
                .title("Intervention: Cultural Experience Deficit in Hampi Monuments")
                .status(GovernmentActionStatus.RESOLVED)
                .priority(GovernmentActionPriority.CRITICAL)
                .resolutionNotes("Initial onboarding drive completed by DTPC.")
                .resolvedAt(Instant.now().minusSeconds(86400))
                .createdAt(Instant.now().minusSeconds(172800))
                .build();

        when(actionRepository.findAll()).thenReturn(List.of(existingResolvedAction));
        when(actionRepository.findAllWithDetails()).thenReturn(List.of(existingResolvedAction));

        // Generate actions multiple times
        List<CulturalGovernmentActionDto> run1 = culturalActionEngineService.generateAndSyncCulturalActions(false, governmentUser);
        List<CulturalGovernmentActionDto> run2 = culturalActionEngineService.generateAndSyncCulturalActions(false, governmentUser);

        assertThat(run1).hasSameSizeAs(run2);

        // Verify the existing resolved action was not duplicated or overwritten to LOGGED
        CulturalGovernmentActionDto action = run2.stream()
                .filter(a -> a.getId().equals("act-cult-dest-hampi-cultural-experience-deficit"))
                .findFirst()
                .orElseThrow();

        assertThat(action.getStatus()).isEqualTo(GovernmentActionStatus.RESOLVED);
        assertThat(action.getResolutionNotes()).isEqualTo("Initial onboarding drive completed by DTPC.");
    }

    @Test
    @DisplayName("3. Artisan Experience Flow: Linking, Verification, and Reset on Sensitive Edit")
    void testArtisanExperienceVerificationLifecycleAndResetOnMutation() {
        when(userRepository.findByAuthUserId("auth-artisan-hampi")).thenReturn(Optional.of(artisanUser));
        when(localHostRepository.findByUserId(artisanUser.getId())).thenReturn(Optional.of(artisanHost));
        when(destinationRepository.findById("dest-hampi")).thenReturn(Optional.of(hampiDest));
        when(culturalTraditionRepository.findById("cult-ka-hampi-stone-carving")).thenReturn(Optional.of(hampiTradition));

        // 1. Partner creates experience linked to CulturalTradition
        CreateExperienceRequest createReq = CreateExperienceRequest.builder()
                .title("Hampi Stone Carving Masterclass")
                .description("Hands-on stone carving using traditional chisel techniques.")
                .category("Craft Workshop")
                .culturalTraditionId("cult-ka-hampi-stone-carving")
                .destinationId("dest-hampi")
                .durationHours(BigDecimal.valueOf(3.0))
                .pricePerPerson(BigDecimal.valueOf(1200))
                .maxGroupSize(6)
                .build();

        Experience savedDraft = Experience.builder()
                .id("exp-hampi-101")
                .host(artisanHost)
                .destination(hampiDest)
                .city(hampiCity)
                .title(createReq.getTitle())
                .category(createReq.getCategory())
                .culturalTradition(hampiTradition)
                .pricePerPerson(createReq.getPricePerPerson())
                .durationHours(createReq.getDurationHours())
                .maxGroupSize(createReq.getMaxGroupSize())
                .status(ExperienceStatus.DRAFT)
                .verificationStatus(ExperienceVerificationStatus.UNVERIFIED)
                .build();

        when(experienceRepository.save(any(Experience.class))).thenReturn(savedDraft);
        when(experienceRepository.findById("exp-hampi-101")).thenReturn(Optional.of(savedDraft));

        ExperienceDto createdExp = experienceService.createExperience("auth-artisan-hampi", createReq);
        assertThat(createdExp.getStatus()).isEqualTo("DRAFT");
        assertThat(createdExp.getVerificationStatus()).isEqualTo("UNVERIFIED");
        assertThat(createdExp.getCulturalTraditionName()).isEqualTo("Hampi Stone Carving & Temple Architecture");

        // 2. Partner submits experience
        Experience submittedExp = Experience.builder()
                .id("exp-hampi-101")
                .host(artisanHost)
                .destination(hampiDest)
                .title(createReq.getTitle())
                .culturalTradition(hampiTradition)
                .status(ExperienceStatus.SUBMITTED)
                .verificationStatus(ExperienceVerificationStatus.PENDING_REVIEW)
                .build();
        when(experienceRepository.save(any(Experience.class))).thenReturn(submittedExp);

        ExperienceDto submittedResult = experienceService.submitExperience("auth-artisan-hampi", "exp-hampi-101");
        assertThat(submittedResult.getStatus()).isEqualTo("SUBMITTED");
        assertThat(submittedResult.getVerificationStatus()).isEqualTo("PENDING_REVIEW");

        // 3. Government reviews and approves
        when(userRepository.findByAuthUserId("auth-gov-officer")).thenReturn(Optional.of(governmentUser));
        when(experienceRepository.findById("exp-hampi-101")).thenReturn(Optional.of(submittedExp));

        Experience approvedExp = Experience.builder()
                .id("exp-hampi-101")
                .host(artisanHost)
                .destination(hampiDest)
                .title(createReq.getTitle())
                .culturalTradition(hampiTradition)
                .status(ExperienceStatus.PUBLISHED)
                .verificationStatus(ExperienceVerificationStatus.VERIFIED)
                .verifiedBy("usr-gov-officer")
                .verifiedAt(Instant.now())
                .build();
        when(experienceRepository.save(any(Experience.class))).thenReturn(approvedExp);

        ExperienceVerificationRequest verifReq = ExperienceVerificationRequest.builder()
                .decision("APPROVED")
                .verificationNotes("Craft pedigree verified with Karnataka Crafts Council.")
                .build();

        ExperienceDto reviewedResult = experienceService.verifyExperience("auth-gov-officer", "exp-hampi-101", verifReq);
        assertThat(reviewedResult.getStatus()).isEqualTo("PUBLISHED");
        assertThat(reviewedResult.getVerificationStatus()).isEqualTo("VERIFIED");

        // 4. Partner edits critical field -> Verification resets to DRAFT / UNVERIFIED
        when(experienceRepository.findById("exp-hampi-101")).thenReturn(Optional.of(approvedExp));
        Experience resetExp = Experience.builder()
                .id("exp-hampi-101")
                .host(artisanHost)
                .destination(hampiDest)
                .title("Hampi Stone Carving Masterclass - Advanced")
                .culturalTradition(hampiTradition)
                .status(ExperienceStatus.DRAFT)
                .verificationStatus(ExperienceVerificationStatus.UNVERIFIED)
                .build();
        when(experienceRepository.save(any(Experience.class))).thenReturn(resetExp);

        UpdateExperienceRequest updateReq = UpdateExperienceRequest.builder()
                .title("Hampi Stone Carving Masterclass - Advanced")
                .culturalTraditionId("cult-ka-hampi-stone-carving")
                .build();

        ExperienceDto updatedResult = experienceService.updateExperience("auth-artisan-hampi", "exp-hampi-101", updateReq);
        assertThat(updatedResult.getStatus()).isEqualTo("DRAFT");
        assertThat(updatedResult.getVerificationStatus()).isEqualTo("UNVERIFIED");
    }

    @Test
    @DisplayName("4. Data Honesty & Provenance: Strict Non-Fabrication and Platform Language Standard")
    void testDataHonestyAndLinguisticClaimsStandard() {
        CulturalOpportunityDto opportunity = CulturalOpportunityDto.builder()
                .destinationId("dest-hampi")
                .destinationName("Hampi Monuments")
                .stateId("state-ka")
                .score(BigDecimal.valueOf(70.0))
                .status("SUFFICIENT_DATA")
                .confidence("HIGH")
                .classification(CulturalOpportunityClassification.MODERATE_OPPORTUNITY)
                .matrixCategory(CulturalSupplyDemandMatrixCategory.HIGH_DEMAND_LOW_SUPPLY)
                .traditionScore(BigDecimal.valueOf(20.0))
                .demandScore(BigDecimal.valueOf(25.0))
                .supplyScore(BigDecimal.valueOf(25.0))
                .gapPenalty(BigDecimal.valueOf(0.0))
                .traditionCount(1)
                .observedDemandSignals(20L)
                .verifiedExperienceCount(0)
                .verifiedArtisanCount(0)
                .build();

        when(culturalOpportunityService.calculateAllCulturalOpportunities(false)).thenReturn(List.of(opportunity));
        when(destinationRepository.findAll()).thenReturn(List.of(hampiDest));
        when(destinationRepository.findById("dest-hampi")).thenReturn(Optional.of(hampiDest));
        when(localHostRepository.countHostsByDestination()).thenReturn(Collections.emptyList());
        when(hotelRepository.countHotelsByDestination()).thenReturn(Collections.emptyList());
        when(poiRepository.countPoisByDestination()).thenReturn(Collections.emptyList());
        when(actionRepository.findAll()).thenReturn(Collections.emptyList());

        List<CulturalEcosystemGapDto> gaps = culturalActionEngineService.detectAndSyncCulturalGaps(false);
        for (CulturalEcosystemGapDto gap : gaps) {
            // Verify honest wording rule
            assertThat(gap.getDisclaimer()).contains("Platform-derived");
            assertThat(gap.getDescription()).doesNotContain("No hotels exist in the world");
            assertThat(gap.getDescription()).doesNotContain("There are no guides");
            if (gap.getGapType() == EcosystemGapType.STAYS_DEFICIT) {
                assertThat(gap.getDescription()).contains("YatraSetu accommodation coverage is insufficient");
            }
            if (gap.getGapType() == EcosystemGapType.CULTURAL_EXPERIENCE_DEFICIT) {
                assertThat(gap.getDescription()).contains("verified cultural experience coverage is insufficient");
            }
        }

        TourismGovernmentAction mockAction = TourismGovernmentAction.builder()
                .id("act-cult-dest-hampi-cultural-experience-deficit")
                .destination(hampiDest)
                .actionType(GovernmentActionType.CULTURAL_ECOSYSTEM_INTERVENTION)
                .title("Intervention: Cultural Experience Deficit")
                .notes("RECOMMENDATION: Prioritize onboarding and verification\n\nREASON: High opportunity")
                .status(GovernmentActionStatus.LOGGED)
                .priority(GovernmentActionPriority.HIGH)
                .createdAt(Instant.now())
                .build();
        when(actionRepository.findAllWithDetails()).thenReturn(List.of(mockAction));

        List<CulturalGovernmentActionDto> actions = culturalActionEngineService.generateAndSyncCulturalActions(false, governmentUser);
        for (CulturalGovernmentActionDto action : actions) {
            assertThat(action.getDisclaimer()).contains("Platform-derived");
            assertThat(action.getRecommendedIntervention()).doesNotStartWith("Government must");
            assertThat(action.getRecommendedIntervention()).doesNotStartWith("Government should definitely");
        }
    }
}
