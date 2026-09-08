package com.yatrasetu.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "states")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class State {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "state_name", length = 100, nullable = false, unique = true)
    private String stateName;

    @Column(name = "region", length = 50, nullable = false)
    private String region;

    @Column(name = "capital_city", length = 100)
    private String capitalCity;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "banner_image_url", columnDefinition = "TEXT")
    private String bannerImageUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @OneToMany(mappedBy = "state", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<City> cities = new ArrayList<>();

    @OneToMany(mappedBy = "state", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Destination> destinations = new ArrayList<>();
}
