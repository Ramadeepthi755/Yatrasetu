package com.yatrasetu.service;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.domain.Destination;
import com.yatrasetu.domain.Role;
import com.yatrasetu.domain.State;
import com.yatrasetu.domain.User;
import com.yatrasetu.domain.intelligence.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.repository.intelligence.TourismDemandSignalRepository;
import com.yatrasetu.repository.intelligence.TourismEcosystemGapRepository;
import com.yatrasetu.repository.intelligence.TourismGovernmentActionRepository;
import com.yatrasetu.service.ai.AiAssistantService;
import com.yatrasetu.service.ai.AiContextRetrievalService;
import com.yatrasetu.service.intelligence.*;
import com.yatrasetu.web.dto.AiChatRequest;
import com.yatrasetu.web.dto.AiChatResponse;
import com.yatrasetu.web.dto.intelligence.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class Phase15IntelligenceDeepeningTest {

    @Mock
    private DestinationRepository destinationRepository;

    @Mock
    private DestinationPoiRepository poiRepository;

    @Mock
    private DestinationHealthService healthService;

    @Mock
    private LocalHostRepository localHostRepository;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private ExperienceRepository experienceRepository;

    @Mock
    private DestinationTransportRepository transportRepository;

    @Mock
    private TourismDemandSignalRepository signalRepository;

    @Mock
    private TourismEcosystemGapRepository gapRepository;

    @Mock
    private TourismGovernmentActionRepository actionRepository;

    @Mock
    private EcosystemGapDetectionService mockGapDetectionService;

    @InjectMocks
    private HiddenGemDiscoveryService hiddenGemDiscoveryService;

    @InjectMocks
    private DynamicRedistributionService dynamicRedistributionService;

    @InjectMocks
    private EcosystemGapDetectionService ecosystemGapDetectionService;

    private GovernmentAlertService governmentAlertService;

    @InjectMocks
    private GovernmentIntelligenceService governmentIntelligenceService;

    private Destination highPressureDest;
    private Destination underutilizedDest;
    private State state;
    private User govUser;

    @BeforeEach
    void setUp() {
        governmentAlertService = new GovernmentAlertService(healthService, mockGapDetectionService);

        state = State.builder().id("IN-KA").stateName("Karnataka").build();

        highPressureDest = Destination.builder()
                .id("dest-1")
                .destinationName("Goa Beach Hub")
                .state(state)
                .tripTypes(List.of("Beach", "Coastal", "Heritage"))
                .accessibility("Easy")
                .popularityScore(BigDecimal.valueOf(95.0))
                .build();

        underutilizedDest = Destination.builder()
                .id("dest-25")
                .destinationName("Gokarna Coastal Sanctuary")
                .state(state)
                .tripTypes(List.of("Beach", "Coastal", "Spiritual"))
                .accessibility("Moderate")
                .popularityScore(BigDecimal.valueOf(40.0))
                .build();

        govUser = User.builder()
                .id("usr-gov-1")
                .email("gov@yatrasetu.in")
                .fullName("Regional Tourism Officer")
                .role(Role.GOVERNMENT)
                .build();
    }

    @Test
    @DisplayName("Hidden Gem Discovery ranks underutilized destinations with verified capacity")
    void testDiscoverHiddenGems() {
        when(destinationRepository.findAll()).thenReturn(List.of(highPressureDest, underutilizedDest));

        DestinationHealthDto underutilizedHealth = DestinationHealthDto.builder()
                .destinationId("dest-25")
                .destinationName("Gokarna Coastal Sanctuary")
                .classification(HealthClassification.UNDERUTILIZED)
                .demandScore(BigDecimal.valueOf(20.0))
                .activityPressureScore(BigDecimal.valueOf(25.0))
                .localOpportunityScore(BigDecimal.valueOf(65.0))
                .accessibilityScore(BigDecimal.valueOf(60.0))
                .sustainabilityProxyScore(BigDecimal.valueOf(80.0))
                .build();

        DestinationHealthDto highPressureHealth = DestinationHealthDto.builder()
                .destinationId("dest-1")
                .destinationName("Goa Beach Hub")
                .classification(HealthClassification.HIGH_PRESSURE)
                .demandScore(BigDecimal.valueOf(85.0))
                .activityPressureScore(BigDecimal.valueOf(82.0))
                .localOpportunityScore(BigDecimal.valueOf(70.0))
                .accessibilityScore(BigDecimal.valueOf(90.0))
                .sustainabilityProxyScore(BigDecimal.valueOf(45.0))
                .build();

        when(healthService.getAllDestinationHealthScores(anyBoolean()))
                .thenReturn(List.of(highPressureHealth, underutilizedHealth));

        List<Object[]> poiRows = new ArrayList<>();
        poiRows.add(new Object[]{"dest-25", 5L});
        when(poiRepository.countPoisByDestination()).thenReturn(poiRows);

        List<DynamicHiddenGemDto> gems = hiddenGemDiscoveryService.discoverHiddenGems(false, 10);

        assertNotNull(gems);
        assertFalse(gems.isEmpty());
        assertEquals("dest-25", gems.get(0).getDestinationId());
        assertTrue(gems.get(0).getHiddenGemScore().doubleValue() > 50.0);
        assertTrue(gems.get(0).getExplanation().contains("Gokarna Coastal Sanctuary"));
        assertNotNull(gems.get(0).getDisclaimer());
    }

    @Test
    @DisplayName("Dynamic Redistribution engine pairs high-pressure source with compatible underutilized target")
    void testDynamicRedistributionCorridors() {
        when(destinationRepository.findAll()).thenReturn(List.of(highPressureDest, underutilizedDest));

        DestinationHealthDto highPressureHealth = DestinationHealthDto.builder()
                .destinationId("dest-1")
                .destinationName("Goa Beach Hub")
                .classification(HealthClassification.HIGH_PRESSURE)
                .demandScore(BigDecimal.valueOf(85.0))
                .activityPressureScore(BigDecimal.valueOf(82.0))
                .localOpportunityScore(BigDecimal.valueOf(70.0))
                .build();

        DestinationHealthDto underutilizedHealth = DestinationHealthDto.builder()
                .destinationId("dest-25")
                .destinationName("Gokarna Coastal Sanctuary")
                .classification(HealthClassification.UNDERUTILIZED)
                .demandScore(BigDecimal.valueOf(20.0))
                .activityPressureScore(BigDecimal.valueOf(25.0))
                .localOpportunityScore(BigDecimal.valueOf(65.0))
                .build();

        when(healthService.getAllDestinationHealthScores(anyBoolean()))
                .thenReturn(List.of(highPressureHealth, underutilizedHealth));

        List<DynamicRedistributionPairDto> corridors = dynamicRedistributionService.calculateDynamicCorridors(null, false, 10);

        assertNotNull(corridors);
        assertFalse(corridors.isEmpty());
        DynamicRedistributionPairDto pair = corridors.get(0);
        assertEquals("dest-1", pair.getSourceDestinationId());
        assertEquals("dest-25", pair.getTargetDestinationId());
        assertTrue(pair.getPressureDifferential().doubleValue() > 0);
        assertTrue(pair.getSharedThemes().contains("Beach") || pair.getSharedThemes().contains("Coastal"));
        assertTrue(pair.getLimitationsDisclaimer().contains("Potential demand diversification opportunity"));
    }

    @Test
    @DisplayName("Ecosystem Gap Detection accurately flags GUIDE_HOST_DEFICIT and STAYS_DEFICIT")
    void testEcosystemGapDetection() {
        when(destinationRepository.findAll()).thenReturn(List.of(underutilizedDest));

        List<Object[]> emptyHostRows = Collections.singletonList(new Object[]{"dest-25", 0L});
        when(localHostRepository.countHostsByDestination()).thenReturn(emptyHostRows);

        List<Object[]> poiRows = Collections.singletonList(new Object[]{"dest-25", 3L});
        when(poiRepository.countPoisByDestination()).thenReturn(poiRows);

        List<Object[]> signalRows = Collections.singletonList(new Object[]{"dest-25", 15L});
        when(signalRepository.countSignalsByDestination()).thenReturn(signalRows);

        List<EcosystemGapDto> gaps = ecosystemGapDetectionService.detectAndSyncEcosystemGaps();

        assertNotNull(gaps);
        assertFalse(gaps.isEmpty());
        boolean hasGuideDeficit = gaps.stream().anyMatch(g -> g.getGapType() == EcosystemGapType.GUIDE_HOST_DEFICIT);
        assertTrue(hasGuideDeficit);
    }

    @Test
    @DisplayName("Government Action Lifecycle: Record, Update status to IN_PROGRESS and RESOLVED")
    void testGovernmentActionLifecycle() {
        when(destinationRepository.findById("dest-1")).thenReturn(Optional.of(highPressureDest));

        GovernmentActionRequest request = GovernmentActionRequest.builder()
                .destinationId("dest-1")
                .actionType(GovernmentActionType.CREATE_INITIATIVE)
                .title("Off-Peak Coastal Dispersal Campaign")
                .notes("Launch campaign on state tourism website.")
                .priority(GovernmentActionPriority.HIGH)
                .build();

        TourismGovernmentAction savedAction = TourismGovernmentAction.builder()
                .id("act-test-123")
                .destination(highPressureDest)
                .actionType(GovernmentActionType.CREATE_INITIATIVE)
                .title("Off-Peak Coastal Dispersal Campaign")
                .notes("Launch campaign on state tourism website.")
                .user(govUser)
                .status(GovernmentActionStatus.LOGGED)
                .priority(GovernmentActionPriority.HIGH)
                .createdAt(Instant.now())
                .build();

        when(actionRepository.save(any(TourismGovernmentAction.class))).thenReturn(savedAction);
        when(actionRepository.findById("act-test-123")).thenReturn(Optional.of(savedAction));

        GovernmentActionResponseDto logged = governmentIntelligenceService.recordAction(request, govUser);
        assertNotNull(logged);
        assertEquals(GovernmentActionStatus.LOGGED, logged.getStatus());
        assertEquals(GovernmentActionPriority.HIGH, logged.getPriority());

        // Update status to IN_PROGRESS
        GovernmentActionResponseDto inProgress = governmentIntelligenceService.updateActionStatus(
                "act-test-123",
                GovernmentActionStatus.IN_PROGRESS,
                "Working with local district tourism office.",
                govUser
        );
        assertNotNull(inProgress);
        assertEquals(GovernmentActionStatus.IN_PROGRESS, inProgress.getStatus());

        // Update status to RESOLVED
        GovernmentActionResponseDto resolved = governmentIntelligenceService.updateActionStatus(
                "act-test-123",
                GovernmentActionStatus.RESOLVED,
                "Campaign active and regional tourist flow monitored.",
                govUser
        );
        assertNotNull(resolved);
        assertEquals(GovernmentActionStatus.RESOLVED, resolved.getStatus());
        assertNotNull(resolved.getResolvedAt());
    }

    @Test
    @DisplayName("Government Alerts generate prioritized warnings for high pressure, supply bottlenecks, and underutilized assets")
    void testGovernmentAlertsGeneration() {
        DestinationHealthDto highPressureHealth = DestinationHealthDto.builder()
                .destinationId("dest-1")
                .destinationName("Goa Beach Hub")
                .stateName("Goa")
                .classification(HealthClassification.HIGH_PRESSURE)
                .demandScore(BigDecimal.valueOf(85.0))
                .activityPressureScore(BigDecimal.valueOf(82.0))
                .localOpportunityScore(BigDecimal.valueOf(70.0))
                .build();

        DestinationHealthDto underutilizedHealth = DestinationHealthDto.builder()
                .destinationId("dest-25")
                .destinationName("Gokarna Coastal Sanctuary")
                .stateName("Karnataka")
                .classification(HealthClassification.UNDERUTILIZED)
                .demandScore(BigDecimal.valueOf(20.0))
                .activityPressureScore(BigDecimal.valueOf(25.0))
                .localOpportunityScore(BigDecimal.valueOf(65.0))
                .build();

        when(healthService.getAllDestinationHealthScores(anyBoolean()))
                .thenReturn(List.of(highPressureHealth, underutilizedHealth));

        when(mockGapDetectionService.detectAndSyncEcosystemGaps())
                .thenReturn(List.of(
                        EcosystemGapDto.builder()
                                .destinationId("dest-1")
                                .destinationName("Goa Beach Hub")
                                .gapType(EcosystemGapType.GUIDE_HOST_DEFICIT)
                                .severity("HIGH")
                                .description("Severe shortage of registered local guides")
                                .suggestedIntervention("Conduct certified community guide drive")
                                .build()
                ));

        List<GovernmentAlertDto> alerts = governmentAlertService.getPrioritizedAlerts(false);
        assertNotNull(alerts);
        assertFalse(alerts.isEmpty());

        boolean hasCriticalOrHigh = alerts.stream()
                .anyMatch(a -> a.getPriority() == GovernmentActionPriority.CRITICAL || a.getPriority() == GovernmentActionPriority.HIGH);
        assertTrue(hasCriticalOrHigh);

        boolean hasPressure = alerts.stream().anyMatch(a -> a.getAlertCategory().contains("PRESSURE"));
        assertTrue(hasPressure);
    }

    @Test
    @DisplayName("Deterministic Fallback AI Provider outputs structured explainability tags and refuses unverified revenue/footfall")
    void testDeterministicFallbackAiGroundingAndRefusal() {
        com.yatrasetu.service.ai.DeterministicFallbackAiProvider aiProvider =
                new com.yatrasetu.service.ai.DeterministicFallbackAiProvider();

        // 1. Footfall query refusal
        Map<String, Object> ctx = new HashMap<>();
        ctx.put("role", "GOVERNMENT");
        String footfallResp = aiProvider.generateChatResponse("System context", "Give me the tourist footfall count for Goa today.", ctx);
        assertTrue(footfallResp.contains("[UNAVAILABLE_INFORMATION]"));
        assertTrue(footfallResp.contains("physical real-time crowd censuses are currently unavailable"));

        // 2. Official revenue refusal
        String revResp = aiProvider.generateChatResponse("System context", "What is India's official tourism revenue today?", ctx);
        assertTrue(revResp.contains("[UNAVAILABLE_INFORMATION]"));
        assertTrue(revResp.contains("Official municipal tourism revenue figures"));

        // 3. Structured explainability tags in normal Government synthesis
        Map<String, Object> govCtx = new HashMap<>();
        govCtx.put("role", "GOVERNMENT");
        govCtx.put("destinationName", "Goa");
        Map<String, Object> destMap = new HashMap<>();
        destMap.put("name", "Goa");
        destMap.put("state", "Goa");
        destMap.put("city", "Panaji");
        destMap.put("classification", "CROWDED");
        govCtx.put("destination", destMap);
        govCtx.put("demandScore", 85.0);
        govCtx.put("activityPressureScore", 82.0);
        govCtx.put("localOpportunityScore", 65.0);
        govCtx.put("governmentDestinationHealth", "HIGH_PRESSURE");
        govCtx.put("forecast7Day", 90.0);
        govCtx.put("forecast30Day", 92.0);
        govCtx.put("forecast90Day", 88.0);
        govCtx.put("pois", List.of(Map.of("name", "Basilica of Bom Jesus", "category", "Heritage")));
        govCtx.put("hotels", List.of(Map.of("name", "Heritage Resort", "type", "Resort")));
        govCtx.put("hosts", List.of(Map.of("name", "John Guide", "specialization", "Heritage")));
        govCtx.put("experiences", List.of(Map.of("title", "Old Goa Heritage Walk", "category", "Culture")));
        govCtx.put("transports", List.of(Map.of("mode", "Taxi", "description", "Airport prepaid taxi")));

        String govResp = aiProvider.generateChatResponse("Role: GOVERNMENT", "Provide a comprehensive policy summary for Goa.", govCtx);
        assertTrue(govResp.contains("[STRUCTURED_FACT]"));
        assertTrue(govResp.contains("[DERIVED_PLATFORM_METRIC]"));
        assertTrue(govResp.contains("[TRANSPARENT_BASELINE_FORECAST]"));
        assertTrue(govResp.contains("[AI_EXPLANATION]"));
    }
}
