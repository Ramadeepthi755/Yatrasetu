package com.yatrasetu.service;

import com.yatrasetu.config.ConflictException;
import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.service.payment.*;
import com.yatrasetu.web.dto.HotelBookingDto;
import com.yatrasetu.web.dto.payment.CreatePaymentOrderResponse;
import com.yatrasetu.web.dto.payment.PaymentStatusResponse;
import com.yatrasetu.web.dto.payment.VerifyPaymentRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
public class Phase22_8HotelPaymentEngineTest {

    @Autowired
    private HotelPaymentService paymentService;

    @Autowired
    private HotelBookingService bookingService;

    @Autowired
    private HotelBookingRepository bookingRepository;

    @Autowired
    private HotelBookingAllocationRepository allocationRepository;

    @Autowired
    private HotelBookingStatusHistoryRepository statusHistoryRepository;

    @Autowired
    private HotelPaymentTransactionRepository transactionRepository;

    @Autowired
    private HotelPaymentWebhookEventRepository webhookEventRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private HotelRoomTypeRepository roomTypeRepository;

    @Autowired
    private HotelRatePlanRepository ratePlanRepository;

    @Autowired
    private HotelInventoryRepository inventoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private StateRepository stateRepository;

    @MockBean
    private PaymentProvider paymentProvider;

    private User traveler;
    private User otherTraveler;
    private User partner;
    private Hotel hotel;
    private HotelRoomType roomType;
    private HotelRatePlan ratePlan;

    private static final String TEST_ORDER_ID = "order_test_123456";
    private static final String TEST_PAYMENT_ID = "pay_test_987654";
    private static final String TEST_VALID_SIGNATURE = "valid_signature_hash_abc";
    private static final String TEST_INVALID_SIGNATURE = "invalid_signature_xyz";

    @BeforeEach
    void setUp() {
        cleanup();

        // 1. Setup Mock Payment Provider default behavior
        when(paymentProvider.isAvailable()).thenReturn(true);
        when(paymentProvider.getProviderName()).thenReturn("RAZORPAY");
        when(paymentProvider.getPublicKeyId()).thenReturn("rzp_test_key123");
        when(paymentProvider.createOrder(anyString(), any(BigDecimal.class), anyString(), anyMap()))
                .thenAnswer(invocation -> {
                    BigDecimal amt = invocation.getArgument(1);
                    String curr = invocation.getArgument(2);
                    long paise = amt.multiply(BigDecimal.valueOf(100)).longValue();
                    return new PaymentProvider.ProviderOrderResult(
                            TEST_ORDER_ID, amt, curr, paise, "created");
                });

        when(paymentProvider.verifyPaymentSignature(eq(TEST_ORDER_ID), eq(TEST_PAYMENT_ID), eq(TEST_VALID_SIGNATURE)))
                .thenReturn(true);
        when(paymentProvider.verifyPaymentSignature(anyString(), anyString(), eq(TEST_INVALID_SIGNATURE)))
                .thenReturn(false);
        when(paymentProvider.verifyWebhookSignature(anyString(), eq("valid_webhook_sig")))
                .thenReturn(true);
        when(paymentProvider.verifyWebhookSignature(anyString(), eq("invalid_webhook_sig")))
                .thenReturn(false);

        // 2. Setup Geography
        State state = stateRepository.save(State.builder()
                .id("st-pay-test")
                .stateName("Goa")
                .region("West India")
                .build());

        City city = cityRepository.save(City.builder()
                .id("ct-pay-test")
                .cityName("Panaji")
                .state(state)
                .latitude(BigDecimal.valueOf(15.4909))
                .longitude(BigDecimal.valueOf(73.8278))
                .build());

        // 3. Setup Users
        traveler = userRepository.save(User.builder()
                .id("usr-pay-traveler-1")
                .email("traveler1@yatrasetu.test")
                .fullName("Rohan Sharma")
                .role(Role.TRAVELER)
                .phone("+91 9876543210")
                .build());

        otherTraveler = userRepository.save(User.builder()
                .id("usr-pay-traveler-2")
                .email("traveler2@yatrasetu.test")
                .fullName("Priya Verma")
                .role(Role.TRAVELER)
                .phone("+91 9123456780")
                .build());

        partner = userRepository.save(User.builder()
                .id("usr-pay-partner")
                .email("partner@yatrasetu.test")
                .fullName("Hotel Owner")
                .role(Role.PARTNER)
                .phone("+91 9988776655")
                .build());

        // 4. Setup Verified Partner Hotel
        hotel = hotelRepository.save(Hotel.builder()
                .id("htl-pay-partner-1")
                .hotelName("Yatra Grand Panaji")
                .city(city)
                .address("Miramar Beach Road")
                .pricePerNight(new BigDecimal("4500.00"))
                .isActive(true)
                .isPartnerProperty(true)
                .verificationStatus(HotelVerificationStatus.VERIFIED)
                .owner(partner)
                .latitude(BigDecimal.valueOf(15.4909))
                .longitude(BigDecimal.valueOf(73.8278))
                .build());

        // 5. Setup Room Type and Rate Plan
        roomType = roomTypeRepository.save(HotelRoomType.builder()
                .id("rt-pay-deluxe-1")
                .hotel(hotel)
                .roomTypeName("Deluxe Sea View")
                .baseInventoryUnits(5)
                .maxOccupancy(2)
                .isActive(true)
                .build());

        ratePlan = ratePlanRepository.save(HotelRatePlan.builder()
                .id("rp-pay-standard-1")
                .roomType(roomType)
                .planName("Standard Flex")
                .mealPlan(MealPlan.CP)
                .cancellationPolicy(CancellationPolicyType.FREE_CANCELLATION)
                .cancellationDeadlineHours(24)
                .basePrice(new BigDecimal("4500.00"))
                .currency("INR")
                .status(RatePlanStatus.ACTIVE)
                .build());
    }

    @AfterEach
    void tearDown() {
        cleanup();
    }

    private void cleanup() {
        webhookEventRepository.deleteAll();
        transactionRepository.deleteAll();
        statusHistoryRepository.deleteAll();
        allocationRepository.deleteAll();
        bookingRepository.deleteAll();
        inventoryRepository.deleteAll();
        ratePlanRepository.deleteAll();
        roomTypeRepository.deleteAll();
        hotelRepository.deleteAll();
        notificationRepository.deleteAll();
        userRepository.deleteAll();
        cityRepository.deleteAll();
        stateRepository.deleteAll();
    }

    private HotelBooking createPendingBooking(LocalDate checkIn, LocalDate checkOut, int rooms, BigDecimal totalAmount) {
        String bookingRef = "YTS-2026-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String bookingId = "bk-" + UUID.randomUUID().toString().substring(0, 12);
        int nights = (int) ChronoUnit.DAYS.between(checkIn, checkOut);

        HotelBooking booking = HotelBooking.builder()
                .id(bookingId)
                .bookingReference(bookingRef)
                .traveler(traveler)
                .hotel(hotel)
                .roomType(roomType)
                .ratePlan(ratePlan)
                .checkIn(checkIn)
                .checkOut(checkOut)
                .numberOfRooms(rooms)
                .numberOfNights(nights)
                .adults(2)
                .children(0)
                .guestName("Rohan Sharma")
                .guestEmail("traveler1@yatrasetu.test")
                .guestPhone("+91 9876543210")
                .currency("INR")
                .pricePerNight(new BigDecimal("4500.00"))
                .subtotal(totalAmount)
                .taxesAmount(BigDecimal.ZERO)
                .feesAmount(BigDecimal.ZERO)
                .totalAmount(totalAmount)
                .bookingStatus(HotelBookingStatus.PENDING_PAYMENT)
                .paymentStatus(HotelPaymentStatus.UNPAID)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .expiresAt(Instant.now().plusSeconds(1800))
                .cancellationPolicySnapshot("FREE_CANCELLATION")
                .cancellationDeadlineHours(24)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        HotelBooking saved = bookingRepository.save(booking);

        List<HotelBookingAllocation> allocs = new ArrayList<>();
        for (LocalDate d = checkIn; d.isBefore(checkOut); d = d.plusDays(1)) {
            allocs.add(HotelBookingAllocation.builder()
                    .id("alloc-" + UUID.randomUUID().toString().substring(0, 12))
                    .booking(saved)
                    .roomType(roomType)
                    .allocationDate(d)
                    .allocatedUnits(rooms)
                    .status(BookingAllocationStatus.ACTIVE)
                    .createdAt(Instant.now())
                    .build());
        }
        allocationRepository.saveAll(allocs);

        statusHistoryRepository.save(HotelBookingStatusHistory.builder()
                .id("hist-" + UUID.randomUUID().toString().substring(0, 12))
                .booking(saved)
                .newStatus(HotelBookingStatus.PENDING_PAYMENT)
                .reason("BOOKING_CREATED")
                .actorUser(traveler)
                .createdAt(Instant.now())
                .build());

        return saved;
    }

    @Test
    void test1_paymentOrderCreation_ValidPendingPayment_ReturnsAuthoritativeAmountInPaise() {
        LocalDate checkIn = LocalDate.now().plusDays(10);
        LocalDate checkOut = LocalDate.now().plusDays(12);
        HotelBooking booking = createPendingBooking(checkIn, checkOut, 1, new BigDecimal("9000.00"));

        CreatePaymentOrderResponse res = paymentService.createPaymentOrder(
                booking.getBookingReference(), traveler.getId());

        assertThat(res).isNotNull();
        assertThat(res.getBookingReference()).isEqualTo(booking.getBookingReference());
        assertThat(res.getProviderOrderId()).isEqualTo(TEST_ORDER_ID);
        assertThat(res.getAmount()).isEqualByComparingTo("9000.00");
        assertThat(res.getAmountInPaise()).isEqualTo(900000L);
        assertThat(res.getCurrency()).isEqualTo("INR");
        assertThat(res.getKeyId()).isEqualTo("rzp_test_key123");

        // Verify transaction is stored as PENDING
        List<HotelPaymentTransaction> txs = transactionRepository.findByBookingIdAndStatus(
                booking.getId(), HotelPaymentStatus.PENDING);
        assertThat(txs).hasSize(1);
        assertThat(txs.get(0).getProviderOrderId()).isEqualTo(TEST_ORDER_ID);
        assertThat(txs.get(0).getAmount()).isEqualByComparingTo("9000.00");
    }

    @Test
    void test2_bookingOwnershipEnforcement_OtherTravelerCannotCreateOrder() {
        LocalDate checkIn = LocalDate.now().plusDays(10);
        LocalDate checkOut = LocalDate.now().plusDays(12);
        HotelBooking booking = createPendingBooking(checkIn, checkOut, 1, new BigDecimal("9000.00"));

        assertThatThrownBy(() -> paymentService.createPaymentOrder(booking.getBookingReference(), otherTraveler.getId()))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Only the booking owner");
    }

    @Test
    void test3_expiredAndCancelledBookings_CannotCreatePaymentOrder() {
        LocalDate checkIn = LocalDate.now().plusDays(10);
        LocalDate checkOut = LocalDate.now().plusDays(12);
        HotelBooking booking = createPendingBooking(checkIn, checkOut, 1, new BigDecimal("9000.00"));

        // Cancel booking
        bookingService.cancelBooking(booking.getBookingReference(), traveler.getId());

        assertThatThrownBy(() -> paymentService.createPaymentOrder(booking.getBookingReference(), traveler.getId()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Reservation is cancelled");
    }

    @Test
    void test4_invalidSignatureRejected_BookingRemainsPending_TransactionMarkedFailed() {
        LocalDate checkIn = LocalDate.now().plusDays(10);
        LocalDate checkOut = LocalDate.now().plusDays(12);
        HotelBooking booking = createPendingBooking(checkIn, checkOut, 1, new BigDecimal("9000.00"));

        paymentService.createPaymentOrder(booking.getBookingReference(), traveler.getId());

        VerifyPaymentRequest req = VerifyPaymentRequest.builder()
                .razorpayOrderId(TEST_ORDER_ID)
                .razorpayPaymentId(TEST_PAYMENT_ID)
                .razorpaySignature(TEST_INVALID_SIGNATURE)
                .build();

        assertThatThrownBy(() -> paymentService.verifyPayment(booking.getBookingReference(), req, traveler.getId()))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Cryptographic payment signature verification failed");

        HotelBooking evaluated = bookingRepository.findById(booking.getId()).orElseThrow();
        assertThat(evaluated.getBookingStatus()).isEqualTo(HotelBookingStatus.PENDING_PAYMENT);
        assertThat(evaluated.getPaymentStatus()).isNotEqualTo(HotelPaymentStatus.PAID);
    }

    @Test
    void test5_validSignatureAccepted_TransitionsBookingToConfirmed_AndPaymentToPaid() {
        LocalDate checkIn = LocalDate.now().plusDays(10);
        LocalDate checkOut = LocalDate.now().plusDays(12);
        HotelBooking booking = createPendingBooking(checkIn, checkOut, 1, new BigDecimal("9000.00"));

        paymentService.createPaymentOrder(booking.getBookingReference(), traveler.getId());

        VerifyPaymentRequest req = VerifyPaymentRequest.builder()
                .razorpayOrderId(TEST_ORDER_ID)
                .razorpayPaymentId(TEST_PAYMENT_ID)
                .razorpaySignature(TEST_VALID_SIGNATURE)
                .build();

        HotelBookingDto confirmedDto = paymentService.verifyPayment(
                booking.getBookingReference(), req, traveler.getId());

        assertThat(confirmedDto.getBookingStatus()).isEqualTo(HotelBookingStatus.CONFIRMED);
        assertThat(confirmedDto.getPaymentStatus()).isEqualTo(HotelPaymentStatus.PAID);

        // Verify DB State
        HotelBooking dbBooking = bookingRepository.findById(booking.getId()).orElseThrow();
        assertThat(dbBooking.getBookingStatus()).isEqualTo(HotelBookingStatus.CONFIRMED);
        assertThat(dbBooking.getPaymentStatus()).isEqualTo(HotelPaymentStatus.PAID);

        // Verify Transaction Record
        HotelPaymentTransaction tx = transactionRepository.findByProviderOrderId(TEST_ORDER_ID).orElseThrow();
        assertThat(tx.getStatus()).isEqualTo(HotelPaymentStatus.PAID);
        assertThat(tx.getProviderPaymentId()).isEqualTo(TEST_PAYMENT_ID);
        assertThat(tx.getVerifiedAt()).isNotNull();

        // Verify Status History Log
        List<HotelBookingStatusHistory> history = statusHistoryRepository.findByBookingIdOrderByCreatedAtAsc(booking.getId());
        assertThat(history).hasSize(2);
        assertThat(history.get(1).getNewStatus()).isEqualTo(HotelBookingStatus.CONFIRMED);
        assertThat(history.get(1).getReason()).contains("PAYMENT_VERIFIED");
    }

    @Test
    void test6_paymentVerification_IsStrictlyIdempotent() {
        LocalDate checkIn = LocalDate.now().plusDays(10);
        LocalDate checkOut = LocalDate.now().plusDays(12);
        HotelBooking booking = createPendingBooking(checkIn, checkOut, 1, new BigDecimal("9000.00"));

        paymentService.createPaymentOrder(booking.getBookingReference(), traveler.getId());

        VerifyPaymentRequest req = VerifyPaymentRequest.builder()
                .razorpayOrderId(TEST_ORDER_ID)
                .razorpayPaymentId(TEST_PAYMENT_ID)
                .razorpaySignature(TEST_VALID_SIGNATURE)
                .build();

        // 1st verification
        HotelBookingDto firstCall = paymentService.verifyPayment(booking.getBookingReference(), req, traveler.getId());
        assertThat(firstCall.getBookingStatus()).isEqualTo(HotelBookingStatus.CONFIRMED);

        // 2nd verification (exact duplicate)
        HotelBookingDto secondCall = paymentService.verifyPayment(booking.getBookingReference(), req, traveler.getId());
        assertThat(secondCall.getBookingStatus()).isEqualTo(HotelBookingStatus.CONFIRMED);
        assertThat(secondCall.getPaymentStatus()).isEqualTo(HotelPaymentStatus.PAID);
    }

    @Test
    void test7_latePaymentAfterExpiry_DoesNotConfirmBooking_DoesNotResurrectAllocations() {
        LocalDate checkIn = LocalDate.now().plusDays(10);
        LocalDate checkOut = LocalDate.now().plusDays(12);
        HotelBooking booking = createPendingBooking(checkIn, checkOut, 1, new BigDecimal("9000.00"));

        paymentService.createPaymentOrder(booking.getBookingReference(), traveler.getId());

        // Force booking expiry
        booking.setExpiresAt(Instant.now().minusSeconds(60));
        bookingRepository.save(booking);
        bookingService.expirePendingBookings();

        HotelBooking expiredBooking = bookingRepository.findById(booking.getId()).orElseThrow();
        assertThat(expiredBooking.getBookingStatus()).isEqualTo(HotelBookingStatus.EXPIRED);

        // Verify allocations are RELEASED
        List<HotelBookingAllocation> allocs = allocationRepository.findByBookingId(booking.getId());
        for (HotelBookingAllocation a : allocs) {
            assertThat(a.getStatus()).isEqualTo(BookingAllocationStatus.RELEASED);
        }

        // Late payment arrives
        VerifyPaymentRequest req = VerifyPaymentRequest.builder()
                .razorpayOrderId(TEST_ORDER_ID)
                .razorpayPaymentId(TEST_PAYMENT_ID)
                .razorpaySignature(TEST_VALID_SIGNATURE)
                .build();

        assertThatThrownBy(() -> paymentService.verifyPayment(booking.getBookingReference(), req, traveler.getId()))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Payment received after reservation was EXPIRED");

        // Verify booking remains EXPIRED and allocations stay RELEASED
        HotelBooking postCheck = bookingRepository.findById(booking.getId()).orElseThrow();
        assertThat(postCheck.getBookingStatus()).isEqualTo(HotelBookingStatus.EXPIRED);

        List<HotelBookingAllocation> postAllocs = allocationRepository.findByBookingId(booking.getId());
        for (HotelBookingAllocation a : postAllocs) {
            assertThat(a.getStatus()).isEqualTo(BookingAllocationStatus.RELEASED);
        }
    }

    @Test
    void test8_latePaymentAfterCancellation_DoesNotConfirmBooking() {
        LocalDate checkIn = LocalDate.now().plusDays(10);
        LocalDate checkOut = LocalDate.now().plusDays(12);
        HotelBooking booking = createPendingBooking(checkIn, checkOut, 1, new BigDecimal("9000.00"));

        paymentService.createPaymentOrder(booking.getBookingReference(), traveler.getId());
        bookingService.cancelBooking(booking.getBookingReference(), traveler.getId());

        VerifyPaymentRequest req = VerifyPaymentRequest.builder()
                .razorpayOrderId(TEST_ORDER_ID)
                .razorpayPaymentId(TEST_PAYMENT_ID)
                .razorpaySignature(TEST_VALID_SIGNATURE)
                .build();

        assertThatThrownBy(() -> paymentService.verifyPayment(booking.getBookingReference(), req, traveler.getId()))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Payment received after reservation was CANCELLED");

        HotelBooking evaluated = bookingRepository.findById(booking.getId()).orElseThrow();
        assertThat(evaluated.getBookingStatus()).isEqualTo(HotelBookingStatus.CANCELLED);
    }

    @Test
    void test9_webhookPaymentCaptured_ConfirmsPendingBooking_AndDeduplicatesEvent() {
        LocalDate checkIn = LocalDate.now().plusDays(10);
        LocalDate checkOut = LocalDate.now().plusDays(12);
        HotelBooking booking = createPendingBooking(checkIn, checkOut, 1, new BigDecimal("9000.00"));

        paymentService.createPaymentOrder(booking.getBookingReference(), traveler.getId());

        String webhookJson = """
                {
                    "entity": "event",
                    "event_id": "evt_capture_12345",
                    "event": "payment.captured",
                    "payload": {
                        "payment": {
                            "entity": {
                                "id": "pay_test_987654",
                                "order_id": "%s",
                                "amount": 900000,
                                "currency": "INR",
                                "status": "captured"
                            }
                        }
                    }
                }
                """.formatted(TEST_ORDER_ID);

        // 1st Webhook delivery
        paymentService.processWebhook(webhookJson, "valid_webhook_sig");

        HotelBooking dbBooking = bookingRepository.findById(booking.getId()).orElseThrow();
        assertThat(dbBooking.getBookingStatus()).isEqualTo(HotelBookingStatus.CONFIRMED);
        assertThat(dbBooking.getPaymentStatus()).isEqualTo(HotelPaymentStatus.PAID);

        assertThat(webhookEventRepository.existsByEventId("evt_capture_12345")).isTrue();

        // 2nd Webhook delivery (duplicate)
        paymentService.processWebhook(webhookJson, "valid_webhook_sig");
        assertThat(webhookEventRepository.count()).isEqualTo(1);
    }

    @Test
    void test10_webhookInvalidSignature_IsRejected() {
        String webhookJson = """
                {
                    "entity": "event",
                    "event_id": "evt_fake_999",
                    "event": "payment.captured"
                }
                """;

        assertThatThrownBy(() -> paymentService.processWebhook(webhookJson, "invalid_webhook_sig"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid Razorpay webhook signature");
    }

    @Test
    void test11_getPaymentStatus_ReturnsAccurateGatewayMetadata() {
        LocalDate checkIn = LocalDate.now().plusDays(10);
        LocalDate checkOut = LocalDate.now().plusDays(12);
        HotelBooking booking = createPendingBooking(checkIn, checkOut, 1, new BigDecimal("9000.00"));

        paymentService.createPaymentOrder(booking.getBookingReference(), traveler.getId());

        PaymentStatusResponse statusRes = paymentService.getPaymentStatus(
                booking.getBookingReference(), traveler.getId());

        assertThat(statusRes).isNotNull();
        assertThat(statusRes.getBookingReference()).isEqualTo(booking.getBookingReference());
        assertThat(statusRes.getBookingStatus()).isEqualTo("PENDING_PAYMENT");
        assertThat(statusRes.isPaymentGatewayAvailable()).isTrue();
        assertThat(statusRes.getActiveOrderId()).isEqualTo(TEST_ORDER_ID);
        assertThat(statusRes.getTransactions()).hasSize(1);
    }

    @Test
    void test12_concurrentDuplicatePaymentVerification_IsThreadSafe() throws Exception {
        LocalDate checkIn = LocalDate.now().plusDays(10);
        LocalDate checkOut = LocalDate.now().plusDays(12);
        HotelBooking booking = createPendingBooking(checkIn, checkOut, 1, new BigDecimal("9000.00"));

        paymentService.createPaymentOrder(booking.getBookingReference(), traveler.getId());

        VerifyPaymentRequest req = VerifyPaymentRequest.builder()
                .razorpayOrderId(TEST_ORDER_ID)
                .razorpayPaymentId(TEST_PAYMENT_ID)
                .razorpaySignature(TEST_VALID_SIGNATURE)
                .build();

        int threads = 4;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threads);
        AtomicInteger successCount = new AtomicInteger(0);

        for (int i = 0; i < threads; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    HotelBookingDto res = paymentService.verifyPayment(booking.getBookingReference(), req, traveler.getId());
                    if (res.getBookingStatus() == HotelBookingStatus.CONFIRMED) {
                        successCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    // Ignored
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        doneLatch.await(5, TimeUnit.SECONDS);
        executor.shutdown();

        assertThat(successCount.get()).isEqualTo(threads);

        HotelBooking dbBooking = bookingRepository.findById(booking.getId()).orElseThrow();
        assertThat(dbBooking.getBookingStatus()).isEqualTo(HotelBookingStatus.CONFIRMED);
        assertThat(dbBooking.getPaymentStatus()).isEqualTo(HotelPaymentStatus.PAID);
    }
}
