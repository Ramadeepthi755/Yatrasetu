package com.yatrasetu.service;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.web.dto.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class Phase35GuideBookingCompleteWorkflowTest {

    @Mock
    private ExperienceBookingRepository bookingRepository;
    @Mock
    private LocalHostRepository hostRepository;
    @Mock
    private ExperienceRepository experienceRepository;
    @Mock
    private DestinationRepository destinationRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private TripCheckinRepository checkinRepository;
    @Mock
    private TripSafetyIncidentRepository incidentRepository;
    @Mock
    private ExperienceReviewRepository reviewRepository;
    @Mock
    private BookingDisputeRepository disputeRepository;
    @Mock
    private ExperienceSupportingProviderRepository supportingProviderRepository;
    @Mock
    private BookingMessageRepository bookingMessageRepository;
    @Mock
    private LocalHostService localHostService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private com.yatrasetu.service.payment.PaymentProvider paymentProvider;

    @InjectMocks
    private ExperienceBookingService bookingService;

    private User touristUser;
    private User raviGuideUser;
    private LocalHost raviHost;
    private Destination tirupatiDestination;
    private Experience tirupatiWalkExperience;
    private UserPrincipal touristPrincipal;
    private UserPrincipal raviPrincipal;
    private UserPrincipal strangerPrincipal;

    @BeforeEach
    void setUp() {
        touristUser = User.builder()
                .id("usr-tourist-sih")
                .fullName("Demo Tourist")
                .email("tourist@yatrasetu.demo")
                .role(Role.TRAVELER)
                .build();

        raviGuideUser = User.builder()
                .id("usr-ravi-sih")
                .fullName("Ravi Kumar")
                .email("ravi.guide@yatrasetu.demo")
                .role(Role.PARTNER)
                .build();

        tirupatiDestination = Destination.builder()
                .id("dest-136")
                .destinationName("Tirupati")
                .latitude(BigDecimal.valueOf(13.6288))
                .longitude(BigDecimal.valueOf(79.4192))
                .build();

        raviHost = LocalHost.builder()
                .id("host-5")
                .name("Ravi Kumar")
                .user(raviGuideUser)
                .destination(tirupatiDestination)
                .roleTitle("Senior Seshachalam Heritage Historian")
                .isVerified(true)
                .rating(BigDecimal.valueOf(4.9))
                .experienceCount(180)
                .pricePerHour(BigDecimal.valueOf(500))
                .build();

        tirupatiWalkExperience = Experience.builder()
                .id("exp-tirupati-temple-walk")
                .title("Tirupati Seshachalam Foothills & Temple Heritage Walk")
                .destination(tirupatiDestination)
                .host(raviHost)
                .pricePerPerson(BigDecimal.valueOf(800))
                .durationHours(BigDecimal.valueOf(3.5))
                .isActive(true)
                .build();

        touristPrincipal = UserPrincipal.builder()
                .userId(touristUser.getId())
                .authUserId("auth-tourist-sih")
                .email(touristUser.getEmail())
                .role(Role.TRAVELER)
                .build();

        raviPrincipal = UserPrincipal.builder()
                .userId(raviGuideUser.getId())
                .authUserId("auth-ravi-sih")
                .email(raviGuideUser.getEmail())
                .role(Role.PARTNER)
                .build();

        strangerPrincipal = UserPrincipal.builder()
                .userId("usr-stranger")
                .authUserId("auth-stranger")
                .email("stranger@example.com")
                .role(Role.TRAVELER)
                .build();
    }

    @Test
    @DisplayName("1. Tourist creates guide booking: Authoritative Server Price, Validations, and REQUESTED State")
    void testCreateGuideBooking() {
        when(userRepository.findById("usr-tourist-sih")).thenReturn(Optional.of(touristUser));
        when(hostRepository.findById("host-5")).thenReturn(Optional.of(raviHost));
        when(experienceRepository.findById("exp-tirupati-temple-walk")).thenReturn(Optional.of(tirupatiWalkExperience));
        when(bookingRepository.findByTouristIdOrderByCreatedAtDesc("usr-tourist-sih")).thenReturn(Collections.emptyList());

        when(bookingRepository.save(any(ExperienceBooking.class))).thenAnswer(inv -> {
            ExperienceBooking b = inv.getArgument(0);
            b.setCreatedAt(Instant.now());
            b.setUpdatedAt(Instant.now());
            return b;
        });

        CreateExperienceBookingRequest req = CreateExperienceBookingRequest.builder()
                .hostId("host-5")
                .experienceId("exp-tirupati-temple-walk")
                .bookingDate(LocalDate.now().plusDays(2))
                .startTime("07:00 AM")
                .guestCount(3)
                .totalAmount(BigDecimal.valueOf(10)) // Client tamper attempt - should be ignored
                .customRequirements("Need English commentary and morning temple walk.")
                .build();

        ExperienceBookingDto dto = bookingService.createBooking(req, touristPrincipal);

        assertThat(dto).isNotNull();
        assertThat(dto.getStatus()).isEqualTo("REQUESTED");
        assertThat(dto.getPaymentStatus()).isEqualTo("PENDING");
        // 3 guests * 800 INR = 2400 INR (Server Authoritative)
        assertThat(dto.getTotalAmount()).isEqualByComparingTo(BigDecimal.valueOf(2400));
        assertThat(dto.getMeetingPointName()).isEqualTo("Kapila Theertham Main Entrance, Tirupati");

        verify(notificationService, times(1)).emitGuideBookingRequested(any(ExperienceBooking.class));
    }

    @Test
    @DisplayName("2. Ravi accepts booking: REQUESTED -> PAYMENT_PENDING and Tourist Notification")
    void testAcceptBookingWorkflow() {
        ExperienceBooking booking = ExperienceBooking.builder()
                .id("bkg-ravi-1")
                .bookingReference("YS-EXP-999001")
                .tourist(touristUser)
                .host(raviHost)
                .experience(tirupatiWalkExperience)
                .destination(tirupatiDestination)
                .status("REQUESTED")
                .paymentStatus("PENDING")
                .totalAmount(BigDecimal.valueOf(2400))
                .build();

        when(bookingRepository.findById("bkg-ravi-1")).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(ExperienceBooking.class))).thenAnswer(inv -> inv.getArgument(0));

        ExperienceBookingDto acceptedDto = bookingService.acceptBooking("bkg-ravi-1", raviGuideUser.getId());

        assertThat(acceptedDto).isNotNull();
        assertThat(acceptedDto.getStatus()).isEqualTo("PAYMENT_PENDING");
        verify(notificationService, times(1)).emitGuideBookingAccepted(any(ExperienceBooking.class));
    }

    @Test
    @DisplayName("3. Ravi rejects booking: REQUESTED -> REJECTED and Tourist Notification")
    void testRejectBookingWorkflow() {
        ExperienceBooking booking = ExperienceBooking.builder()
                .id("bkg-ravi-2")
                .bookingReference("YS-EXP-999002")
                .tourist(touristUser)
                .host(raviHost)
                .experience(tirupatiWalkExperience)
                .destination(tirupatiDestination)
                .status("REQUESTED")
                .paymentStatus("PENDING")
                .totalAmount(BigDecimal.valueOf(2400))
                .build();

        when(bookingRepository.findById("bkg-ravi-2")).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(ExperienceBooking.class))).thenAnswer(inv -> inv.getArgument(0));

        ExperienceBookingDto rejectedDto = bookingService.rejectBooking("bkg-ravi-2", raviGuideUser.getId(), "Fully booked for VIP temple darshan.");

        assertThat(rejectedDto).isNotNull();
        assertThat(rejectedDto.getStatus()).isEqualTo("REJECTED");
        verify(notificationService, times(1)).emitGuideBookingRejected(any(ExperienceBooking.class), eq("Fully booked for VIP temple darshan."));
    }

    @Test
    @DisplayName("4. State Machine Guard: Cannot accept already REJECTED booking")
    void testCannotAcceptRejectedBooking() {
        ExperienceBooking booking = ExperienceBooking.builder()
                .id("bkg-ravi-3")
                .bookingReference("YS-EXP-999003")
                .tourist(touristUser)
                .host(raviHost)
                .experience(tirupatiWalkExperience)
                .destination(tirupatiDestination)
                .status("REJECTED")
                .build();

        when(bookingRepository.findById("bkg-ravi-3")).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.acceptBooking("bkg-ravi-3", raviGuideUser.getId()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Booking cannot be accepted because it is currently in status: REJECTED");
    }

    @Test
    @DisplayName("5. Tourist payment confirmation: PAYMENT_PENDING -> CONFIRMED")
    void testConfirmPaymentWorkflow() {
        ExperienceBooking booking = ExperienceBooking.builder()
                .id("bkg-ravi-4")
                .bookingReference("YS-EXP-999004")
                .tourist(touristUser)
                .host(raviHost)
                .experience(tirupatiWalkExperience)
                .destination(tirupatiDestination)
                .status("PAYMENT_PENDING")
                .paymentStatus("PENDING")
                .totalAmount(BigDecimal.valueOf(2400))
                .build();

        when(bookingRepository.findById("bkg-ravi-4")).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(ExperienceBooking.class))).thenAnswer(inv -> inv.getArgument(0));

        ExperienceBookingDto confirmedDto = bookingService.confirmPayment(
                "bkg-ravi-4",
                "order_rzp_123",
                "pay_rzp_456",
                "sig_rzp_789",
                touristPrincipal
        );

        assertThat(confirmedDto).isNotNull();
        assertThat(confirmedDto.getStatus()).isEqualTo("CONFIRMED");
        assertThat(confirmedDto.getPaymentStatus()).isEqualTo("PAID");
        assertThat(confirmedDto.getRazorpayPaymentId()).isEqualTo("pay_rzp_456");
        assertThat(confirmedDto.getMeetingPointName()).isEqualTo("Kapila Theertham Main Entrance, Tirupati");

        verify(notificationService, times(1)).emitGuideBookingConfirmed(any(ExperienceBooking.class));
    }

    @Test
    @DisplayName("6. Two-sided check-in: CONFIRMED -> GUIDE_CHECKED_IN -> IN_PROGRESS (when tourist also checks in)")
    void testStartTripWorkflow() {
        ExperienceBooking booking = ExperienceBooking.builder()
                .id("bkg-ravi-5")
                .bookingReference("YS-EXP-999005")
                .tourist(touristUser)
                .host(raviHost)
                .experience(tirupatiWalkExperience)
                .destination(tirupatiDestination)
                .status("CONFIRMED")
                .paymentStatus("PAID")
                .build();

        when(bookingRepository.findById("bkg-ravi-5")).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(ExperienceBooking.class))).thenAnswer(inv -> inv.getArgument(0));

        // 6a. Guide checks in first -> status becomes GUIDE_CHECKED_IN
        ExperienceBookingDto guideCheckinDto = bookingService.startTrip("bkg-ravi-5", raviGuideUser.getId());
        assertThat(guideCheckinDto.getStatus()).isEqualTo("GUIDE_CHECKED_IN");

        // 6b. Traveler checks in -> both checked in -> status becomes IN_PROGRESS
        booking.setStatus("TRAVELER_CHECKED_IN");
        ExperienceBookingDto startedDto = bookingService.startTrip("bkg-ravi-5", raviGuideUser.getId());
        assertThat(startedDto.getStatus()).isEqualTo("IN_PROGRESS");
        verify(notificationService, times(1)).emitGuideTripStarted(any(ExperienceBooking.class));

        // State Guard: Cannot start from REQUESTED
        booking.setStatus("REQUESTED");
        assertThatThrownBy(() -> bookingService.startTrip("bkg-ravi-5", raviGuideUser.getId()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Trip can only be started from a confirmed or checked-in status");
    }

    @Test
    @DisplayName("7. Guide marks completion -> Tourist confirms completion -> Review Submission")
    void testCompletionAndReviewWorkflow() {
        ExperienceBooking booking = ExperienceBooking.builder()
                .id("bkg-ravi-6")
                .bookingReference("YS-EXP-999006")
                .tourist(touristUser)
                .host(raviHost)
                .experience(tirupatiWalkExperience)
                .destination(tirupatiDestination)
                .status("IN_PROGRESS")
                .paymentStatus("PAID")
                .build();

        when(bookingRepository.findById("bkg-ravi-6")).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(ExperienceBooking.class))).thenAnswer(inv -> inv.getArgument(0));

        // 1. Guide marks completion pending
        ExperienceBookingDto pendingDto = bookingService.markTripCompletionByPartner("bkg-ravi-6", raviGuideUser.getId());
        assertThat(pendingDto.getStatus()).isEqualTo("COMPLETION_PENDING");

        // 2. Tourist confirms trip completion
        ExperienceBookingDto completedDto = bookingService.confirmTripCompletion("bkg-ravi-6", touristPrincipal);
        assertThat(completedDto.getStatus()).isEqualTo("COMPLETED");
        verify(notificationService, times(1)).emitTouristConfirmedTripCompletion(any(ExperienceBooking.class));

        // 3. Tourist submits review
        when(userRepository.findById("usr-tourist-sih")).thenReturn(Optional.of(touristUser));
        when(reviewRepository.findByBookingId("bkg-ravi-6")).thenReturn(Optional.empty());
        when(reviewRepository.save(any(ExperienceReview.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reviewRepository.calculateAverageRatingForHost("host-5")).thenReturn(5.0);

        ExperienceReviewRequest reviewReq = ExperienceReviewRequest.builder()
                .rating(BigDecimal.valueOf(5.0))
                .title("Outstanding heritage walk with Ravi!")
                .comment("Deep knowledge of Seshachalam history and Tirumala legends.")
                .build();

        ExperienceBookingDto reviewedDto = bookingService.submitReview("bkg-ravi-6", reviewReq, touristPrincipal);
        assertThat(reviewedDto.getStatus()).isEqualTo("REVIEWED");

        // Duplicate review prevention: booking is now in REVIEWED status
        assertThatThrownBy(() -> bookingService.submitReview("bkg-ravi-6", reviewReq, touristPrincipal))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("A review has already been submitted");
    }

    @Test
    @DisplayName("8. Security & IDOR: Unauthorized user cannot view or complete actions on booking")
    void testSecurityAndIdorProtection() {
        ExperienceBooking booking = ExperienceBooking.builder()
                .id("bkg-ravi-7")
                .bookingReference("YS-EXP-999007")
                .tourist(touristUser)
                .host(raviHost)
                .experience(tirupatiWalkExperience)
                .status("CONFIRMED")
                .build();

        when(bookingRepository.findById("bkg-ravi-7")).thenReturn(Optional.of(booking));

        // Stranger cannot view booking
        assertThatThrownBy(() -> bookingService.getBookingById("bkg-ravi-7", strangerPrincipal))
                .isInstanceOf(AccessDeniedException.class);

        // Stranger cannot accept booking
        assertThatThrownBy(() -> bookingService.acceptBooking("bkg-ravi-7", "usr-stranger"))
                .isInstanceOf(AccessDeniedException.class);

        // Stranger cannot confirm completion
        assertThatThrownBy(() -> bookingService.confirmTripCompletion("bkg-ravi-7", strangerPrincipal))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("Test A: COMPLETION_PENDING + correct traveler -> confirm -> COMPLETED with no exception")
    void testA_CompletionPending_CorrectTraveler() {
        ExperienceBooking booking = ExperienceBooking.builder()
                .id("bkg-reg-a")
                .bookingReference("YS-REG-001")
                .tourist(touristUser)
                .host(raviHost)
                .experience(tirupatiWalkExperience)
                .status("COMPLETION_PENDING")
                .paymentStatus("PAID")
                .build();

        when(bookingRepository.findById("bkg-reg-a")).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(ExperienceBooking.class))).thenAnswer(inv -> inv.getArgument(0));

        ExperienceBookingDto res = bookingService.confirmTripCompletion("bkg-reg-a", touristPrincipal);
        assertThat(res.getStatus()).isEqualTo("COMPLETED");
        verify(notificationService, atLeastOnce()).emitTouristConfirmedTripCompletion(any(ExperienceBooking.class));
    }

    @Test
    @DisplayName("Test B: COMPLETION_PENDING + wrong traveler -> 403 Forbidden -> never COMPLETED")
    void testB_CompletionPending_WrongTraveler() {
        ExperienceBooking booking = ExperienceBooking.builder()
                .id("bkg-reg-b")
                .bookingReference("YS-REG-002")
                .tourist(touristUser)
                .host(raviHost)
                .experience(tirupatiWalkExperience)
                .status("COMPLETION_PENDING")
                .paymentStatus("PAID")
                .build();

        when(bookingRepository.findById("bkg-reg-b")).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.confirmTripCompletion("bkg-reg-b", strangerPrincipal))
                .isInstanceOf(AccessDeniedException.class);
        assertThat(booking.getStatus()).isEqualTo("COMPLETION_PENDING");
    }

    @Test
    @DisplayName("Test C: Invalid state (REQUESTED) + traveler confirm -> reject with proper 4xx (IllegalStateException)")
    void testC_InvalidState_Reject4xx() {
        ExperienceBooking booking = ExperienceBooking.builder()
                .id("bkg-reg-c")
                .bookingReference("YS-REG-003")
                .tourist(touristUser)
                .host(raviHost)
                .experience(tirupatiWalkExperience)
                .status("REQUESTED")
                .paymentStatus("PENDING")
                .build();

        when(bookingRepository.findById("bkg-reg-c")).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.confirmTripCompletion("bkg-reg-c", touristPrincipal))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Current status: REQUESTED");
    }

    @Test
    @DisplayName("Test D: COMPLETED + repeat confirm -> idempotent safe response")
    void testD_Completed_RepeatConfirm_Idempotent() {
        ExperienceBooking booking = ExperienceBooking.builder()
                .id("bkg-reg-d")
                .bookingReference("YS-REG-004")
                .tourist(touristUser)
                .host(raviHost)
                .experience(tirupatiWalkExperience)
                .status("COMPLETED")
                .paymentStatus("PAID")
                .build();

        when(bookingRepository.findById("bkg-reg-d")).thenReturn(Optional.of(booking));

        ExperienceBookingDto res = bookingService.confirmTripCompletion("bkg-reg-d", touristPrincipal);
        assertThat(res.getStatus()).isEqualTo("COMPLETED");
    }

    @Test
    @DisplayName("Test E: COMPLETION_PENDING + CASH -> final milestone state updated correctly")
    void testE_CompletionPending_CashMilestone() {
        ExperienceBooking booking = ExperienceBooking.builder()
                .id("bkg-reg-e")
                .bookingReference("YS-REG-005")
                .tourist(touristUser)
                .host(raviHost)
                .experience(tirupatiWalkExperience)
                .paymentMethod("CASH")
                .cashMilestone1Paid(true)
                .cashMilestone2Paid(false)
                .status("COMPLETION_PENDING")
                .paymentStatus("PARTIALLY_PAID")
                .build();

        when(bookingRepository.findById("bkg-reg-e")).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(ExperienceBooking.class))).thenAnswer(inv -> inv.getArgument(0));

        ExperienceBookingDto res = bookingService.confirmTripCompletion("bkg-reg-e", touristPrincipal);
        assertThat(res.getStatus()).isEqualTo("COMPLETED");
        assertThat(booking.getCashMilestone2Paid()).isTrue();
        assertThat(booking.getPaymentStatus()).isEqualTo("PAID");
    }

    @Test
    @DisplayName("Test F: COMPLETION_PENDING + ONLINE/RAZORPAY -> completion succeeds without tampering payment status")
    void testF_CompletionPending_OnlinePayment() {
        ExperienceBooking booking = ExperienceBooking.builder()
                .id("bkg-reg-f")
                .bookingReference("YS-REG-006")
                .tourist(touristUser)
                .host(raviHost)
                .experience(tirupatiWalkExperience)
                .paymentMethod("ONLINE")
                .razorpayPaymentId("pay_sih_test_123")
                .status("COMPLETION_PENDING")
                .paymentStatus("PAID")
                .build();

        when(bookingRepository.findById("bkg-reg-f")).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(ExperienceBooking.class))).thenAnswer(inv -> inv.getArgument(0));

        ExperienceBookingDto res = bookingService.confirmTripCompletion("bkg-reg-f", touristPrincipal);
        assertThat(res.getStatus()).isEqualTo("COMPLETED");
        assertThat(booking.getPaymentStatus()).isEqualTo("PAID");
        assertThat(booking.getRazorpayPaymentId()).isEqualTo("pay_sih_test_123");
    }

    @Test
    @DisplayName("Test G: Successful confirmation emits guide notification")
    void testG_EmitsGuideNotification() {
        ExperienceBooking booking = ExperienceBooking.builder()
                .id("bkg-reg-g")
                .bookingReference("YS-REG-007")
                .tourist(touristUser)
                .host(raviHost)
                .experience(tirupatiWalkExperience)
                .status("COMPLETION_PENDING")
                .paymentStatus("PAID")
                .build();

        when(bookingRepository.findById("bkg-reg-g")).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(ExperienceBooking.class))).thenAnswer(inv -> inv.getArgument(0));

        bookingService.confirmTripCompletion("bkg-reg-g", touristPrincipal);
        verify(notificationService, atLeastOnce()).emitTouristConfirmedTripCompletion(any(ExperienceBooking.class));
    }

    @Test
    @DisplayName("Test H: Successful completion allows authorized traveler review")
    void testH_AllowsAuthorizedTravelerReview() {
        ExperienceBooking booking = ExperienceBooking.builder()
                .id("bkg-reg-h")
                .bookingReference("YS-REG-008")
                .tourist(touristUser)
                .host(raviHost)
                .experience(tirupatiWalkExperience)
                .status("COMPLETED")
                .paymentStatus("PAID")
                .build();

        when(bookingRepository.findById("bkg-reg-h")).thenReturn(Optional.of(booking));
        when(userRepository.findById("usr-tourist-sih")).thenReturn(Optional.of(touristUser));
        when(reviewRepository.findByBookingId("bkg-reg-h")).thenReturn(Optional.empty());
        when(reviewRepository.save(any(ExperienceReview.class))).thenAnswer(inv -> inv.getArgument(0));
        when(bookingRepository.save(any(ExperienceBooking.class))).thenAnswer(inv -> inv.getArgument(0));

        ExperienceReviewRequest reviewReq = ExperienceReviewRequest.builder()
                .rating(BigDecimal.valueOf(5.0))
                .title("Great Tour!")
                .comment("Learned so much from Ravi.")
                .build();

        ExperienceBookingDto res = bookingService.submitReview("bkg-reg-h", reviewReq, touristPrincipal);
        assertThat(res.getStatus()).isEqualTo("REVIEWED");
    }

    @Test
    @DisplayName("Test I: createPaymentOrder returns server-authoritative payment parameters")
    void testI_CreatePaymentOrder() {
        ExperienceBooking booking = ExperienceBooking.builder()
                .id("bkg-pay-order")
                .bookingReference("YS-EXP-ORDER-1")
                .tourist(touristUser)
                .host(raviHost)
                .experience(tirupatiWalkExperience)
                .status("ACCEPTED")
                .paymentStatus("PENDING")
                .totalAmount(BigDecimal.valueOf(3600.00))
                .currency("INR")
                .build();

        when(bookingRepository.findById("bkg-pay-order")).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(ExperienceBooking.class))).thenAnswer(inv -> inv.getArgument(0));

        var res = bookingService.createPaymentOrder("bkg-pay-order", touristPrincipal);
        assertThat(res.getBookingReference()).isEqualTo("YS-EXP-ORDER-1");
        assertThat(res.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(3600.00));
        assertThat(res.getAmountInPaise()).isEqualTo(360000L);
        assertThat(res.getCurrency()).isEqualTo("INR");
        assertThat(res.getProviderOrderId()).isNotNull();
    }

    @Test
    @DisplayName("Test J: confirmPayment with valid credentials transitions booking to CONFIRMED and PAID")
    void testJ_ConfirmPaymentSuccess() {
        ExperienceBooking booking = ExperienceBooking.builder()
                .id("bkg-pay-confirm")
                .bookingReference("YS-EXP-CONFIRM-1")
                .tourist(touristUser)
                .host(raviHost)
                .experience(tirupatiWalkExperience)
                .status("ACCEPTED")
                .paymentStatus("PENDING")
                .totalAmount(BigDecimal.valueOf(3600.00))
                .build();

        when(bookingRepository.findById("bkg-pay-confirm")).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(ExperienceBooking.class))).thenAnswer(inv -> inv.getArgument(0));

        ExperienceBookingDto res = bookingService.confirmPayment(
                "bkg-pay-confirm",
                "order_test_123",
                "pay_test_456",
                "sig_test_789",
                touristPrincipal
        );

        assertThat(res.getStatus()).isEqualTo("CONFIRMED");
        assertThat(res.getPaymentStatus()).isEqualTo("PAID");
        assertThat(res.getPaymentMethod()).isEqualTo("ONLINE");
        verify(notificationService, atLeastOnce()).emitGuideBookingConfirmed(any(ExperienceBooking.class));
    }

    @Test
    @DisplayName("Test K: confirmPayment rejects invalid signature when payment provider is configured")
    void testK_ConfirmPaymentRejectsInvalidSignature() {
        ExperienceBooking booking = ExperienceBooking.builder()
                .id("bkg-pay-invalid")
                .bookingReference("YS-EXP-INVALID-1")
                .tourist(touristUser)
                .host(raviHost)
                .experience(tirupatiWalkExperience)
                .status("ACCEPTED")
                .paymentStatus("PENDING")
                .totalAmount(BigDecimal.valueOf(3600.00))
                .build();

        when(bookingRepository.findById("bkg-pay-invalid")).thenReturn(Optional.of(booking));
        when(paymentProvider.isAvailable()).thenReturn(true);
        when(paymentProvider.verifyPaymentSignature("order_bad", "pay_bad", "sig_bad")).thenReturn(false);

        assertThatThrownBy(() -> bookingService.confirmPayment(
                "bkg-pay-invalid",
                "order_bad",
                "pay_bad",
                "sig_bad",
                touristPrincipal
        )).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Cryptographic payment signature verification failed");
    }
}
