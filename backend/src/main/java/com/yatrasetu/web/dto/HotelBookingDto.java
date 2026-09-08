package com.yatrasetu.web.dto;

import com.yatrasetu.domain.HotelBookingStatus;
import com.yatrasetu.domain.HotelPaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelBookingDto {

    private String id;
    private String bookingReference;

    // Traveler info (sanitized for partners/government)
    private String travelerId;
    private String guestName;
    private String guestEmail;
    private String guestPhone;
    private String specialRequests;

    // Hotel details
    private String hotelId;
    private String hotelName;
    private String hotelCity;
    private String hotelState;
    private String hotelAddress;

    // Room type details
    private String roomTypeId;
    private String roomTypeName;

    // Rate plan details
    private String ratePlanId;
    private String ratePlanName;
    private String mealPlan;

    // Stay parameters
    private LocalDate checkIn;
    private LocalDate checkOut;
    private Integer numberOfRooms;
    private Integer numberOfNights;
    private Integer adults;
    private Integer children;

    // Price snapshot (immutable)
    private String currency;
    private BigDecimal pricePerNight;
    private BigDecimal subtotal;
    private BigDecimal taxesAmount;
    private BigDecimal feesAmount;
    private BigDecimal totalAmount;
    private String pricingDisclosure;

    // Statuses
    private HotelBookingStatus bookingStatus;
    private HotelPaymentStatus paymentStatus;
    private String sourceType;
    private String idempotencyKey;

    // Lifecycle timestamps & Policy Snapshots
    private Instant expiresAt;
    private Instant cancelledAt;
    private String cancellationReason;
    private String cancellationReasonCode;
    private String cancellationPolicySnapshot;
    private Integer cancellationDeadlineHours;
    private String qrToken;
    private String paymentMethod;
    private String rejectionReason;
    private Instant checkedInAt;
    private Instant checkedOutAt;
    private BigDecimal reviewRating;
    private String reviewComment;
    private Instant reviewedAt;
    private Instant createdAt;
    private Instant updatedAt;

    // Allocation breakdown
    private List<BookingAllocationDto> allocations;

    // Status audit history
    private List<BookingStatusHistoryDto> statusHistory;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingAllocationDto {
        private String id;
        private LocalDate allocationDate;
        private Integer allocatedUnits;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingStatusHistoryDto {
        private String id;
        private String previousStatus;
        private String newStatus;
        private String reason;
        private String actorUserId;
        private Instant createdAt;
    }
}
