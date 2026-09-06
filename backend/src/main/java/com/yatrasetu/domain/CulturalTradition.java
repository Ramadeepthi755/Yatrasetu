package com.yatrasetu.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "cultural_traditions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CulturalTradition {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "state_id", nullable = false)
    private State state;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id")
    private City city;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id")
    private Destination destination;

    @Column(name = "tradition_name", length = 255, nullable = false)
    private String traditionName;

    @Column(name = "category", length = 100, nullable = false)
    private String category;

    @Column(name = "craft_type", length = 150)
    private String craftType;

    @Column(name = "historical_origin", columnDefinition = "TEXT")
    private String historicalOrigin;

    @Column(name = "materials_used", columnDefinition = "TEXT")
    private String materialsUsed;

    @Column(name = "cultural_significance", columnDefinition = "TEXT")
    private String culturalSignificance;

    @Column(name = "is_gi_tagged", nullable = false)
    @Builder.Default
    private Boolean isGiTagged = false;

    @Column(name = "gi_tag_year", length = 10)
    private String giTagYear;

    @Column(name = "primary_producing_cluster", length = 255)
    private String primaryProducingCluster;

    @Column(name = "source_organization", length = 255)
    @Builder.Default
    private String sourceOrganization = "Ministry of Textiles / DC Handicrafts";

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", length = 50, nullable = false)
    @Builder.Default
    private SourceType sourceType = SourceType.OFFICIAL;

    @Column(name = "source_url", columnDefinition = "TEXT")
    private String sourceUrl;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "provenance", columnDefinition = "TEXT")
    private String provenance;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
