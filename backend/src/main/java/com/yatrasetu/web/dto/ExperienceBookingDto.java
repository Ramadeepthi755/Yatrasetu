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
public class ExperienceBookingDto {
    private String id;
    private String bookingReference;
    private String touristUserId;
    private String touristName;
    private String touristEmail;
    private String hostId;
    private String hostName;
    private String hostRoleTitle;
    private String hostAvatarUrl;
    private String experienceId;
    private String experienceTitle;
    private String destinationId;
    private String destinationName;
    private String bookingType; // PREDEFINED, CUSTOMIZED
    private LocalDate bookingDate;
    private String startTime;
    private Integer guestCount;
    private BigDecimal totalAmount;
    private String currency;
    private String status;
    private String customRequirements;
    private String customItinerary;
    private String paymentStatus;
    private String paymentMethod;
    private BigDecimal cashMilestone1Amount;
    private Boolean cashMilestone1Paid;
    private Instant cashMilestone1PaidAt;
    private BigDecimal cashMilestone2Amount;
    private Boolean cashMilestone2Paid;
    private Instant cashMilestone2PaidAt;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String notes;
    private String meetingPointName;
    private String meetingPointAddress;
    private BigDecimal meetingPointLatitude;
    private BigDecimal meetingPointLongitude;
    private String hostPhone;
    private BigDecimal durationHours;
    private List<TripCheckinDto> checkins;
    private List<ExperienceSupportingProviderDto> supportingProviders;
    private Instant createdAt;
    private Instant updatedAt;
}
