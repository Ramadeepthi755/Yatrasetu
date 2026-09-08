package com.yatrasetu.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "experience_supporting_providers")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExperienceSupportingProvider {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experience_id", nullable = false)
    private Experience experience;

    @Column(name = "provider_id", length = 50, nullable = false)
    private String providerId;

    @Column(name = "provider_name", length = 150, nullable = false)
    private String providerName;

    @Column(name = "provider_type", length = 50, nullable = false)
    private String providerType; // ARTISAN, HOTEL, LOCAL_BUSINESS, GUIDE, RESTAURANT

    @Column(name = "role_description", length = 255, nullable = false)
    private String roleDescription;

    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    private String status = "ACCEPTED"; // INVITED, ACCEPTED, DECLINED

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
