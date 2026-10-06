package com.yatrasetu.domain.intelligence;

import com.yatrasetu.domain.Destination;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "tourism_demand_forecasts")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TourismDemandForecast {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Destination destination;

    @Column(name = "forecast_date", nullable = false)
    private LocalDate forecastDate;

    @Column(name = "horizon_days", nullable = false)
    private Integer horizonDays;

    @Column(name = "predicted_demand", precision = 6, scale = 2, nullable = false)
    private BigDecimal predictedDemand;

    @Column(name = "confidence_score", precision = 4, scale = 2, nullable = false)
    private BigDecimal confidenceScore;

    @Column(name = "model_type", length = 50, nullable = false)
    @Builder.Default
    private String modelType = "TRANSPARENT_BASELINE_EXPONENTIAL_SMOOTHING";

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", length = 50, nullable = false)
    @Builder.Default
    private IntelligenceSourceType sourceType = IntelligenceSourceType.ESTIMATED;

    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
