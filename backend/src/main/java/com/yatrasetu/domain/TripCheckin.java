package com.yatrasetu.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "trip_checkins")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripCheckin {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private ExperienceBooking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "checkpoint_name", length = 100, nullable = false)
    private String checkpointName;

    @Column(name = "checkpoint_type", length = 30, nullable = false)
    private String checkpointType; // START, MIDPOINT, CHECKPOINT, COMPLETION

    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    private String status = "PENDING"; // PENDING, COMPLETED, MISSED, ESCALATED

    @Column(name = "scheduled_time")
    private Instant scheduledTime;

    @Column(name = "checked_in_at")
    private Instant checkedInAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
