package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingConfirmationDto {
    private String bookingReference;
    private String confirmationNumber; // Same as bookingReference
    private String bookingStatus;
    private String paymentStatus;
    private Instant confirmationDate;
    private Instant createdAt;

    // Property Details
    private String hotelId;
    private String hotelName;
    private String hotelCity;
    private String hotelState;
    private String hotelAddress;
    private boolean isPartnerProperty;

    // Room & Stay Details
    private String roomTypeId;
    private String roomTypeName;
    private String ratePlanId;
    private String ratePlanName;
    private String mealPlan;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private Integer numberOfNights;
    private Integer numberOfRooms;
    private Integer adults;
    private Integer children;

    // Guest Info (Masked appropriately for non-traveler roles)
    private String guestName;
    private String guestEmail;
    private String guestPhone;
    private String specialRequests;

    // Immutable Financial Snapshot
    private String currency;
    private BigDecimal pricePerNight;
    private BigDecimal subtotal;
    private BigDecimal taxesAmount;
    private BigDecimal feesAmount;
    private BigDecimal totalAmount;
    private String pricingDisclosure;

    // Policy Snapshot
    private String cancellationPolicySnapshot;
    private Integer cancellationDeadlineHours;

    // Status Timeline
    private List<HotelBookingDto.BookingStatusHistoryDto> statusTimeline;

    // Voucher Metadata
    private boolean voucherAvailable;
    private String voucherDownloadUrl;
    private String dataProvenance;
}
