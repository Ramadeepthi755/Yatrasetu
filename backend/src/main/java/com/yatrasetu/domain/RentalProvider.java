package com.yatrasetu.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "rental_providers")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RentalProvider {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id", nullable = false)
    private Destination destination;

    @Column(name = "provider_name", length = 255, nullable = false)
    private String providerName;

    @Column(name = "vehicle_types", length = 255)
    private String vehicleTypes;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", length = 50, nullable = false)
    @Builder.Default
    private SourceType sourceType = SourceType.PARTNER_SUBMITTED;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "website", length = 255)
    private String website;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
