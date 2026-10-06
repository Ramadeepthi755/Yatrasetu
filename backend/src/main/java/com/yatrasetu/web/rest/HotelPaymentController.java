package com.yatrasetu.web.rest;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.domain.Role;
import com.yatrasetu.service.payment.HotelPaymentService;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.HotelBookingDto;
import com.yatrasetu.web.dto.payment.CreatePaymentOrderResponse;
import com.yatrasetu.web.dto.payment.PaymentStatusResponse;
import com.yatrasetu.web.dto.payment.VerifyPaymentRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
public class HotelPaymentController {

    private final HotelPaymentService paymentService;

    /**
     * Create or retrieve a Razorpay payment order for a PENDING_PAYMENT hotel reservation.
     */
    @PostMapping("/api/v1/bookings/{bookingReference}/payment/order")
    @PreAuthorize("hasRole('TRAVELER')")
    public ResponseEntity<ApiResponse<CreatePaymentOrderResponse>> createPaymentOrder(
            @PathVariable("bookingReference") String bookingReference,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<CreatePaymentOrderResponse>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        if (principal.getRole() != Role.TRAVELER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.<CreatePaymentOrderResponse>builder()
                            .success(false)
                            .message("Only travelers can initiate payment for their bookings")
                            .timestamp(Instant.now())
                            .build());
        }

        CreatePaymentOrderResponse order = paymentService.createPaymentOrder(
                bookingReference, principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<CreatePaymentOrderResponse>builder()
                .success(true)
                .message("Razorpay payment order generated successfully")
                .data(order)
                .timestamp(Instant.now())
                .build());
    }

    /**
     * Verify payment signature from Razorpay and confirm the hotel booking.
     */
    @PostMapping("/api/v1/bookings/{bookingReference}/payment/verify")
    @PreAuthorize("hasRole('TRAVELER')")
    public ResponseEntity<ApiResponse<HotelBookingDto>> verifyPayment(
            @PathVariable("bookingReference") String bookingReference,
            @Valid @RequestBody VerifyPaymentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<HotelBookingDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        if (principal.getRole() != Role.TRAVELER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.<HotelBookingDto>builder()
                            .success(false)
                            .message("Only travelers can verify payment for their bookings")
                            .timestamp(Instant.now())
                            .build());
        }

        HotelBookingDto confirmed = paymentService.verifyPayment(
                bookingReference, request, principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<HotelBookingDto>builder()
                .success(true)
                .message("Payment verified successfully. Booking status: CONFIRMED")
                .data(confirmed)
                .timestamp(Instant.now())
                .build());
    }

    /**
     * Retrieve payment status and transaction history for a booking.
     */
    @GetMapping("/api/v1/bookings/{bookingReference}/payment")
    public ResponseEntity<ApiResponse<PaymentStatusResponse>> getPaymentStatus(
            @PathVariable("bookingReference") String bookingReference,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<PaymentStatusResponse>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        PaymentStatusResponse status = paymentService.getPaymentStatus(
                bookingReference, principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<PaymentStatusResponse>builder()
                .success(true)
                .message("Retrieved payment status successfully")
                .data(status)
                .timestamp(Instant.now())
                .build());
    }

    /**
     * Razorpay Webhook Callback Endpoint.
     */
    @PostMapping("/api/v1/payments/razorpay/webhook")
    public ResponseEntity<Map<String, Object>> handleRazorpayWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {

        if (signature == null || signature.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", "error", "message", "Missing X-Razorpay-Signature header"));
        }

        try {
            paymentService.processWebhook(payload, signature);
            return ResponseEntity.ok(Map.of("status", "ok", "message", "Webhook processed successfully"));
        } catch (IllegalArgumentException e) {
            log.warn("Invalid webhook signature received: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Webhook processing error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", "Internal processing error"));
        }
    }
}
