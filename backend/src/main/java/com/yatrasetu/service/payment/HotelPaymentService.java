package com.yatrasetu.service.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yatrasetu.config.ConflictException;
import com.yatrasetu.config.ResourceNotFoundException;
import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.service.HotelBookingService;
import com.yatrasetu.service.NotificationService;
import com.yatrasetu.web.dto.HotelBookingDto;
import com.yatrasetu.web.dto.payment.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HotelPaymentService {

    private final HotelBookingRepository bookingRepository;
    private final HotelPaymentTransactionRepository transactionRepository;
    private final HotelPaymentWebhookEventRepository webhookEventRepository;
    private final HotelBookingStatusHistoryRepository statusHistoryRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private final PaymentProvider paymentProvider;
    private final HotelBookingService hotelBookingService;
    private final ObjectMapper objectMapper;

    /**
     * Create or reuse a server-side Razorpay payment order for a PENDING_PAYMENT booking.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public CreatePaymentOrderResponse createPaymentOrder(String bookingReference, String userIdOrEmail) {
        User traveler = resolveUser(userIdOrEmail);

        HotelBooking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingReference));

        if (!booking.getTraveler().getId().equals(traveler.getId())) {
            throw new AccessDeniedException("Only the booking owner can initiate payment for booking " + bookingReference);
        }

        // Expiry check
        if (booking.getBookingStatus() == HotelBookingStatus.EXPIRED ||
                (booking.getExpiresAt() != null && booking.getExpiresAt().isBefore(Instant.now()))) {
            throw new IllegalStateException("Reservation has expired. Online payment cannot be initiated.");
        }

        if (booking.getBookingStatus() == HotelBookingStatus.CANCELLED) {
            throw new IllegalStateException("Reservation is cancelled. Online payment cannot be initiated.");
        }

        if (booking.getBookingStatus() == HotelBookingStatus.CONFIRMED && booking.getPaymentStatus() == HotelPaymentStatus.PAID) {
            throw new IllegalStateException("Booking is already paid and confirmed.");
        }

        if (!paymentProvider.isAvailable()) {
            throw new IllegalStateException("Online payment gateway is currently unavailable or unconfigured.");
        }

        // Authoritative server-side price snapshot
        BigDecimal authoritativeAmount = booking.getTotalAmount();
        String currency = booking.getCurrency() != null ? booking.getCurrency() : "INR";

        // Check if a reusable pending transaction already exists
        List<HotelPaymentTransaction> existingPending = transactionRepository.findByBookingIdAndStatus(
                booking.getId(), HotelPaymentStatus.PENDING);

        if (!existingPending.isEmpty()) {
            HotelPaymentTransaction activeTx = existingPending.get(0);
            long amountPaise = authoritativeAmount.multiply(BigDecimal.valueOf(100)).longValue();
            return CreatePaymentOrderResponse.builder()
                    .bookingReference(booking.getBookingReference())
                    .provider(activeTx.getProvider())
                    .providerOrderId(activeTx.getProviderOrderId())
                    .keyId(paymentProvider.getPublicKeyId())
                    .amount(authoritativeAmount)
                    .amountInPaise(amountPaise)
                    .currency(currency)
                    .hotelName(booking.getHotel().getHotelName())
                    .guestName(booking.getGuestName())
                    .guestEmail(booking.getGuestEmail())
                    .guestPhone(booking.getGuestPhone())
                    .status(activeTx.getStatus().name())
                    .build();
        }

        Map<String, String> notes = Map.of(
                "bookingReference", booking.getBookingReference(),
                "hotelId", booking.getHotel().getId(),
                "travelerId", traveler.getId(),
                "guestEmail", booking.getGuestEmail()
        );

        PaymentProvider.ProviderOrderResult orderResult = paymentProvider.createOrder(
                booking.getBookingReference(), authoritativeAmount, currency, notes);

        String txId = "tx-" + UUID.randomUUID().toString().substring(0, 12);
        Instant now = Instant.now();

        HotelPaymentTransaction transaction = HotelPaymentTransaction.builder()
                .id(txId)
                .booking(booking)
                .provider(paymentProvider.getProviderName())
                .providerOrderId(orderResult.providerOrderId())
                .amount(authoritativeAmount)
                .currency(currency)
                .status(HotelPaymentStatus.PENDING)
                .createdAt(now)
                .updatedAt(now)
                .build();

        transactionRepository.save(transaction);

        if (booking.getPaymentStatus() == HotelPaymentStatus.UNPAID) {
            booking.setPaymentStatus(HotelPaymentStatus.PENDING);
            booking.setUpdatedAt(now);
            bookingRepository.save(booking);
        }

        return CreatePaymentOrderResponse.builder()
                .bookingReference(booking.getBookingReference())
                .provider(paymentProvider.getProviderName())
                .providerOrderId(orderResult.providerOrderId())
                .keyId(paymentProvider.getPublicKeyId())
                .amount(authoritativeAmount)
                .amountInPaise(orderResult.amountInMinorUnits())
                .currency(currency)
                .hotelName(booking.getHotel().getHotelName())
                .guestName(booking.getGuestName())
                .guestEmail(booking.getGuestEmail())
                .guestPhone(booking.getGuestPhone())
                .status(HotelPaymentStatus.PENDING.name())
                .build();
    }

    /**
     * Verify payment signature and transition booking to CONFIRMED and payment to PAID in an atomic transaction.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public HotelBookingDto verifyPayment(String bookingReference, VerifyPaymentRequest request, String userIdOrEmail) {
        User traveler = resolveUser(userIdOrEmail);

        HotelBooking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingReference));

        if (!booking.getTraveler().getId().equals(traveler.getId())) {
            throw new AccessDeniedException("Only the booking owner can verify payment for booking " + bookingReference);
        }

        HotelPaymentTransaction transaction = transactionRepository.findByProviderOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new ConflictException("Payment transaction not found for order: " + request.getRazorpayOrderId()));

        if (!transaction.getBooking().getId().equals(booking.getId())) {
            throw new ConflictException("Payment order does not belong to booking " + bookingReference);
        }

        // Cryptographic signature verification
        boolean isValidSignature = paymentProvider.verifyPaymentSignature(
                request.getRazorpayOrderId(), request.getRazorpayPaymentId(), request.getRazorpaySignature());

        if (!isValidSignature) {
            transaction.setStatus(HotelPaymentStatus.FAILED);
            transaction.setFailureCode("SIGNATURE_VERIFICATION_FAILED");
            transaction.setFailureDescription("Provided Razorpay HMAC-SHA256 signature did not match calculated signature.");
            transaction.setUpdatedAt(Instant.now());
            transactionRepository.save(transaction);
            throw new ConflictException("Cryptographic payment signature verification failed.");
        }

        // Idempotency: If already confirmed with this payment ID, return safely
        if (booking.getBookingStatus() == HotelBookingStatus.CONFIRMED &&
                booking.getPaymentStatus() == HotelPaymentStatus.PAID &&
                request.getRazorpayPaymentId().equals(transaction.getProviderPaymentId())) {
            log.info("Payment for booking {} already verified idempotently.", bookingReference);
            return hotelBookingService.mapToDto(booking, true);
        }

        // Late payment / exceptional reconciliation cases
        if (booking.getBookingStatus() == HotelBookingStatus.EXPIRED || booking.getBookingStatus() == HotelBookingStatus.CANCELLED) {
            transaction.setStatus(HotelPaymentStatus.PAID);
            transaction.setProviderPaymentId(request.getRazorpayPaymentId());
            transaction.setProviderSignature(request.getRazorpaySignature());
            transaction.setVerifiedAt(Instant.now());
            transaction.setUpdatedAt(Instant.now());
            transactionRepository.save(transaction);

            statusHistoryRepository.save(HotelBookingStatusHistory.builder()
                    .id("hist-" + UUID.randomUUID().toString().substring(0, 12))
                    .booking(booking)
                    .previousStatus(booking.getBookingStatus())
                    .newStatus(booking.getBookingStatus())
                    .reason("LATE_PAYMENT_RECONCILIATION_REQUIRED: Payment received after " + booking.getBookingStatus())
                    .actorUser(traveler)
                    .createdAt(Instant.now())
                    .build());

            log.warn("Late payment received for {} booking {}. Booking remains {} (allocations not resurrected).",
                    booking.getBookingStatus(), bookingReference, booking.getBookingStatus());

            throw new ConflictException("Payment received after reservation was " + booking.getBookingStatus() +
                    ". Booking cannot be confirmed; operational refund reconciliation is required.");
        }

        // Transition Booking to CONFIRMED
        HotelBookingStatus previousStatus = booking.getBookingStatus();
        booking.validateTransition(HotelBookingStatus.CONFIRMED);

        Instant now = Instant.now();
        booking.setBookingStatus(HotelBookingStatus.CONFIRMED);
        booking.setPaymentStatus(HotelPaymentStatus.PAID);
        booking.setUpdatedAt(now);
        HotelBooking savedBooking = bookingRepository.save(booking);

        // Transition Transaction to PAID
        transaction.setStatus(HotelPaymentStatus.PAID);
        transaction.setProviderPaymentId(request.getRazorpayPaymentId());
        transaction.setProviderSignature(request.getRazorpaySignature());
        transaction.setVerifiedAt(now);
        transaction.setUpdatedAt(now);
        transactionRepository.save(transaction);

        // Audit History
        statusHistoryRepository.save(HotelBookingStatusHistory.builder()
                .id("hist-" + UUID.randomUUID().toString().substring(0, 12))
                .booking(savedBooking)
                .previousStatus(previousStatus)
                .newStatus(HotelBookingStatus.CONFIRMED)
                .reason("PAYMENT_VERIFIED: " + request.getRazorpayPaymentId())
                .actorUser(traveler)
                .createdAt(now)
                .build());

        // Multi-Party In-App Notifications (Traveler + Property Owner)
        notificationService.emitBookingConfirmationNotifications(savedBooking);

        log.info("Successfully verified payment {} and confirmed booking {}", request.getRazorpayPaymentId(), bookingReference);
        return hotelBookingService.mapToDto(savedBooking, true);
    }

    /**
     * Retrieve payment status and transaction history for a booking.
     */
    @Transactional(readOnly = true)
    public PaymentStatusResponse getPaymentStatus(String bookingReference, String userIdOrEmail) {
        User user = resolveUser(userIdOrEmail);

        HotelBooking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingReference));

        boolean isTraveler = booking.getTraveler().getId().equals(user.getId());
        boolean isOwner = booking.getHotel().getOwner() != null && booking.getHotel().getOwner().getId().equals(user.getId());
        boolean isGovernment = user.getRole() == Role.GOVERNMENT;

        if (!isTraveler && !isOwner && !isGovernment) {
            throw new AccessDeniedException("Access denied for payment details of booking " + bookingReference);
        }

        List<HotelPaymentTransaction> transactions = transactionRepository.findByBookingIdOrderByCreatedAtDesc(booking.getId());
        List<PaymentTransactionDto> txDtos = transactions.stream()
                .map(t -> PaymentTransactionDto.builder()
                        .id(t.getId())
                        .bookingReference(booking.getBookingReference())
                        .provider(t.getProvider())
                        .providerOrderId(t.getProviderOrderId())
                        .providerPaymentId(t.getProviderPaymentId())
                        .amount(t.getAmount())
                        .currency(t.getCurrency())
                        .status(t.getStatus().name())
                        .failureCode(t.getFailureCode())
                        .failureDescription(t.getFailureDescription())
                        .verifiedAt(t.getVerifiedAt())
                        .createdAt(t.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        String activeOrderId = transactions.stream()
                .filter(t -> t.getStatus() == HotelPaymentStatus.PENDING)
                .map(HotelPaymentTransaction::getProviderOrderId)
                .findFirst()
                .orElse(null);

        return PaymentStatusResponse.builder()
                .bookingReference(booking.getBookingReference())
                .bookingStatus(booking.getBookingStatus().name())
                .paymentStatus(booking.getPaymentStatus().name())
                .totalAmount(booking.getTotalAmount())
                .currency(booking.getCurrency())
                .paymentGatewayAvailable(paymentProvider.isAvailable())
                .provider(paymentProvider.getProviderName())
                .activeOrderId(activeOrderId)
                .transactions(txDtos)
                .build();
    }

    /**
     * Handle incoming webhook event with cryptographic signature verification and DB-backed deduplication.
     */
    @Transactional
    public void processWebhook(String payload, String signature) {
        if (!paymentProvider.verifyWebhookSignature(payload, signature)) {
            log.error("Rejecting webhook with invalid HMAC signature");
            throw new IllegalArgumentException("Invalid Razorpay webhook signature");
        }

        try {
            JsonNode root = objectMapper.readTree(payload);
            String eventType = root.path("event").asText();
            String eventId = root.has("event_id") ? root.path("event_id").asText() :
                    root.has("id") ? root.path("id").asText() :
                            "evt-" + calculateSha256(payload).substring(0, 16);

            // DB-backed deduplication
            if (webhookEventRepository.existsByEventId(eventId)) {
                log.info("Webhook event {} already processed. Deduplicating safely.", eventId);
                return;
            }

            JsonNode payloadObj = root.path("payload");
            JsonNode paymentEntity = payloadObj.path("payment").path("entity");
            JsonNode orderEntity = payloadObj.path("order").path("entity");

            String orderId = !orderEntity.isMissingNode() ? orderEntity.path("id").asText() : paymentEntity.path("order_id").asText();
            String paymentId = !paymentEntity.isMissingNode() ? paymentEntity.path("id").asText() : null;

            if (orderId != null && !orderId.isBlank()) {
                Optional<HotelPaymentTransaction> txOpt = transactionRepository.findByProviderOrderId(orderId);
                if (txOpt.isPresent()) {
                    HotelPaymentTransaction tx = txOpt.get();
                    HotelBooking booking = tx.getBooking();

                    if ("payment.captured".equals(eventType) || "order.paid".equals(eventType)) {
                        if (booking.getBookingStatus() == HotelBookingStatus.PENDING_PAYMENT) {
                            Instant now = Instant.now();
                            booking.setBookingStatus(HotelBookingStatus.CONFIRMED);
                            booking.setPaymentStatus(HotelPaymentStatus.PAID);
                            booking.setUpdatedAt(now);
                            bookingRepository.save(booking);

                            tx.setStatus(HotelPaymentStatus.PAID);
                            tx.setProviderPaymentId(paymentId);
                            tx.setVerifiedAt(now);
                            tx.setUpdatedAt(now);
                            transactionRepository.save(tx);

                            statusHistoryRepository.save(HotelBookingStatusHistory.builder()
                                    .id("hist-" + UUID.randomUUID().toString().substring(0, 12))
                                    .booking(booking)
                                    .previousStatus(HotelBookingStatus.PENDING_PAYMENT)
                                    .newStatus(HotelBookingStatus.CONFIRMED)
                                    .reason("WEBHOOK_CONFIRMED: " + eventType)
                                    .actorUser(null)
                                    .createdAt(now)
                                    .build());

                            notificationService.emitBookingConfirmationNotifications(booking);
                            log.info("Booking {} confirmed via webhook event {}", booking.getBookingReference(), eventType);
                        }
                    } else if ("payment.failed".equals(eventType)) {
                        String errorCode = paymentEntity.path("error_code").asText("PAYMENT_FAILED");
                        String errorDesc = paymentEntity.path("error_description").asText("Payment failed at gateway");

                        tx.setStatus(HotelPaymentStatus.FAILED);
                        tx.setFailureCode(errorCode);
                        tx.setFailureDescription(errorDesc);
                        tx.setUpdatedAt(Instant.now());
                        transactionRepository.save(tx);

                        log.info("Payment failed for booking {} (Order: {}) via webhook: {}",
                                booking.getBookingReference(), orderId, errorDesc);
                    }
                }
            }

            // Persist processed webhook event
            webhookEventRepository.save(HotelPaymentWebhookEvent.builder()
                    .id("whevt-" + UUID.randomUUID().toString().substring(0, 12))
                    .eventId(eventId)
                    .eventType(eventType)
                    .provider("RAZORPAY")
                    .payloadHash(calculateSha256(payload))
                    .status("PROCESSED")
                    .processedAt(Instant.now())
                    .build());

        } catch (Exception e) {
            log.error("Error processing Razorpay webhook: {}", e.getMessage(), e);
            throw new RuntimeException("Error processing webhook: " + e.getMessage(), e);
        }
    }

    private User resolveUser(String userIdOrEmail) {
        if (userIdOrEmail == null || userIdOrEmail.isBlank()) {
            throw new AccessDeniedException("Authentication required.");
        }
        return userRepository.findById(userIdOrEmail)
                .or(() -> userRepository.findByEmail(userIdOrEmail))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userIdOrEmail));
    }

    private String calculateSha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(input.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                hexString.append(String.format("%02x", b));
            }
            return hexString.toString();
        } catch (Exception e) {
            return "unknown";
        }
    }
}
