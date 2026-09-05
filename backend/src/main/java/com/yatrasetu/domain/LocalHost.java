package com.yatrasetu.domain;

import com.yatrasetu.domain.converter.StringListConverter;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "local_hosts")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocalHost {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "name", length = 150, nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "state_id", nullable = false)
    private State state;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id")
    private Destination destination;

    @Convert(converter = StringListConverter.class)
    @Column(name = "languages", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> languages = new ArrayList<>();

    @Convert(converter = StringListConverter.class)
    @Column(name = "skills", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> skills = new ArrayList<>();

    @Convert(converter = StringListConverter.class)
    @Column(name = "interests", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> interests = new ArrayList<>();

    @Column(name = "role_title", length = 100, nullable = false)
    @Builder.Default
    private String roleTitle = "Local Guide";

    @Column(name = "price_per_hour", precision = 10, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal pricePerHour = BigDecimal.valueOf(300.0);

    @Column(name = "rating", precision = 3, scale = 1)
    @Builder.Default
    private BigDecimal rating = BigDecimal.valueOf(4.5);

    @Column(name = "experience_count")
    @Builder.Default
    private Integer experienceCount = 0;

    @Column(name = "availability", length = 50)
    @Builder.Default
    private String availability = "Flexible";

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "is_demo_data")
    @Builder.Default
    private Boolean isDemoData = false;

    @Column(name = "about", columnDefinition = "TEXT")
    private String about;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
