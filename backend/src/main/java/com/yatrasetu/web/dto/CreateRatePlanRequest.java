package com.yatrasetu.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateRatePlanRequest {

    @NotBlank(message = "Rate plan name is required")
    private String planName;

    @Builder.Default
    private String mealPlan = "EP";

    private String description;

    @NotNull(message = "Base price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Base price cannot be negative")
    private BigDecimal basePrice;

    @Builder.Default
    private String currency = "INR";

    @Builder.Default
    private String priceUnit = "PER_NIGHT";

    private LocalDate validFrom;

    private LocalDate validTo;

    @Builder.Default
    private String cancellationPolicy = "FREE_CANCELLATION";

    @Builder.Default
    @Min(value = 0, message = "Cancellation deadline hours cannot be negative")
    private Integer cancellationDeadlineHours = 24;

    @Builder.Default
    private String cancellationFeeType = "NONE";

    @Builder.Default
    @DecimalMin(value = "0.0", inclusive = true, message = "Cancellation fee value cannot be negative")
    private BigDecimal cancellationFeeValue = BigDecimal.ZERO;

    @Builder.Default
    private Boolean taxesIncluded = false;

    @Builder.Default
    private Boolean feesIncluded = false;

    @Builder.Default
    private String status = "ACTIVE";
}
