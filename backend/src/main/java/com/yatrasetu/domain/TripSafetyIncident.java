package com.yatrasetu.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "trip_safety_incidents")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripSafetyIncident {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private ExperienceBooking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "incident_type", length = 50, nullable = false)
    private String incidentType; // SOS, MISSED_CHECKIN, ROUTE_DEVIATION, REPORTED_ISSUE

    @Column(name = "severity", length = 30, nullable = false)
    @Builder.Default
    private String severity = "HIGH"; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    private String status = "REPORTED"; // REPORTED, ACKNOWLEDGED, RESOLVED

    @Column(name = "details", columnDefinition = "TEXT", nullable = false)
    private String details;

    @Column(name = "emergency_contact_notified")
    @Builder.Default
    private Boolean emergencyContactNotified = false;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "resolved_at")
    private Instant resolvedAt;
}
