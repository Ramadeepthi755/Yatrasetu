package com.yatrasetu.domain;

import com.yatrasetu.domain.converter.StringListConverter;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "destination_pois")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DestinationPoi {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "poi_name", length = 200, nullable = false)
    private String poiName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id")
    private Destination destination;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id")
    private City city;

    @Column(name = "category", length = 50)
    @Builder.Default
    private String category = "Attraction";

    @Column(name = "latitude", precision = 10, scale = 7, nullable = false)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7, nullable = false)
    private BigDecimal longitude;

    @Convert(converter = StringListConverter.class)
    @Column(name = "tags", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @Column(name = "characteristics", columnDefinition = "TEXT")
    private String characteristics;

    @Column(name = "entry_fee_inr", precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal entryFeeInr = BigDecimal.ZERO;

    @Column(name = "typical_duration_hours", precision = 3, scale = 1)
    @Builder.Default
    private BigDecimal typicalDurationHours = BigDecimal.valueOf(2.0);

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
