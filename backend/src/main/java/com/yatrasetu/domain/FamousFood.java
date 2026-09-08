package com.yatrasetu.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "famous_foods")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FamousFood {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id", nullable = false)
    private Destination destination;

    @Column(name = "dish_name", length = 255, nullable = false)
    private String dishName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_vegetarian")
    private Boolean isVegetarian;

    @Column(name = "cuisine_type", length = 100)
    private String cuisineType;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

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
