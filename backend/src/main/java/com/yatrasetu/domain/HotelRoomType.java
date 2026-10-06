package com.yatrasetu.domain;

import com.yatrasetu.domain.converter.StringListConverter;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hotel_room_types")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelRoomType {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @Column(name = "room_type_name", length = 150, nullable = false)
    private String roomTypeName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "max_occupancy", nullable = false)
    @Builder.Default
    private Integer maxOccupancy = 2;

    @Column(name = "bed_configuration", length = 100)
    private String bedConfiguration;

    @Column(name = "room_size_sqft")
    private Integer roomSizeSqft;

    @Convert(converter = StringListConverter.class)
    @Column(name = "amenities", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> amenities = new ArrayList<>();

    @Column(name = "is_accessible", nullable = false)
    @Builder.Default
    private Boolean isAccessible = false;

    @Column(name = "base_inventory_units", nullable = false)
    @Builder.Default
    private Integer baseInventoryUnits = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", length = 50, nullable = false)
    @Builder.Default
    private SourceType sourceType = SourceType.PARTNER_SUBMITTED;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_demo_data", nullable = false)
    @Builder.Default
    private Boolean isDemoData = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
