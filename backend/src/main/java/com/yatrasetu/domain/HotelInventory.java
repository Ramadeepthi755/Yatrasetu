package com.yatrasetu.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "hotel_inventory")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelInventory {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_type_id", nullable = false)
    private HotelRoomType roomType;

    @Column(name = "inventory_date")
    private LocalDate inventoryDate;

    @Column(name = "total_units", nullable = false)
    @Builder.Default
    private Integer totalUnits = 1;

    @Column(name = "blocked_units", nullable = false)
    @Builder.Default
    private Integer blockedUnits = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", length = 50, nullable = false)
    @Builder.Default
    private SourceType sourceType = SourceType.PARTNER_SUBMITTED;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
