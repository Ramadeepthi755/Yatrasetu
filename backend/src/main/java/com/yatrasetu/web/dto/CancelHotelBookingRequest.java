package com.yatrasetu.web.dto;

import com.yatrasetu.domain.CancellationReasonCode;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CancelHotelBookingRequest {

    @Size(max = 255, message = "Cancellation reason cannot exceed 255 characters")
    private String reason;

    private CancellationReasonCode reasonCode;
}
