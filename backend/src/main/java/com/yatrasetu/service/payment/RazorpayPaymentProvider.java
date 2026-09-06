package com.yatrasetu.service.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class RazorpayPaymentProvider implements PaymentProvider {

    private final RazorpayProperties properties;
    private final ObjectMapper objectMapper;

    private static final String RAZORPAY_API_BASE = "https://api.razorpay.com/v1";
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Override
    public boolean isAvailable() {
        return properties.isEnabled() && properties.isConfigured();
    }

    @Override
    public String getProviderName() {
        return "RAZORPAY";
    }

    @Override
    public String getPublicKeyId() {
        return properties.getKeyId();
    }

    @Override
    public ProviderOrderResult createOrder(String bookingReference, BigDecimal amount, String currency, Map<String, String> notes) {
        if (!isAvailable()) {
            throw new IllegalStateException("Razorpay payment gateway is currently unavailable or unconfigured. Real payment orders cannot be generated.");
        }

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero");
        }

        // Server authoritative conversion: INR 1.00 = 100 paise
        long amountInPaise = amount.multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.UNNECESSARY)
                .longValue();

        String curr = (currency != null && !currency.isBlank()) ? currency.toUpperCase().trim() : "INR";

        try {
            Map<String, Object> orderPayload = Map.of(
                    "amount", amountInPaise,
                    "currency", curr,
                    "receipt", bookingReference,
                    "notes", notes != null ? notes : Map.of("bookingReference", bookingReference)
            );

            String requestBody = objectMapper.writeValueAsString(orderPayload);
            String authHeader = "Basic " + Base64.getEncoder().encodeToString(
                    (properties.getKeyId() + ":" + properties.getKeySecret()).getBytes(StandardCharsets.UTF_8)
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(RAZORPAY_API_BASE + "/orders"))
                    .header("Authorization", authHeader)
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                JsonNode root = objectMapper.readTree(response.body());
                String orderId = root.path("id").asText();
                String status = root.path("status").asText("created");

                log.info("Successfully created Razorpay order {} for booking {}", orderId, bookingReference);
                return new ProviderOrderResult(orderId, amount, curr, amountInPaise, status);
            } else {
                log.error("Razorpay order creation failed with status {}: {}", response.statusCode(), response.body());
                throw new IllegalStateException("Failed to create Razorpay payment order: " + response.body());
            }
        } catch (Exception e) {
            if (e instanceof IllegalStateException || e instanceof IllegalArgumentException) {
                throw (RuntimeException) e;
            }
            log.error("Error communicating with Razorpay API for booking {}: {}", bookingReference, e.getMessage());
            throw new IllegalStateException("Payment provider communication error: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean verifyPaymentSignature(String providerOrderId, String providerPaymentId, String signature) {
        if (!properties.isConfigured()) {
            return false;
        }
        if (providerOrderId == null || providerPaymentId == null || signature == null) {
            return false;
        }

        try {
            String data = providerOrderId + "|" + providerPaymentId;
            String calculatedSignature = calculateHmacSha256(data, properties.getKeySecret());
            return MessageDigest.isEqual(
                    calculatedSignature.toLowerCase().getBytes(StandardCharsets.UTF_8),
                    signature.trim().toLowerCase().getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            log.error("Error verifying Razorpay payment signature: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public boolean verifyWebhookSignature(String payload, String signature) {
        if (properties.getWebhookSecret() == null || properties.getWebhookSecret().isBlank()) {
            log.warn("Razorpay webhook secret is unconfigured. Webhook signature verification failed.");
            return false;
        }
        if (payload == null || signature == null) {
            return false;
        }

        try {
            String calculatedSignature = calculateHmacSha256(payload, properties.getWebhookSecret());
            return MessageDigest.isEqual(
                    calculatedSignature.toLowerCase().getBytes(StandardCharsets.UTF_8),
                    signature.trim().toLowerCase().getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            log.error("Error verifying Razorpay webhook signature: {}", e.getMessage());
            return false;
        }
    }

    public static String calculateHmacSha256(String data, String secret) throws Exception {
        Mac sha256Hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256Hmac.init(secretKey);
        byte[] hash = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hash);
    }
}
