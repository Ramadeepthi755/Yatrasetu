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
public class SendBookingMessageRequest {
    @NotBlank(message = "Message text cannot be blank")
    private String message;
}
