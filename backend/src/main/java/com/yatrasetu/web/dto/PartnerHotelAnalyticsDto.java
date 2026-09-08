package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartnerHotelAnalyticsDto {
    private String hotelId;
    private String hotelName;
    private String verificationStatus;
    private String bookabilityStatus; // BOOKABLE, PENDING_VERIFICATION, VERIFIED_BUT_INCOMPLETE, NOT_READY, SUSPENDED
    private Boolean isBookable;
    private long totalBookingsCount;
    private long confirmedBookingsCount;
    private long pendingPaymentCount;
    private long cancelledBookingsCount;
    private long expiredBookingsCount;
    private long reservedRoomNights;
    private BigDecimal paidBookingValue;
    private String currency;
    private int totalRoomTypesCount;
    private int activeRoomTypesCount;
    private int activeRatePlansCount;
    private int inventoryCoverageDays;
    private int inventoryBlockedDays;
    private String platformValueDisclosure;
    private List<String> missingSetupSteps;
}
