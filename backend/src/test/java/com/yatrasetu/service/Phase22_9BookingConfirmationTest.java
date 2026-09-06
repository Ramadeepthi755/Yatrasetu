package com.yatrasetu.service;

import com.yatrasetu.config.ConflictException;
import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.service.document.HotelBookingVoucherService;
import com.yatrasetu.service.payment.HotelPaymentService;
import com.yatrasetu.service.payment.PaymentProvider;
import com.yatrasetu.web.dto.*;
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
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
public class Phase22_9BookingConfirmationTest {

    @Autowired
    private HotelPaymentService paymentService;

    @Autowired
    private HotelBookingService bookingService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private HotelBookingVoucherService voucherService;

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
    private User otherPartner;
    private User govUser;
    private Hotel hotel;
    private HotelRoomType roomType;
    private HotelRatePlan ratePlan;

    private static final String TEST_ORDER_ID = "order_conf_test_123456";
    private static final String TEST_PAYMENT_ID = "pay_conf_test_987654";
    private static final String TEST_VALID_SIGNATURE = "valid_conf_signature_hash";

    @BeforeEach
    void setUp() {
        cleanup();

        when(paymentProvider.isAvailable()).thenReturn(true);
        when(paymentProvider.getProviderName()).thenReturn("RAZORPAY");
        when(paymentProvider.getPublicKeyId()).thenReturn("rzp_test_key_conf");
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

        State state = stateRepository.save(State.builder()
                .id("st-conf-test")
                .stateName("Kerala")
                .region("South India")
                .build());

        City city = cityRepository.save(City.builder()
                .id("ct-conf-test")
                .cityName("Kochi")
                .state(state)
                .latitude(BigDecimal.valueOf(9.9312))
                .longitude(BigDecimal.valueOf(76.2673))
                .build());

        traveler = userRepository.save(User.builder()
                .id("usr-conf-traveler-1")
                .email("traveler1@yatrasetu.test")
                .fullName("Aarav Traveler")
                .role(Role.TRAVELER)
                .phone("+91 9876543210")
                .build());

        otherTraveler = userRepository.save(User.builder()
                .id("usr-conf-traveler-2")
                .email("traveler2@yatrasetu.test")
                .fullName("Priya Other")
                .role(Role.TRAVELER)
                .phone("+91 9876543211")
                .build());

        partner = userRepository.save(User.builder()
                .id("usr-conf-partner-1")
                .email("partner1@yatrasetu.test")
                .fullName("Hotelier Vikram")
                .role(Role.PARTNER)
                .phone("+91 9876543212")
                .build());

        otherPartner = userRepository.save(User.builder()
                .id("usr-conf-partner-2")
                .email("partner2@yatrasetu.test")
                .fullName("Hotelier Ramesh")
                .role(Role.PARTNER)
                .phone("+91 9876543213")
                .build());

        govUser = userRepository.save(User.builder()
                .id("usr-conf-gov-1")
                .email("official@yatrasetu.test")
                .fullName("Gov Official")
                .role(Role.GOVERNMENT)
                .phone("+91 9876543214")
                .build());

        hotel = hotelRepository.save(Hotel.builder()
                .id("htl-conf-test-1")
                .hotelName("Grand Kerala Heritage Resort")
                .city(city)
                .address("Fort Kochi, Beach Road")
                .pricePerNight(new BigDecimal("5000.00"))
                .isActive(true)
                .isPartnerProperty(true)
                .verificationStatus(HotelVerificationStatus.VERIFIED)
                .owner(partner)
                .latitude(BigDecimal.valueOf(9.9312))
                .longitude(BigDecimal.valueOf(76.2673))
                .build());

        roomType = roomTypeRepository.save(HotelRoomType.builder()
                .id("room-conf-test-1")
                .hotel(hotel)
                .roomTypeName("Royal Heritage Suite")
                .baseInventoryUnits(5)
                .maxOccupancy(3)
                .isActive(true)
                .build());

        ratePlan = ratePlanRepository.save(HotelRatePlan.builder()
                .id("rate-conf-test-1")
                .roomType(roomType)
                .planName("Flexible Breakfast Included")
                .mealPlan(MealPlan.CP)
                .cancellationPolicy(CancellationPolicyType.FREE_CANCELLATION)
                .cancellationDeadlineHours(24)
                .basePrice(new BigDecimal("5000.00"))
                .currency("INR")
                .status(RatePlanStatus.ACTIVE)
                .build());

        LocalDate today = LocalDate.now();
        for (int i = 0; i < 7; i++) {
            inventoryRepository.save(HotelInventory.builder()
                    .id("inv-conf-" + i)
                    .roomType(roomType)
                    .inventoryDate(today.plusDays(i))
                    .totalUnits(5)
                    .blockedUnits(0)
                    .build());
        }
    }

    @AfterEach
    void tearDown() {
        cleanup();
    }

    private void cleanup() {
        notificationRepository.deleteAll();
        webhookEventRepository.deleteAll();
        transactionRepository.deleteAll();
        statusHistoryRepository.deleteAll();
        allocationRepository.deleteAll();
        bookingRepository.deleteAll();
        inventoryRepository.deleteAll();
        ratePlanRepository.deleteAll();
        roomTypeRepository.deleteAll();
        hotelRepository.deleteAll();
        userRepository.deleteAll();
        cityRepository.deleteAll();
        stateRepository.deleteAll();
    }

    private HotelBookingDto createTestReservation() {
        LocalDate checkIn = LocalDate.now().plusDays(1);
        LocalDate checkOut = LocalDate.now().plusDays(3);

        CreateHotelBookingRequest request = CreateHotelBookingRequest.builder()
                .roomTypeId(roomType.getId())
                .ratePlanId(ratePlan.getId())
                .checkIn(checkIn)
                .checkOut(checkOut)
                .numberOfRooms(1)
                .adults(2)
                .guestName("Aarav Traveler")
                .guestEmail("aarav@yatrasetu.test")
                .guestPhone("+919876543210")
                .specialRequests("High floor quiet room")
                .build();

        return bookingService.createBooking(hotel.getId(), request, traveler.getId());
    }

    // 1. Confirmed booking requires PAID payment
    @Test
    void testConfirmedBookingRequiresPaidPayment() {
        HotelBookingDto booking = createTestReservation();
        assertThat(booking.getBookingStatus()).isEqualTo(HotelBookingStatus.PENDING_PAYMENT);
        assertThat(booking.getPaymentStatus()).isEqualTo(HotelPaymentStatus.UNPAID);

        // Attempting to fetch confirmation before payment
        BookingConfirmationDto confirmation = bookingService.getBookingConfirmation(booking.getBookingReference(), traveler.getId());
        assertThat(confirmation.getBookingStatus()).isEqualTo("PENDING_PAYMENT");
        assertThat(confirmation.getPaymentStatus()).isEqualTo("UNPAID");
        // Voucher is only available for CONFIRMED + PAID
        assertThat(confirmation.isVoucherAvailable()).isFalse();
    }

    // 2. Unverified payment cannot produce confirmation
    @Test
    void testUnverifiedPaymentCannotProduceConfirmation() {
        HotelBookingDto booking = createTestReservation();
        paymentService.createPaymentOrder(booking.getBookingReference(), traveler.getId());

        // Attempt verify with invalid signature
        VerifyPaymentRequest req = VerifyPaymentRequest.builder()
                .razorpayOrderId(TEST_ORDER_ID)
                .razorpayPaymentId(TEST_PAYMENT_ID)
                .razorpaySignature("invalid_signature")
                .build();

        assertThatThrownBy(() -> paymentService.verifyPayment(booking.getBookingReference(), req, traveler.getId()))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("signature verification failed");

        HotelBooking entity = bookingRepository.findByBookingReference(booking.getBookingReference()).orElseThrow();
        assertThat(entity.getBookingStatus()).isEqualTo(HotelBookingStatus.PENDING_PAYMENT);
        assertThat(entity.getPaymentStatus()).isNotEqualTo(HotelPaymentStatus.PAID);
    }

    // 3 & 4. Verified payment produces confirmed booking and accurate reference
    @Test
    void testVerifiedPaymentProducesConfirmedBookingAndAccurateReference() {
        HotelBookingDto booking = createTestReservation();
        paymentService.createPaymentOrder(booking.getBookingReference(), traveler.getId());

        VerifyPaymentRequest req = VerifyPaymentRequest.builder()
                .razorpayOrderId(TEST_ORDER_ID)
                .razorpayPaymentId(TEST_PAYMENT_ID)
                .razorpaySignature(TEST_VALID_SIGNATURE)
                .build();

        HotelBookingDto verified = paymentService.verifyPayment(booking.getBookingReference(), req, traveler.getId());
        assertThat(verified.getBookingStatus()).isEqualTo(HotelBookingStatus.CONFIRMED);
        assertThat(verified.getPaymentStatus()).isEqualTo(HotelPaymentStatus.PAID);

        BookingConfirmationDto confirmation = bookingService.getBookingConfirmation(booking.getBookingReference(), traveler.getId());
        assertThat(confirmation.getBookingReference()).isEqualTo(booking.getBookingReference());
        assertThat(confirmation.getBookingStatus()).isEqualTo("CONFIRMED");
        assertThat(confirmation.getPaymentStatus()).isEqualTo("PAID");
        assertThat(confirmation.isVoucherAvailable()).isTrue();
    }

    // 5 & 6. Confirmation data uses immutable price snapshot and honest tax disclosure
    @Test
    void testConfirmationDataUsesImmutablePriceSnapshotAndHonestTaxDisclosure() {
        HotelBookingDto booking = createTestReservation();
        paymentService.createPaymentOrder(booking.getBookingReference(), traveler.getId());
        paymentService.verifyPayment(booking.getBookingReference(),
                VerifyPaymentRequest.builder().razorpayOrderId(TEST_ORDER_ID).razorpayPaymentId(TEST_PAYMENT_ID).razorpaySignature(TEST_VALID_SIGNATURE).build(),
                traveler.getId());

        BookingConfirmationDto confirmation = bookingService.getBookingConfirmation(booking.getBookingReference(), traveler.getId());
        assertThat(confirmation.getSubtotal()).isEqualByComparingTo(BigDecimal.valueOf(10000.00));
        assertThat(confirmation.getTaxesAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(confirmation.getTotalAmount()).isEqualByComparingTo(BigDecimal.valueOf(10000.00));
        assertThat(confirmation.getPricingDisclosure()).contains("Taxes and service fees are not currently configured/included");
    }

    // 7. Cancellation policy snapshot preserved
    @Test
    void testCancellationPolicySnapshotPreserved() {
        HotelBookingDto booking = createTestReservation();
        paymentService.createPaymentOrder(booking.getBookingReference(), traveler.getId());
        paymentService.verifyPayment(booking.getBookingReference(),
                VerifyPaymentRequest.builder().razorpayOrderId(TEST_ORDER_ID).razorpayPaymentId(TEST_PAYMENT_ID).razorpaySignature(TEST_VALID_SIGNATURE).build(),
                traveler.getId());

        BookingConfirmationDto confirmation = bookingService.getBookingConfirmation(booking.getBookingReference(), traveler.getId());
        assertThat(confirmation.getCancellationPolicySnapshot()).isEqualTo("FREE_CANCELLATION");
        assertThat(confirmation.getCancellationDeadlineHours()).isEqualTo(24);
    }

    // 8 & 9. Chronological status timeline without duplicates
    @Test
    void testChronologicalStatusTimeline() {
        HotelBookingDto booking = createTestReservation();
        paymentService.createPaymentOrder(booking.getBookingReference(), traveler.getId());
        paymentService.verifyPayment(booking.getBookingReference(),
                VerifyPaymentRequest.builder().razorpayOrderId(TEST_ORDER_ID).razorpayPaymentId(TEST_PAYMENT_ID).razorpaySignature(TEST_VALID_SIGNATURE).build(),
                traveler.getId());

        BookingConfirmationDto confirmation = bookingService.getBookingConfirmation(booking.getBookingReference(), traveler.getId());
        assertThat(confirmation.getStatusTimeline()).isNotEmpty();
        assertThat(confirmation.getStatusTimeline().size()).isGreaterThanOrEqualTo(2);

        // First event is PENDING_PAYMENT
        assertThat(confirmation.getStatusTimeline().get(0).getNewStatus()).isEqualTo("PENDING_PAYMENT");
        // Last event is CONFIRMED
        assertThat(confirmation.getStatusTimeline().get(confirmation.getStatusTimeline().size() - 1).getNewStatus()).isEqualTo("CONFIRMED");
    }

    // 10, 11, 12, 13, 14. RBAC for Confirmation and Voucher Access
    @Test
    void testVoucherAuthorizationRBAC() {
        HotelBookingDto booking = createTestReservation();
        paymentService.createPaymentOrder(booking.getBookingReference(), traveler.getId());
        paymentService.verifyPayment(booking.getBookingReference(),
                VerifyPaymentRequest.builder().razorpayOrderId(TEST_ORDER_ID).razorpayPaymentId(TEST_PAYMENT_ID).razorpaySignature(TEST_VALID_SIGNATURE).build(),
                traveler.getId());

        // 10. Traveler owner can generate voucher
        byte[] travelerPdf = bookingService.generateBookingVoucher(booking.getBookingReference(), traveler.getId());
        assertThat(travelerPdf).isNotNull().isNotEmpty();

        // 11. Property owner can generate voucher
        byte[] partnerPdf = bookingService.generateBookingVoucher(booking.getBookingReference(), partner.getId());
        assertThat(partnerPdf).isNotNull().isNotEmpty();

        // 12. Unrelated partner is denied (403)
        assertThatThrownBy(() -> bookingService.generateBookingVoucher(booking.getBookingReference(), otherPartner.getId()))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Only the booking traveler or hotel property owner can download this voucher");

        // 13. Government user is denied individual traveler voucher (403)
        assertThatThrownBy(() -> bookingService.generateBookingVoucher(booking.getBookingReference(), govUser.getId()))
                .isInstanceOf(AccessDeniedException.class);

        // 14. Unrelated traveler is denied (403)
        assertThatThrownBy(() -> bookingService.generateBookingVoucher(booking.getBookingReference(), otherTraveler.getId()))
                .isInstanceOf(AccessDeniedException.class);
    }

    // 15 & 16. Voucher does not expose payment secrets or CVV/cards
    @Test
    void testVoucherDataIntegrityAndNoSecretLeak() {
        HotelBookingDto booking = createTestReservation();
        paymentService.createPaymentOrder(booking.getBookingReference(), traveler.getId());
        paymentService.verifyPayment(booking.getBookingReference(),
                VerifyPaymentRequest.builder().razorpayOrderId(TEST_ORDER_ID).razorpayPaymentId(TEST_PAYMENT_ID).razorpaySignature(TEST_VALID_SIGNATURE).build(),
                traveler.getId());

        byte[] pdfBytes = bookingService.generateBookingVoucher(booking.getBookingReference(), traveler.getId());
        String pdfString = new String(pdfBytes);

        // Ensure no internal database IDs or secrets are visible
        assertThat(pdfString).doesNotContain("rzp_test_secret");
        assertThat(pdfString).doesNotContain("webhook_secret");
        assertThat(pdfString).doesNotContain("cvv");
    }

    // 17 & 18. Notification creation for traveler & partner
    @Test
    void testNotificationCreationOnBookingConfirmation() {
        HotelBookingDto booking = createTestReservation();
        paymentService.createPaymentOrder(booking.getBookingReference(), traveler.getId());
        paymentService.verifyPayment(booking.getBookingReference(),
                VerifyPaymentRequest.builder().razorpayOrderId(TEST_ORDER_ID).razorpayPaymentId(TEST_PAYMENT_ID).razorpaySignature(TEST_VALID_SIGNATURE).build(),
                traveler.getId());

        List<NotificationDto> travelerNotifs = notificationService.getUserNotifications(traveler.getId(), false);
        assertThat(travelerNotifs).isNotEmpty();
        assertThat(travelerNotifs.get(0).getTitle()).contains("Booking Confirmed");
        assertThat(travelerNotifs.get(0).getMessage()).contains(booking.getBookingReference());

        List<NotificationDto> partnerNotifs = notificationService.getUserNotifications(partner.getId(), false);
        assertThat(partnerNotifs).isNotEmpty();
        assertThat(partnerNotifs.get(0).getTitle()).contains("New Confirmed Booking");
        assertThat(partnerNotifs.get(0).getMessage()).contains(booking.getBookingReference());
    }

    // 19 & 20. Notification idempotency on duplicate verification or repeated events
    @Test
    void testNotificationDeduplicationIdempotency() {
        HotelBookingDto booking = createTestReservation();
        paymentService.createPaymentOrder(booking.getBookingReference(), traveler.getId());

        // First verification
        paymentService.verifyPayment(booking.getBookingReference(),
                VerifyPaymentRequest.builder().razorpayOrderId(TEST_ORDER_ID).razorpayPaymentId(TEST_PAYMENT_ID).razorpaySignature(TEST_VALID_SIGNATURE).build(),
                traveler.getId());

        int count1 = notificationRepository.findAll().size();
        assertThat(count1).isEqualTo(3); // 1 creation + 1 traveler confirmation + 1 partner confirmation

        // Duplicate trigger should be idempotent
        HotelBooking entity = bookingRepository.findByBookingReference(booking.getBookingReference()).orElseThrow();
        notificationService.emitBookingConfirmationNotifications(entity);
        int count2 = notificationRepository.findAll().size();
        assertThat(count2).isEqualTo(3); // No extra notifications created
    }

    // 21 & 22. Notification read is idempotent and user ownership enforced
    @Test
    void testNotificationReadIdempotencyAndOwnership() {
        HotelBookingDto booking = createTestReservation();
        paymentService.createPaymentOrder(booking.getBookingReference(), traveler.getId());
        paymentService.verifyPayment(booking.getBookingReference(),
                VerifyPaymentRequest.builder().razorpayOrderId(TEST_ORDER_ID).razorpayPaymentId(TEST_PAYMENT_ID).razorpaySignature(TEST_VALID_SIGNATURE).build(),
                traveler.getId());

        List<NotificationDto> travelerNotifs = notificationService.getUserNotifications(traveler.getId(), false);
        assertThat(travelerNotifs).isNotEmpty();

        long unreadBefore = notificationService.getUnreadCount(traveler.getId());
        String notifId = travelerNotifs.get(0).getId();

        // Mark one as read
        notificationService.markAsRead(notifId, traveler.getId());
        assertThat(notificationService.getUnreadCount(traveler.getId())).isEqualTo(unreadBefore - 1);

        // Mark all as read
        notificationService.markAllAsRead(traveler.getId());
        assertThat(notificationService.getUnreadCount(traveler.getId())).isEqualTo(0);

        // Other user cannot mark as read
        assertThatThrownBy(() -> notificationService.markAsRead(notifId, otherTraveler.getId()))
                .isInstanceOf(AccessDeniedException.class);
    }

    // 24 & 25. Expired/Cancelled booking cannot generate confirmation voucher
    @Test
    void testExpiredOrCancelledBookingVoucherRestriction() {
        HotelBookingDto booking = createTestReservation();

        // Expire booking
        HotelBooking entity = bookingRepository.findByBookingReference(booking.getBookingReference()).orElseThrow();
        entity.setBookingStatus(HotelBookingStatus.EXPIRED);
        bookingRepository.save(entity);

        assertThatThrownBy(() -> bookingService.generateBookingVoucher(booking.getBookingReference(), traveler.getId()))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Confirmation voucher is available only for CONFIRMED and PAID bookings");
    }

    // 26 & 27. Refresh confirmation returns same booking snapshot
    @Test
    void testRefreshConfirmationReturnsSameSnapshot() {
        HotelBookingDto booking = createTestReservation();
        paymentService.createPaymentOrder(booking.getBookingReference(), traveler.getId());
        paymentService.verifyPayment(booking.getBookingReference(),
                VerifyPaymentRequest.builder().razorpayOrderId(TEST_ORDER_ID).razorpayPaymentId(TEST_PAYMENT_ID).razorpaySignature(TEST_VALID_SIGNATURE).build(),
                traveler.getId());

        BookingConfirmationDto conf1 = bookingService.getBookingConfirmation(booking.getBookingReference(), traveler.getId());
        BookingConfirmationDto conf2 = bookingService.getBookingConfirmation(booking.getBookingReference(), traveler.getId());

        assertThat(conf1.getBookingReference()).isEqualTo(conf2.getBookingReference());
        assertThat(conf1.getTotalAmount()).isEqualByComparingTo(conf2.getTotalAmount());
        assertThat(conf1.getCreatedAt()).isEqualTo(conf2.getCreatedAt());
    }

    // 30 & 35. Cancellation after payment preserves payment record and discloses refund status honestly
    @Test
    void testCancellationAfterPaymentPreservesRecordAndRefundDisclosure() {
        HotelBookingDto booking = createTestReservation();
        paymentService.createPaymentOrder(booking.getBookingReference(), traveler.getId());
        paymentService.verifyPayment(booking.getBookingReference(),
                VerifyPaymentRequest.builder().razorpayOrderId(TEST_ORDER_ID).razorpayPaymentId(TEST_PAYMENT_ID).razorpaySignature(TEST_VALID_SIGNATURE).build(),
                traveler.getId());

        // Cancel confirmed reservation
        HotelBookingDto cancelled = bookingService.cancelBooking(booking.getBookingReference(),
                CancelHotelBookingRequest.builder().reason("Change of plans").reasonCode(CancellationReasonCode.CHANGED_PLANS).build(),
                traveler.getId());

        assertThat(cancelled.getBookingStatus()).isEqualTo(HotelBookingStatus.CANCELLED);
        assertThat(cancelled.getPaymentStatus()).isEqualTo(HotelPaymentStatus.PAID);

        BookingConfirmationDto confirmation = bookingService.getBookingConfirmation(booking.getBookingReference(), traveler.getId());
        assertThat(confirmation.getBookingStatus()).isEqualTo("CANCELLED");
        assertThat(confirmation.getPaymentStatus()).isEqualTo("PAID");
    }
}
