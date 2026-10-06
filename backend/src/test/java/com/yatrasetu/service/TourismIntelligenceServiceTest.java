package com.yatrasetu.service;

import com.yatrasetu.domain.Destination;
import com.yatrasetu.domain.intelligence.*;
import com.yatrasetu.repository.DestinationPoiRepository;
import com.yatrasetu.repository.DestinationRepository;
import com.yatrasetu.repository.intelligence.TourismDemandForecastRepository;
import com.yatrasetu.repository.intelligence.TourismDemandSignalRepository;
import com.yatrasetu.repository.intelligence.TourismDestinationScoreRepository;
import com.yatrasetu.repository.intelligence.TourismRedistributionRecommendationRepository;
import com.yatrasetu.service.ai.GeminiAiProvider;
import com.yatrasetu.service.intelligence.*;
import com.yatrasetu.web.dto.intelligence.DemandForecastDto;
import com.yatrasetu.web.dto.intelligence.DemandTrendDto;
import com.yatrasetu.web.dto.intelligence.DestinationHealthDto;
import com.yatrasetu.web.dto.intelligence.LocalOpportunityDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TourismIntelligenceServiceTest {

    @Mock
    private TourismDemandSignalRepository signalRepository;
    @Mock
    private DestinationRepository destinationRepository;
    @Mock
    private DestinationPoiRepository poiRepository;
    @Mock
    private TourismDemandForecastRepository forecastRepository;
    @Mock
    private TourismDestinationScoreRepository scoreRepository;
    @Mock
    private TourismRedistributionRecommendationRepository redistributionRepository;
    @Mock
    private GeminiAiProvider geminiAiProvider;

    private TourismDemandService demandService;
    private LocalOpportunityService opportunityService;
    private DestinationHealthService healthService;
    private TourismForecastService forecastService;

    private Destination mockDestGoa;

    @BeforeEach
    void setup() {
        demandService = new TourismDemandService(signalRepository, destinationRepository);
        // opportunityService will be tested with mock repos or instantiated
        opportunityService = mock(LocalOpportunityService.class);
        healthService = new DestinationHealthService(destinationRepository, poiRepository, demandService, opportunityService, scoreRepository, redistributionRepository);
        forecastService = new TourismForecastService(destinationRepository, demandService, forecastRepository, geminiAiProvider);

        mockDestGoa = Destination.builder()
                .id("dest-1")
                .destinationName("Goa")
                .accessibility("Easy")
                .peakSeason("December-January")
                .safetyRating(BigDecimal.valueOf(8.5))
                .build();
    }

    @Test
    void testDemandSignalRecording_IdempotencyPreventsDuplicates() {
        when(signalRepository.existsByIdempotencyKey("idemp-test-123")).thenReturn(true);

        demandService.recordSignal("dest-1", DemandSignalType.TRIP_PLAN, 1, IntelligenceSourceType.OBSERVED, "idemp-test-123", null);

        verify(signalRepository, never()).save(any(TourismDemandSignal.class));
    }

    @Test
    void testDemandSignalRecording_SavesNewSignal() {
        when(signalRepository.existsByIdempotencyKey("idemp-new-456")).thenReturn(false);
        when(destinationRepository.findById("dest-1")).thenReturn(Optional.of(mockDestGoa));

        demandService.recordSignal("dest-1", DemandSignalType.TRIP_PLAN, 1, IntelligenceSourceType.OBSERVED, "idemp-new-456", "{\"note\":\"test\"}");

        verify(signalRepository, times(1)).save(argThat(sig ->
                "dest-1".equals(sig.getDestination().getId()) &&
                DemandSignalType.TRIP_PLAN == sig.getSignalType() &&
                IntelligenceSourceType.OBSERVED == sig.getSourceType() &&
                "idemp-new-456".equals(sig.getIdempotencyKey())
        ));
    }

    @Test
    void testForecastService_InsufficientDataReturnsExplanationWithoutFabrication() {
        when(destinationRepository.findById("dest-1")).thenReturn(Optional.of(mockDestGoa));
        when(signalRepository.aggregateTimeSeries(any(LocalDate.class), eq("dest-1"), eq(false)))
                .thenReturn(Collections.emptyList());

        List<DemandForecastDto> forecasts = forecastService.getForecasts("dest-1", false);

        assertNotNull(forecasts);
        assertEquals(3, forecasts.size()); // 7, 30, 90 days
        for (DemandForecastDto f : forecasts) {
            assertFalse(f.isSufficientData());
            assertEquals(BigDecimal.ZERO, f.getPredictedDemand());
            assertTrue(f.getExplanation().contains("Insufficient YatraSetu activity"));
        }
    }

    @Test
    void testDestinationHealthService_HighPressureClassification() {
        when(destinationRepository.findById("dest-1")).thenReturn(Optional.of(mockDestGoa));
        when(poiRepository.findByDestinationId("dest-1")).thenReturn(Collections.emptyList()); // low capacity
        when(opportunityService.calculateLocalOpportunity("dest-1")).thenReturn(LocalOpportunityDto.builder()
                .opportunityScore(BigDecimal.valueOf(70.0))
                .build());

        // Mock high demand signals
        List<Object[]> highSignals = List.of(
                new Object[]{java.sql.Date.valueOf(LocalDate.now().minusDays(2)), 25L},
                new Object[]{java.sql.Date.valueOf(LocalDate.now().minusDays(5)), 30L}
        );
        when(signalRepository.aggregateTimeSeries(any(LocalDate.class), eq("dest-1"), eq(false)))
                .thenReturn(highSignals);
        when(scoreRepository.findByDestinationIdAndScoreDate(eq("dest-1"), any(LocalDate.class)))
                .thenReturn(Optional.empty());

        DestinationHealthDto health = healthService.calculateHealth("dest-1", false);

        assertNotNull(health);
        assertNotNull(health.getActivityPressureScore());
        assertTrue(health.getActivityPressureScore().doubleValue() > 0);
        assertNotNull(health.getProxyDisclaimer());
        assertTrue(health.getProxyDisclaimer().contains("derived proxies"));
    }
}
