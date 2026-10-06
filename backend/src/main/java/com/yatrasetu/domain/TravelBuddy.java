package com.yatrasetu.domain;

import com.yatrasetu.domain.converter.StringListConverter;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "travel_buddies")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelBuddy {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "destination_city", length = 100, nullable = false)
    private String destinationCity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id")
    private Destination destination;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "state_id")
    private State state;

    @Column(name = "travel_date", nullable = false)
    private LocalDate travelDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "flexible_dates")
    @Builder.Default
    private boolean flexibleDates = true;

    @Column(name = "budget_inr", precision = 10, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal budgetInr = BigDecimal.valueOf(5000.0);

    @Convert(converter = StringListConverter.class)
    @Column(name = "interests", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> interests = new ArrayList<>();

    @Convert(converter = StringListConverter.class)
    @Column(name = "languages", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> languages = new ArrayList<>();

    @Column(name = "group_size")
    @Builder.Default
    private Integer groupSize = 1;

    @Column(name = "travel_style", length = 50, nullable = false)
    @Builder.Default
    private String travelStyle = "Explorer";

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_demo_data")
    @Builder.Default
    private boolean demoData = false;

    @Column(name = "is_active")
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
