package com.yatrasetu.web.dto.intelligence;

import com.yatrasetu.domain.intelligence.GovernmentActionPriority;
import com.yatrasetu.domain.intelligence.IntelligenceSourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GovernmentAlertDto {
    private String id;
    private String alertCategory; // CRITICAL_PRESSURE, SUPPLY_BOTTLENECK, UNDERUTILIZED_ASSET
    private GovernmentActionPriority priority; // CRITICAL, HIGH, MEDIUM, LOW
    private String destinationId;
    private String destinationName;
    private String stateName;
    private BigDecimal metricValue;
    private String metricLabel;
    private String title;
    private String explanation;
    private String recommendedAction;
    private IntelligenceSourceType sourceType;
    private Instant timestamp;
}
