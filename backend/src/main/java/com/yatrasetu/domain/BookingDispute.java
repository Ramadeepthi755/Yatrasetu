package com.yatrasetu.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "booking_disputes")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDispute {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private ExperienceBooking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raised_by_user_id", nullable = false)
    private User raisedByUser;

    @Column(name = "reason", length = 100, nullable = false)
    private String reason;

    @Column(name = "details", columnDefinition = "TEXT", nullable = false)
    private String details;

    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    private String status = "OPEN"; // OPEN, UNDER_REVIEW, RESOLVED, REJECTED

    @Column(name = "evidence_summary", columnDefinition = "TEXT")
    private String evidenceSummary;

    @Column(name = "admin_decision", columnDefinition = "TEXT")
    private String adminDecision;

    @Column(name = "refund_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal refundAmount = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "resolved_at")
    private Instant resolvedAt;
}
