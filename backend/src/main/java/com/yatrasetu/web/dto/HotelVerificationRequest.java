package com.yatrasetu.web.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelVerificationRequest {

    @NotBlank(message = "Decision is required: APPROVED, REJECTED, or SUSPENDED")
    private String decision; // APPROVED, REJECTED, SUSPENDED

    private String notes;

    private String rejectionReason;
}
