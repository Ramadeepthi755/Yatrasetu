package com.yatrasetu.web.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentOrderResponse {
    private String bookingReference;
    private String provider;
    private String providerOrderId;
    private String keyId;
    private BigDecimal amount;
    private Long amountInPaise;
    private String currency;
    private String hotelName;
    private String experienceTitle;
    private String guestName;
    private String guestEmail;
    private String guestPhone;
    private String status;
}
