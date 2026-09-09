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
public class VerifyQrRequest {

    @NotBlank(message = "QR Token or Booking Reference is required")
    private String token;
}
