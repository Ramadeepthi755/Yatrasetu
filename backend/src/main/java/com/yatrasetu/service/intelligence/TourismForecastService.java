package com.yatrasetu.service.intelligence;

import com.yatrasetu.domain.Destination;
import com.yatrasetu.domain.intelligence.IntelligenceSourceType;
import com.yatrasetu.domain.intelligence.TourismDemandForecast;
import com.yatrasetu.repository.DestinationRepository;
import com.yatrasetu.repository.intelligence.TourismDemandForecastRepository;
import com.yatrasetu.service.ai.GeminiAiProvider;
import com.yatrasetu.web.dto.intelligence.DemandForecastDto;
import com.yatrasetu.web.dto.intelligence.DemandTrendDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Month;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class TourismForecastService {

    private final DestinationRepository destinationRepository;
    private final TourismDemandService demandService;
    private final TourismDemandForecastRepository forecastRepository;
    private final GeminiAiProvider geminiAiProvider;

    private static final String MODEL_NAME = "TRANSPARENT_BASELINE_EXPONENTIAL_SMOOTHING";
    private static final String METHODOLOGY_DESC =
            "Deterministic baseline moving average scaled by horizon days and destination peak-season calendar alignment.";

    @Transactional
    public List<DemandForecastDto> getForecasts(String destinationId, boolean includeDemo) {
        Destination destination = destinationRepository.findById(destinationId).orElse(null);
        if (destination == null) return Collections.emptyList();

        List<Integer> horizons = List.of(7, 30, 90);
        List<DemandForecastDto> forecasts = new ArrayList<>();

        DemandTrendDto trend = demandService.getDestinationDemandTrend(destinationId, 30, includeDemo);
        long totalHistorical = trend != null ? trend.getCurrentDemand() + trend.getPreviousDemand() : 0;

        LocalDate today = LocalDate.now();

        for (Integer horizon : horizons) {
            LocalDate forecastTargetDate = today.plusDays(horizon);

            if (totalHistorical < 2 && !includeDemo) {
                forecasts.add(DemandForecastDto.builder()
                        .destinationId(destination.getId())
                        .destinationName(destination.getDestinationName())
                        .horizonDays(horizon)
                        .forecastDate(forecastTargetDate)
                        .predictedDemand(BigDecimal.ZERO)
                        .confidenceScore(BigDecimal.valueOf(0.10))
                        .modelType(MODEL_NAME)
                        .sourceType(IntelligenceSourceType.ESTIMATED)
                        .methodology(METHODOLOGY_DESC)
                        .explanation("Insufficient YatraSetu activity to generate a reliable forecast.")
                        .disclaimer("Zero numbers fabricated. Forecast requires verified platform activity signals.")
                        .isSufficientData(false)
                        .build());
                continue;
            }

            // Deterministic calculation
            double dailyAvg = (double) totalHistorical / 30.0;
            double seasonalMultiplier = getSeasonalityMultiplier(destination, forecastTargetDate.getMonth());
            double rawPredicted = dailyAvg * horizon * seasonalMultiplier;
            BigDecimal predictedDemand = BigDecimal.valueOf(Math.max(1.0, rawPredicted)).setScale(1, RoundingMode.HALF_UP);

            double conf = Math.min(0.85, 0.40 + (totalHistorical * 0.04));
            BigDecimal confidenceScore = BigDecimal.valueOf(conf).setScale(2, RoundingMode.HALF_UP);

            String explanation = String.format(
                    "Baseline forecast projects approximately %s platform demand signals over the next %d days based on %d observed signals and %s seasonal weighting.",
                    predictedDemand, horizon, totalHistorical, seasonalMultiplier > 1.0 ? "favorable peak" : "standard"
            );

            // Save forecast record to database
            TourismDemandForecast record = forecastRepository
                    .findByDestinationIdAndForecastDateAndHorizonDays(destinationId, today, horizon)
                    .orElse(TourismDemandForecast.builder()
                            .id("fc-" + destinationId + "-" + horizon + "-" + today)
                            .destination(destination)
                            .forecastDate(today)
                            .horizonDays(horizon)
                            .build());

            record.setPredictedDemand(predictedDemand);
            record.setConfidenceScore(confidenceScore);
            record.setModelType(MODEL_NAME);
            record.setSourceType(includeDemo ? IntelligenceSourceType.DEMO : IntelligenceSourceType.ESTIMATED);
            record.setExplanation(explanation);
            forecastRepository.save(record);

            forecasts.add(DemandForecastDto.builder()
                    .destinationId(destination.getId())
                    .destinationName(destination.getDestinationName())
                    .horizonDays(horizon)
                    .forecastDate(forecastTargetDate)
                    .predictedDemand(predictedDemand)
                    .confidenceScore(confidenceScore)
                    .modelType(MODEL_NAME)
                    .sourceType(includeDemo ? IntelligenceSourceType.DEMO : IntelligenceSourceType.ESTIMATED)
                    .methodology(METHODOLOGY_DESC)
                    .explanation(explanation)
                    .disclaimer("Transparent baseline forecast derived strictly from platform activity. Not an official government prediction.")
                    .isSufficientData(true)
                    .build());
        }

        return forecasts;
    }

    private double getSeasonalityMultiplier(Destination destination, Month targetMonth) {
        String monthName = targetMonth.name().toLowerCase();
        String peak = destination.getPeakSeason() != null ? destination.getPeakSeason().toLowerCase() : "";
        String avoid = destination.getAvoidSeasons() != null ? destination.getAvoidSeasons().toLowerCase() : "";

        if (peak.contains(monthName.substring(0, 3))) {
            return 1.30;
        } else if (avoid.contains(monthName.substring(0, 3))) {
            return 0.70;
        }
        return 1.00;
    }
}
