package com.yatrasetu.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "hotel_payment_transactions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelPaymentTransaction {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private HotelBooking booking;

    @Column(name = "provider", length = 50, nullable = false)
    @Builder.Default
    private String provider = "RAZORPAY";

    @Column(name = "provider_order_id", length = 100, nullable = false, unique = true)
    private String providerOrderId;

    @Column(name = "provider_payment_id", length = 100, unique = true)
    private String providerPaymentId;

    @Column(name = "provider_signature", length = 255)
    private String providerSignature;

    @Column(name = "amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "currency", length = 10, nullable = false)
    @Builder.Default
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50, nullable = false)
    @Builder.Default
    private HotelPaymentStatus status = HotelPaymentStatus.PENDING;

    @Column(name = "failure_code", length = 100)
    private String failureCode;

    @Column(name = "failure_description", columnDefinition = "TEXT")
    private String failureDescription;

    @Column(name = "idempotency_key", length = 100, unique = true)
    private String idempotencyKey;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
