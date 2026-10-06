package com.yatrasetu.web.dto.intelligence;

import com.yatrasetu.domain.intelligence.IntelligenceSourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandForecastDto {
    private String destinationId;
    private String destinationName;
    private Integer horizonDays;
    private LocalDate forecastDate;
    private BigDecimal predictedDemand;
    private BigDecimal confidenceScore;
    private String modelType; // TRANSPARENT_BASELINE_EXPONENTIAL_SMOOTHING
    private IntelligenceSourceType sourceType; // ESTIMATED
    private String methodology;
    private String explanation;
    private String disclaimer;
    private boolean isSufficientData;
}
