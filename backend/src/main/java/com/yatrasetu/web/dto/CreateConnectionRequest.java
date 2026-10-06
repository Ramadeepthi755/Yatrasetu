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
public class CreateConnectionRequest {

    @NotBlank(message = "Recipient traveler ID is required")
    private String recipientTravelerId;

    private String message;
    private String destinationId;
}
