package com.yatrasetu.service.intelligence;

import com.yatrasetu.domain.Destination;
import com.yatrasetu.domain.intelligence.DemandSignalType;
import com.yatrasetu.domain.intelligence.IntelligenceSourceType;
import com.yatrasetu.domain.intelligence.TourismDemandSignal;
import com.yatrasetu.repository.DestinationRepository;
import com.yatrasetu.repository.intelligence.TourismDemandSignalRepository;
import com.yatrasetu.web.dto.intelligence.DemandTrendDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TourismDemandService {

    private final TourismDemandSignalRepository signalRepository;
    private final DestinationRepository destinationRepository;

    /**
     * Record a real platform activity signal with idempotency.
     * Prevents duplicate counting if an action is retried.
     */
    @Transactional
    public void recordSignal(
            String destinationId,
            DemandSignalType signalType,
            int value,
            IntelligenceSourceType sourceType,
            String idempotencyKey,
            String metadataJson
    ) {
        if (destinationId == null) return;
        if (idempotencyKey != null && signalRepository.existsByIdempotencyKey(idempotencyKey)) {
            log.debug("Demand signal idempotency key {} already processed. Skipping duplicate.", idempotencyKey);
            return;
        }

        Destination destination = destinationRepository.findById(destinationId).orElse(null);
        if (destination == null) {
            log.warn("Cannot record demand signal for non-existent destination {}", destinationId);
            return;
        }

        TourismDemandSignal signal = TourismDemandSignal.builder()
                .id("sig-" + UUID.randomUUID())
                .destination(destination)
                .signalDate(LocalDate.now())
                .signalType(signalType)
                .signalValue(Math.max(1, value))
                .sourceType(sourceType != null ? sourceType : IntelligenceSourceType.OBSERVED)
                .confidenceScore(sourceType == IntelligenceSourceType.DEMO ? BigDecimal.valueOf(0.75) : BigDecimal.valueOf(1.00))
                .idempotencyKey(idempotencyKey)
                .metadataJson(metadataJson)
                .build();

        signalRepository.save(signal);
        log.info("Recorded {} demand signal for destination {} (idemp: {})", signalType, destinationId, idempotencyKey);
    }

    /**
     * Get demand trends for all destinations over the specified window (default 14-day comparison).
     */
    @Transactional(readOnly = true)
    public List<DemandTrendDto> getDemandTrends(int windowDays, boolean includeDemo) {
        LocalDate now = LocalDate.now();
        LocalDate currentStart = now.minusDays(windowDays);
        LocalDate prevStart = currentStart.minusDays(windowDays);

        List<Object[]> currentRows = signalRepository.sumSignalsByDestinationBetween(currentStart, now, includeDemo);
        List<Object[]> prevRows = signalRepository.sumSignalsByDestinationBetween(prevStart, currentStart.minusDays(1), includeDemo);

        Map<String, Long> currentMap = new HashMap<>();
        for (Object[] row : currentRows) {
            currentMap.put((String) row[0], ((Number) row[1]).longValue());
        }

        Map<String, Long> prevMap = new HashMap<>();
        for (Object[] row : prevRows) {
            prevMap.put((String) row[0], ((Number) row[1]).longValue());
        }

        long maxDemand = currentMap.values().stream().max(Long::compare).orElse(1L);
        if (maxDemand < 1) maxDemand = 1;

        List<Destination> destinations = destinationRepository.findAll();
        List<DemandTrendDto> results = new ArrayList<>();

        for (Destination dest : destinations) {
            long cur = currentMap.getOrDefault(dest.getId(), 0L);
            long prev = prevMap.getOrDefault(dest.getId(), 0L);

            // Normalized demand score 0-100
            double rawScore = ((double) cur / (double) maxDemand) * 100.0;
            BigDecimal demandScore = BigDecimal.valueOf(Math.min(100.0, rawScore)).setScale(1, RoundingMode.HALF_UP);

            // Growth percentage
            BigDecimal growthPct;
            if (prev == 0) {
                growthPct = cur > 0 ? BigDecimal.valueOf(100.0) : BigDecimal.ZERO;
            } else {
                double g = ((double) (cur - prev) / (double) prev) * 100.0;
                growthPct = BigDecimal.valueOf(g).setScale(1, RoundingMode.HALF_UP);
            }

            // Trend classification
            String trend = "STABLE";
            if (growthPct.compareTo(BigDecimal.valueOf(15.0)) >= 0 && cur >= 2) {
                trend = "RISING";
            } else if (growthPct.compareTo(BigDecimal.valueOf(-15.0)) <= 0 && prev >= 2) {
                trend = "DECLINING";
            }

            // Source Type and explanation
            IntelligenceSourceType st = includeDemo ? IntelligenceSourceType.DEMO : IntelligenceSourceType.DERIVED;
            String explanation = generateTrendExplanation(dest.getDestinationName(), cur, prev, trend);

            results.add(DemandTrendDto.builder()
                    .destinationId(dest.getId())
                    .destinationName(dest.getDestinationName())
                    .stateName(dest.getState() != null ? dest.getState().getStateName() : "India")
                    .currentDemand(cur)
                    .previousDemand(prev)
                    .growthPercentage(growthPct)
                    .demandScore(demandScore)
                    .trend(trend)
                    .sourceType(st)
                    .confidence(cur > 0 ? BigDecimal.valueOf(0.85) : BigDecimal.valueOf(0.50))
                    .explanation(explanation)
                    .build());
        }

        results.sort((a, b) -> b.getDemandScore().compareTo(a.getDemandScore()));
        return results;
    }

    /**
     * Get demand trend details for a specific destination with time-series points.
     */
    @Transactional(readOnly = true)
    public DemandTrendDto getDestinationDemandTrend(String destinationId, int historyDays, boolean includeDemo) {
        Destination dest = destinationRepository.findById(destinationId).orElse(null);
        if (dest == null) return null;

        LocalDate startDate = LocalDate.now().minusDays(historyDays);
        List<Object[]> tsRows = signalRepository.aggregateTimeSeries(startDate, destinationId, includeDemo);

        List<DemandTrendDto.TimeSeriesPoint> timeSeries = new ArrayList<>();
        long totalCur = 0;
        for (Object[] row : tsRows) {
            LocalDate d = (row[0] instanceof java.sql.Date) ? ((java.sql.Date) row[0]).toLocalDate() : (LocalDate) row[0];
            long val = ((Number) row[1]).longValue();
            timeSeries.add(new DemandTrendDto.TimeSeriesPoint(d, val));
            totalCur += val;
        }

        // Window comparison
        int halfWindow = Math.max(1, historyDays / 2);
        LocalDate midDate = LocalDate.now().minusDays(halfWindow);

        long recentHalf = timeSeries.stream()
                .filter(p -> !p.getDate().isBefore(midDate))
                .mapToLong(DemandTrendDto.TimeSeriesPoint::getValue)
                .sum();
        long priorHalf = timeSeries.stream()
                .filter(p -> p.getDate().isBefore(midDate))
                .mapToLong(DemandTrendDto.TimeSeriesPoint::getValue)
                .sum();

        BigDecimal growthPct = priorHalf == 0
                ? (recentHalf > 0 ? BigDecimal.valueOf(100.0) : BigDecimal.ZERO)
                : BigDecimal.valueOf(((double) (recentHalf - priorHalf) / priorHalf) * 100.0).setScale(1, RoundingMode.HALF_UP);

        String trend = "STABLE";
        if (growthPct.compareTo(BigDecimal.valueOf(15.0)) >= 0 && recentHalf >= 2) trend = "RISING";
        else if (growthPct.compareTo(BigDecimal.valueOf(-15.0)) <= 0 && priorHalf >= 2) trend = "DECLINING";

        BigDecimal demandScore = BigDecimal.valueOf(Math.min(100.0, totalCur * 5.0)).setScale(1, RoundingMode.HALF_UP);

        return DemandTrendDto.builder()
                .destinationId(dest.getId())
                .destinationName(dest.getDestinationName())
                .stateName(dest.getState() != null ? dest.getState().getStateName() : "India")
                .currentDemand(recentHalf)
                .previousDemand(priorHalf)
                .growthPercentage(growthPct)
                .demandScore(demandScore)
                .trend(trend)
                .sourceType(includeDemo ? IntelligenceSourceType.DEMO : IntelligenceSourceType.DERIVED)
                .confidence(totalCur > 0 ? BigDecimal.valueOf(0.85) : BigDecimal.valueOf(0.40))
                .explanation(generateTrendExplanation(dest.getDestinationName(), recentHalf, priorHalf, trend))
                .timeSeries(timeSeries)
                .build();
    }

    /**
     * Get aggregate time series for the macro ecosystem over past 7, 30, or 90 days.
     */
    @Transactional(readOnly = true)
    public List<DemandTrendDto.TimeSeriesPoint> getMacroTimeSeries(int days, boolean includeDemo) {
        LocalDate startDate = LocalDate.now().minusDays(days);
        List<Object[]> rows = signalRepository.aggregateTimeSeries(startDate, null, includeDemo);

        List<DemandTrendDto.TimeSeriesPoint> result = new ArrayList<>();
        for (Object[] row : rows) {
            LocalDate d = (row[0] instanceof java.sql.Date) ? ((java.sql.Date) row[0]).toLocalDate() : (LocalDate) row[0];
            long val = ((Number) row[1]).longValue();
            result.add(new DemandTrendDto.TimeSeriesPoint(d, val));
        }
        return result;
    }

    private String generateTrendExplanation(String destName, long cur, long prev, String trend) {
        if (cur == 0 && prev == 0) {
            return "No recent traveler activity signals recorded on YatraSetu for " + destName + ".";
        }
        return switch (trend) {
            case "RISING" -> String.format("Observed traveler activity for %s increased from %d to %d signals across recent planning cycles.", destName, prev, cur);
            case "DECLINING" -> String.format("Observed traveler planning activity for %s decreased from %d to %d signals.", destName, prev, cur);
            default -> String.format("Traveler activity for %s has remained stable (%d recent signals).", destName, cur);
        };
    }
}
