package com.yatrasetu.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "experience_bookings")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExperienceBooking {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "booking_reference", length = 50, unique = true, nullable = false)
    private String bookingReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tourist_user_id", nullable = false)
    private User tourist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id", nullable = false)
    private LocalHost host;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experience_id")
    private Experience experience;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id")
    private Destination destination;

    @Column(name = "booking_type", length = 30, nullable = false)
    @Builder.Default
    private String bookingType = "PREDEFINED"; // PREDEFINED, CUSTOMIZED

    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @Column(name = "start_time", length = 20)
    @Builder.Default
    private String startTime = "09:00 AM";

    @Column(name = "guest_count", nullable = false)
    @Builder.Default
    private Integer guestCount = 1;

    @Column(name = "total_amount", precision = 10, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "currency", length = 10)
    @Builder.Default
    private String currency = "INR";

    @Column(name = "status", length = 40, nullable = false)
    @Builder.Default
    private String status = "REQUESTED";
    // REQUESTED, ACCEPTED, PAYMENT_PENDING, CONFIRMED, TRIP_STARTED, IN_PROGRESS, COMPLETION_PENDING, COMPLETED, REVIEWED, REJECTED, CANCELLED, DISPUTED, PAYMENT_FAILED, EXPIRED

    @Column(name = "custom_requirements", columnDefinition = "TEXT")
    private String customRequirements;

    @Column(name = "custom_itinerary", columnDefinition = "TEXT")
    private String customItinerary;

    @Column(name = "payment_status", length = 30)
    @Builder.Default
    private String paymentStatus = "PENDING"; // PENDING, AUTHORIZED, PAID, FAILED, REFUNDED

    @Column(name = "payment_method", length = 30)
    @Builder.Default
    private String paymentMethod = "ONLINE"; // ONLINE, CASH

    @Column(name = "cash_milestone1_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal cashMilestone1Amount = BigDecimal.ZERO;

    @Column(name = "cash_milestone1_paid")
    @Builder.Default
    private Boolean cashMilestone1Paid = false;

    @Column(name = "cash_milestone1_paid_at")
    private Instant cashMilestone1PaidAt;

    @Column(name = "cash_milestone2_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal cashMilestone2Amount = BigDecimal.ZERO;

    @Column(name = "cash_milestone2_paid")
    @Builder.Default
    private Boolean cashMilestone2Paid = false;

    @Column(name = "cash_milestone2_paid_at")
    private Instant cashMilestone2PaidAt;

    @Column(name = "razorpay_order_id", length = 100)
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id", length = 100)
    private String razorpayPaymentId;

    @Column(name = "razorpay_signature", length = 255)
    private String razorpaySignature;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TripCheckin> checkins = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
