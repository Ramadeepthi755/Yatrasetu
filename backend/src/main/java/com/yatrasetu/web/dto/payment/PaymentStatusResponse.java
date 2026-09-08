package com.yatrasetu.web.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatusResponse {
    private String bookingReference;
    private String bookingStatus;
    private String paymentStatus;
    private BigDecimal totalAmount;
    private String currency;
    private boolean paymentGatewayAvailable;
    private String provider;
    private String activeOrderId;
    private List<PaymentTransactionDto> transactions;
}
