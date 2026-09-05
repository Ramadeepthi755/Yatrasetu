package com.yatrasetu.domain.intelligence;

import com.yatrasetu.domain.Destination;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "tourism_destination_scores")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TourismDestinationScore {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Destination destination;

    @Column(name = "score_date", nullable = false)
    private LocalDate scoreDate;

    @Column(name = "demand_score", precision = 5, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal demandScore = BigDecimal.ZERO;

    @Column(name = "activity_pressure_score", precision = 5, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal activityPressureScore = BigDecimal.ZERO;

    @Column(name = "local_opportunity_score", precision = 5, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal localOpportunityScore = BigDecimal.ZERO;

    @Column(name = "accessibility_score", precision = 5, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal accessibilityScore = BigDecimal.ZERO;

    @Column(name = "sustainability_proxy_score", precision = 5, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal sustainabilityProxyScore = BigDecimal.ZERO;

    @Column(name = "overall_score", precision = 5, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal overallScore = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "classification", length = 50, nullable = false)
    @Builder.Default
    private HealthClassification classification = HealthClassification.INSUFFICIENT_DATA;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", length = 50, nullable = false)
    @Builder.Default
    private IntelligenceSourceType sourceType = IntelligenceSourceType.DERIVED;

    @Column(name = "confidence_score", precision = 4, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal confidenceScore = BigDecimal.valueOf(0.80);

    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
