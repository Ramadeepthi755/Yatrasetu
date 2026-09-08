package com.yatrasetu.domain.intelligence;

import com.yatrasetu.domain.Destination;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "tourism_demand_signals")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TourismDemandSignal {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Destination destination;

    @Column(name = "signal_date", nullable = false)
    private LocalDate signalDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "signal_type", length = 50, nullable = false)
    private DemandSignalType signalType;

    @Column(name = "signal_value", nullable = false)
    @Builder.Default
    private Integer signalValue = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", length = 50, nullable = false)
    @Builder.Default
    private IntelligenceSourceType sourceType = IntelligenceSourceType.OBSERVED;

    @Column(name = "confidence_score", precision = 4, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal confidenceScore = BigDecimal.valueOf(1.00);

    @Column(name = "idempotency_key", length = 100)
    private String idempotencyKey;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata_json", columnDefinition = "jsonb")
    private String metadataJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
