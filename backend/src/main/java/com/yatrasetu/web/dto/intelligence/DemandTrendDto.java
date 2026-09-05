package com.yatrasetu.web.dto.intelligence;

import com.yatrasetu.domain.intelligence.IntelligenceSourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandTrendDto {
    private String destinationId;
    private String destinationName;
    private String stateName;
    private long currentDemand;
    private long previousDemand;
    private BigDecimal growthPercentage;
    private BigDecimal demandScore;
    private String trend; // RISING, STABLE, DECLINING
    private IntelligenceSourceType sourceType;
    private BigDecimal confidence;
    private String explanation;
    private List<TimeSeriesPoint> timeSeries;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSeriesPoint {
        private LocalDate date;
        private long value;
    }
}
