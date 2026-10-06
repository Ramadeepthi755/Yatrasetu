package com.yatrasetu.web.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDisputeRequest {
    @NotBlank(message = "Reason is required")
    private String reason;

    @NotBlank(message = "Detailed explanation is required")
    private String details;

    private BigDecimal requestedRefundAmount;
}
