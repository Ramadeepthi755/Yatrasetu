package com.yatrasetu.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "destination_transports")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DestinationTransport {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id", nullable = false)
    private Destination destination;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode", length = 50, nullable = false)
    private TransportMode mode;

    @Column(name = "name", length = 500, nullable = false)
    private String name;

    @Column(name = "distance_km", precision = 8, scale = 2)
    private BigDecimal distanceKm;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "road_condition", columnDefinition = "TEXT")
    private String roadCondition;

    @Enumerated(EnumType.STRING)
    @Column(name = "price_type", length = 50)
    @Builder.Default
    private PriceType priceType = PriceType.PRICE_UNAVAILABLE;

    @Column(name = "estimated_fare_inr", precision = 10, scale = 2)
    private BigDecimal estimatedFareInr;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", length = 50, nullable = false)
    @Builder.Default
    private SourceType sourceType = SourceType.DATASET;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
