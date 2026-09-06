package com.yatrasetu.service.payment;

import java.math.BigDecimal;
import java.util.Map;

public interface PaymentProvider {

    boolean isAvailable();

    String getProviderName();

    String getPublicKeyId();

    ProviderOrderResult createOrder(String bookingReference, BigDecimal amount, String currency, Map<String, String> notes);

    boolean verifyPaymentSignature(String providerOrderId, String providerPaymentId, String signature);

    boolean verifyWebhookSignature(String payload, String signature);

    record ProviderOrderResult(
            String providerOrderId,
            BigDecimal amount,
            String currency,
            long amountInMinorUnits,
            String status
    ) {}
}
