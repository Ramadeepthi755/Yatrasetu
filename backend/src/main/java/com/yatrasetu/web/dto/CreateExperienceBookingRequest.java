package com.yatrasetu.web.dto;

import jakarta.validation.constraints.FutureOrPresent;
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
public class CreateExperienceBookingRequest {
    @NotBlank(message = "Host ID is required")
    private String hostId;

    private String experienceId;
    private String destinationId;
    
    @Builder.Default
    private String bookingType = "PREDEFINED"; // PREDEFINED, CUSTOMIZED

    @NotNull(message = "Booking date is required")
    @FutureOrPresent(message = "Booking date cannot be in the past")
    private LocalDate bookingDate;

    private String startTime;

    @Min(value = 1, message = "Guest count must be at least 1")
    @Builder.Default
    private Integer guestCount = 1;

    private BigDecimal totalAmount;
    private String customRequirements;
    private String notes;
}
