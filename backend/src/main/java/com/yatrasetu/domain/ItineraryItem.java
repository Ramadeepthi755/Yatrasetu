package com.yatrasetu.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;

@Entity
@Table(name = "itinerary_items")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryItem {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itinerary_id", nullable = false)
    @JsonIgnore
    private Itinerary itinerary;

    @Column(name = "item_type", length = 30, nullable = false)
    @Builder.Default
    private String itemType = "POI"; // POI, HOTEL, EXPERIENCE, LOCAL_HOST, MEAL, TRANSIT

    @Column(name = "item_id", length = 50)
    private String itemId;

    @Column(name = "poi_id", length = 50)
    private String poiId;

    @Column(name = "title", length = 200, nullable = false)
    private String title;

    @Column(name = "time_slot", length = 50)
    private String timeSlot; // MORNING, AFTERNOON, EVENING, NIGHT

    @Column(name = "duration_hours", precision = 3, scale = 1)
    private BigDecimal durationHours;

    @Column(name = "estimated_cost_inr", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal estimatedCostInr = BigDecimal.ZERO;

    @Column(name = "price_transparency", length = 30)
    @Builder.Default
    private String priceTransparency = "ESTIMATED"; // KNOWN, ESTIMATED, UNAVAILABLE

    @Column(name = "rationale", columnDefinition = "TEXT")
    private String rationale;

    @Column(name = "order_index", nullable = false)
    @Builder.Default
    private Integer orderIndex = 0;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata_json", columnDefinition = "jsonb")
    private String metadataJson;
}
