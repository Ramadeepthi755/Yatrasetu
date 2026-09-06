package com.yatrasetu.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "hotel_bookings")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelBooking {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "booking_reference", length = 50, nullable = false, unique = true)
    private String bookingReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "traveler_id", nullable = false)
    private User traveler;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_type_id", nullable = false)
    private HotelRoomType roomType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rate_plan_id", nullable = false)
    private HotelRatePlan ratePlan;

    @Column(name = "check_in", nullable = false)
    private LocalDate checkIn;

    @Column(name = "check_out", nullable = false)
    private LocalDate checkOut;

    @Column(name = "number_of_rooms", nullable = false)
    @Builder.Default
    private Integer numberOfRooms = 1;

    @Column(name = "number_of_nights", nullable = false)
    @Builder.Default
    private Integer numberOfNights = 1;

    @Column(name = "adults", nullable = false)
    @Builder.Default
    private Integer adults = 1;

    @Column(name = "children", nullable = false)
    @Builder.Default
    private Integer children = 0;

    @Column(name = "guest_name", length = 150, nullable = false)
    private String guestName;

    @Column(name = "guest_email", length = 150, nullable = false)
    private String guestEmail;

    @Column(name = "guest_phone", length = 50, nullable = false)
    private String guestPhone;

    @Column(name = "special_requests", columnDefinition = "TEXT")
    private String specialRequests;

    @Column(name = "currency", length = 10, nullable = false)
    @Builder.Default
    private String currency = "INR";

    @Column(name = "price_per_night", precision = 12, scale = 2, nullable = false)
    private BigDecimal pricePerNight;

    @Column(name = "subtotal", precision = 12, scale = 2, nullable = false)
    private BigDecimal subtotal;

    @Column(name = "taxes_amount", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal taxesAmount = BigDecimal.ZERO;

    @Column(name = "fees_amount", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal feesAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_status", length = 50, nullable = false)
    @Builder.Default
    private HotelBookingStatus bookingStatus = HotelBookingStatus.PENDING_PAYMENT;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 50, nullable = false)
    @Builder.Default
    private HotelPaymentStatus paymentStatus = HotelPaymentStatus.UNPAID;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", length = 50, nullable = false)
    @Builder.Default
    private SourceType sourceType = SourceType.PARTNER_SUBMITTED;

    @Column(name = "idempotency_key", length = 100, unique = true)
    private String idempotencyKey;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "cancellation_policy_snapshot", length = 50)
    private String cancellationPolicySnapshot;

    @Column(name = "cancellation_deadline_hours")
    private Integer cancellationDeadlineHours;

    @Enumerated(EnumType.STRING)
    @Column(name = "cancellation_reason_code", length = 50)
    private CancellationReasonCode cancellationReasonCode;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    /**
     * Validates state machine transitions:
     * PENDING_PAYMENT -> CONFIRMED, EXPIRED, CANCELLED
     * CONFIRMED -> CANCELLED
     * CANCELLED -> none (terminal)
     * EXPIRED -> none (terminal)
     */
    public boolean canTransitionTo(HotelBookingStatus targetStatus) {
        if (this.bookingStatus == targetStatus) {
            return true; // Idempotent same-state check
        }
        if (this.bookingStatus == HotelBookingStatus.PENDING_PAYMENT) {
            return targetStatus == HotelBookingStatus.CONFIRMED ||
                   targetStatus == HotelBookingStatus.CANCELLED ||
                   targetStatus == HotelBookingStatus.EXPIRED;
        }
        if (this.bookingStatus == HotelBookingStatus.CONFIRMED) {
            return targetStatus == HotelBookingStatus.CANCELLED;
        }
        return false;
    }

    public void validateTransition(HotelBookingStatus targetStatus) {
        if (!canTransitionTo(targetStatus)) {
            throw new IllegalStateException("Invalid booking state transition from " + this.bookingStatus + " to " + targetStatus);
        }
    }
}
