package com.yatrasetu.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRatePlanRequest {

    private String planName;
    private String mealPlan;
    private String description;

    @DecimalMin(value = "0.0", inclusive = true, message = "Base price cannot be negative")
    private BigDecimal basePrice;

    private String currency;
    private String priceUnit;
    private LocalDate validFrom;
    private LocalDate validTo;
    private String cancellationPolicy;

    @Min(value = 0, message = "Cancellation deadline hours cannot be negative")
    private Integer cancellationDeadlineHours;

    private String cancellationFeeType;

    @DecimalMin(value = "0.0", inclusive = true, message = "Cancellation fee value cannot be negative")
    private BigDecimal cancellationFeeValue;

    private Boolean taxesIncluded;
    private Boolean feesIncluded;
    private String status;
}
