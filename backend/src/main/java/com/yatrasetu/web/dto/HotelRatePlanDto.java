package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelRatePlanDto {

    private String id;
    private String roomTypeId;
    private String roomTypeName;
    private String hotelId;
    private String hotelName;
    private String planName;
    private String mealPlan;
    private String mealPlanDisplayName;
    private String description;
    private BigDecimal basePrice;
    private String currency;
    private String priceUnit;
    private LocalDate validFrom;
    private LocalDate validTo;
    private String cancellationPolicy;
    private String cancellationPolicyDisplayName;
    private Integer cancellationDeadlineHours;
    private String cancellationFeeType;
    private BigDecimal cancellationFeeValue;
    private Boolean taxesIncluded;
    private Boolean feesIncluded;
    private String sourceType;
    private String status;
    private Boolean isDemoData;
    private Instant createdAt;
    private Instant updatedAt;
}
