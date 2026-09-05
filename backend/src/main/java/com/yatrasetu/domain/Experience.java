package com.yatrasetu.domain;

import com.yatrasetu.domain.converter.StringListConverter;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "experiences")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Experience {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id", nullable = false)
    private LocalHost host;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id")
    private Destination destination;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id")
    private City city;

    @Column(name = "title", length = 200, nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "category", length = 50, nullable = false)
    private String category; // Food Walk, Heritage Tour, Craft Workshop, Adventure, Photography, Spiritual Walk

    @Column(name = "duration_hours", precision = 3, scale = 1, nullable = false)
    @Builder.Default
    private BigDecimal durationHours = BigDecimal.valueOf(3.0);

    @Column(name = "price_per_person", precision = 10, scale = 2, nullable = false)
    private BigDecimal pricePerPerson;

    @Column(name = "max_group_size")
    @Builder.Default
    private Integer maxGroupSize = 8;

    @Convert(converter = StringListConverter.class)
    @Column(name = "included_items", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> includedItems = new ArrayList<>();

    @Column(name = "requirements", columnDefinition = "TEXT")
    private String requirements;

    @Convert(converter = StringListConverter.class)
    @Column(name = "languages", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> languages = new ArrayList<>();

    @Column(name = "cover_image_url", columnDefinition = "TEXT")
    private String coverImageUrl;

    @Column(name = "is_approved")
    @Builder.Default
    private Boolean isApproved = true;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_demo_data")
    @Builder.Default
    private Boolean isDemoData = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
