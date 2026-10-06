package com.yatrasetu.domain.intelligence;

import com.yatrasetu.domain.Destination;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "tourism_redistribution_recommendations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TourismRedistributionRecommendation {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_destination_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Destination sourceDestination;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_destination_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Destination targetDestination;

    @Column(name = "compatibility_type", length = 50, nullable = false)
    private String compatibilityType;

    @Column(name = "reason", columnDefinition = "TEXT", nullable = false)
    private String reason;

    @Column(name = "expected_potential_benefit", columnDefinition = "TEXT", nullable = false)
    private String expectedPotentialBenefit;

    @Column(name = "confidence_score", precision = 4, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal confidenceScore = BigDecimal.valueOf(0.80);

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", length = 20, nullable = false)
    @Builder.Default
    private RecommendationPriority priority = RecommendationPriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    private RecommendationStatus status = RecommendationStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", length = 50, nullable = false)
    @Builder.Default
    private IntelligenceSourceType sourceType = IntelligenceSourceType.DERIVED;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
