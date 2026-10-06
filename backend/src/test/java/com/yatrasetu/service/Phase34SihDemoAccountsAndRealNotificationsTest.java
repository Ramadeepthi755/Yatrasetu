package com.yatrasetu.service;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.web.dto.*;
import com.yatrasetu.web.rest.NotificationController;
import com.yatrasetu.web.rest.PartnerParticipationController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class Phase34SihDemoAccountsAndRealNotificationsTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HotelBookingRepository hotelBookingRepository;

    @Mock
    private LocalHostRepository localHostRepository;

    @Mock
    private ExperienceBookingRepository experienceBookingRepository;

    @Mock
    private ExperienceRepository experienceRepository;

    @Mock
    private DestinationRepository destinationRepository;

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
    private HotelRepository hotelRepository;

    @Mock
    private com.yatrasetu.service.payment.PaymentProvider paymentProvider;

    private NotificationService notificationService;
    private ExperienceBookingService experienceBookingService;
    private NotificationController notificationController;
    private PartnerParticipationController participationController;

    // Identities
    private User touristUser;
    private User guideUser;
    private User cultureHostUser;
    private User hotelPartnerUser;

    private LocalHost raviGuideHost;
    private LocalHost lakshmiArtisanHost;

    private Destination tirupatiDest;
    private City tirupatiCity;
    private State apState;

    private Experience tirupatiHeritageWalk;
    private Hotel tirupatiGrandHotel;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService(
                notificationRepository,
                userRepository,
                hotelBookingRepository,
                localHostRepository
        );

        experienceBookingService = new ExperienceBookingService(
                experienceBookingRepository,
                localHostRepository,
                experienceRepository,
                destinationRepository,
                userRepository,
                checkinRepository,
                incidentRepository,
                reviewRepository,
                disputeRepository,
                supportingProviderRepository,
                bookingMessageRepository,
                localHostService,
                notificationService,
                paymentProvider
        );

        notificationController = new NotificationController(notificationService);

        participationController = new PartnerParticipationController(
                supportingProviderRepository,
                experienceRepository,
                localHostRepository,
                userRepository,
                hotelRepository,
                notificationService
        );

        // 1. Tourist
        touristUser = User.builder()
                .id("usr-sih-tourist")
                .authUserId("a0000000-0000-0000-0000-000000000001")
                .email("tourist@yatrasetu.demo")
                .fullName("SIH Demo Tourist")
                .role(Role.TRAVELER)
                .verified(true)
                .build();

        // 2. Guide: Ravi Kumar
        guideUser = User.builder()
                .id("usr-sih-guide-ravi")
                .authUserId("a0000000-0000-0000-0000-000000000002")
                .email("ravi.guide@yatrasetu.demo")
                .fullName("Ravi Kumar")
                .role(Role.PARTNER)
                .partnerSubtype(PartnerSubtype.GUIDE)
                .verified(true)
                .build();

        // 3. Culture Host: Smt. Lakshmi Prasanna
        cultureHostUser = User.builder()
                .id("usr-sih-host-lakshmi")
                .authUserId("a0000000-0000-0000-0000-000000000003")
                .email("lakshmi.host@yatrasetu.demo")
                .fullName("Smt. Lakshmi Prasanna")
                .role(Role.PARTNER)
                .partnerSubtype(PartnerSubtype.ARTISAN)
                .verified(true)
                .build();

        // 4. Hotel Provider: Srinivasa Rao
        hotelPartnerUser = User.builder()
                .id("usr-partner-hotel-tpt")
                .authUserId("a0000000-0000-0000-0000-000000000004")
                .email("tirupati.hotel@yatrasetu.demo")
                .fullName("Srinivasa Rao")
                .role(Role.PARTNER)
                .partnerSubtype(PartnerSubtype.HOTEL)
                .verified(true)
                .build();

        apState = State.builder().id("IN-AP").stateName("Andhra Pradesh").build();
        tirupatiCity = City.builder().id("tirupati").cityName("Tirupati").state(apState).build();
        tirupatiDest = Destination.builder().id("dest-136").destinationName("Tirupati").city(tirupatiCity).state(apState).build();

        raviGuideHost = LocalHost.builder()
                .id("host-5")
                .user(guideUser)
                .name("Ravi Kumar")
                .roleTitle("Heritage & Temple Guide")
                .destination(tirupatiDest)
                .city(tirupatiCity)
                .state(apState)
                .pricePerHour(BigDecimal.valueOf(600))
                .isVerified(true)
                .build();

        lakshmiArtisanHost = LocalHost.builder()
                .id("host-45")
                .user(cultureHostUser)
                .name("Smt. Lakshmi Prasanna")
                .roleTitle("Kalamkari Artisan & Temple Craft Weaver")
                .destination(tirupatiDest)
                .city(tirupatiCity)
                .state(apState)
                .pricePerHour(BigDecimal.valueOf(450))
                .isVerified(true)
                .build();

        tirupatiHeritageWalk = Experience.builder()
                .id("exp-tirupati-temple-walk")
                .host(raviGuideHost)
                .destination(tirupatiDest)
                .city(tirupatiCity)
                .title("Tirupati Seshachalam Foothills & Ancient Temple Heritage Walk")
                .pricePerPerson(BigDecimal.valueOf(1800))
                .durationHours(BigDecimal.valueOf(3.5))
                .build();

        tirupatiGrandHotel = Hotel.builder()
                .id("htl-tpt-1")
                .hotelName("Tirupati Grand Residency")
                .owner(hotelPartnerUser)
                .destination(tirupatiDest)
                .city(tirupatiCity)
                .build();
    }

    @Test
    @DisplayName("SIH Demo 1: Tourist books Guide Ravi Kumar -> Guide receives NEW BOOKING notification, Tourist receives submission notice")
    void testTouristBooksGuideGeneratesRealNotification() {
        CreateExperienceBookingRequest req = CreateExperienceBookingRequest.builder()
                .hostId("host-5")
                .experienceId("exp-tirupati-temple-walk")
                .destinationId("dest-136")
                .bookingDate(LocalDate.now().plusDays(2))
                .startTime("08:00 AM")
                .guestCount(2)
                .totalAmount(BigDecimal.valueOf(3600))
                .build();

        UserPrincipal touristPrincipal = UserPrincipal.builder()
                .userId(touristUser.getId())
                .email(touristUser.getEmail())
                .role(Role.TRAVELER)
                .build();

        when(userRepository.findById("usr-sih-tourist")).thenReturn(Optional.of(touristUser));
        when(localHostRepository.findById("host-5")).thenReturn(Optional.of(raviGuideHost));
        when(experienceRepository.findById("exp-tirupati-temple-walk")).thenReturn(Optional.of(tirupatiHeritageWalk));
        when(destinationRepository.findById("dest-136")).thenReturn(Optional.of(tirupatiDest));

        when(experienceBookingRepository.save(any(ExperienceBooking.class))).thenAnswer(inv -> {
            ExperienceBooking b = inv.getArgument(0);
            b.setId("booking-exp-101");
            return b;
        });

        ExperienceBookingDto created = experienceBookingService.createBooking(req, touristPrincipal);

        assertThat(created).isNotNull();
        assertThat(created.getStatus()).isEqualTo("REQUESTED");

        // Verify Notification was sent to Ravi Kumar (usr-sih-guide-ravi) and Tourist (usr-sih-tourist)
        ArgumentCaptor<Notification> notifCaptor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, atLeast(2)).save(notifCaptor.capture());

        List<Notification> captured = notifCaptor.getAllValues();
        Notification guideNotif = captured.stream()
                .filter(n -> n.getUser().getId().equals("usr-sih-guide-ravi"))
                .findFirst()
                .orElse(null);

        assertThat(guideNotif).isNotNull();
        assertThat(guideNotif.getCategory()).isEqualTo("GUIDE_BOOKING_REQUEST");
        assertThat(guideNotif.getMessage()).contains("Tirupati Seshachalam Foothills & Ancient Temple Heritage Walk");
        assertThat(guideNotif.getMessage()).contains("SIH Demo Tourist");

        Notification touristNotif = captured.stream()
                .filter(n -> n.getUser().getId().equals("usr-sih-tourist"))
                .findFirst()
                .orElse(null);

        assertThat(touristNotif).isNotNull();
        assertThat(touristNotif.getCategory()).isEqualTo("GUIDE_BOOKING_REQUESTED");
    }

    @Test
    @DisplayName("SIH Demo 2: Ravi Kumar accepts booking -> Tourist receives ACCEPTED notification")
    void testGuideAcceptsBookingGeneratesTouristNotification() {
        ExperienceBooking booking = ExperienceBooking.builder()
                .id("booking-exp-101")
                .bookingReference("YS-EXP-992211")
                .tourist(touristUser)
                .host(raviGuideHost)
                .experience(tirupatiHeritageWalk)
                .status("REQUESTED")
                .build();

        when(experienceBookingRepository.findById("booking-exp-101")).thenReturn(Optional.of(booking));
        when(experienceBookingRepository.save(any(ExperienceBooking.class))).thenAnswer(inv -> inv.getArgument(0));

        ExperienceBookingDto accepted = experienceBookingService.acceptBooking("booking-exp-101", "usr-sih-guide-ravi");

        assertThat(accepted.getStatus()).isEqualTo("PAYMENT_PENDING");

        ArgumentCaptor<Notification> notifCaptor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(notifCaptor.capture());

        Notification notif = notifCaptor.getValue();
        assertThat(notif.getUser().getId()).isEqualTo("usr-sih-tourist");
        assertThat(notif.getCategory()).isEqualTo("GUIDE_BOOKING_ACCEPTED");
        assertThat(notif.getMessage()).contains("Ravi Kumar has accepted your request");
    }

    @Test
    @DisplayName("SIH Demo 3: Hotel booking requested -> Tirupati Hotel Provider receives NEW HOTEL BOOKING notification")
    void testHotelBookingRequestedGeneratesHotelProviderNotification() {
        HotelBooking hotelBooking = HotelBooking.builder()
                .id("booking-htl-101")
                .bookingReference("YS-HTL-882200")
                .hotel(tirupatiGrandHotel)
                .traveler(touristUser)
                .guestName("SIH Demo Tourist")
                .checkIn(LocalDate.now().plusDays(3))
                .checkOut(LocalDate.now().plusDays(5))
                .numberOfRooms(1)
                .bookingStatus(HotelBookingStatus.PENDING_PAYMENT)
                .build();

        notificationService.emitHotelBookingRequested(hotelBooking);

        ArgumentCaptor<Notification> notifCaptor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(2)).save(notifCaptor.capture());

        Notification hotelOwnerNotif = notifCaptor.getAllValues().stream()
                .filter(n -> n.getUser().getId().equals("usr-partner-hotel-tpt"))
                .findFirst()
                .orElse(null);

        assertThat(hotelOwnerNotif).isNotNull();
        assertThat(hotelOwnerNotif.getCategory()).isEqualTo("HOTEL_BOOKING_REQUEST");
        assertThat(hotelOwnerNotif.getTitle()).contains("New Hotel Booking Request");
        assertThat(hotelOwnerNotif.getMessage()).contains("Tirupati Grand Residency");
        assertThat(hotelOwnerNotif.getMessage()).contains("SIH Demo Tourist");
    }

    @Test
    @DisplayName("SIH Demo 4: Supporting Provider Invitation -> Smt. Lakshmi Prasanna receives collaboration request")
    void testSupportingProviderInvitationGeneratesNotification() {
        ExperienceSupportingProvider sp = ExperienceSupportingProvider.builder()
                .id("supp-tpt-kalamkari-1")
                .experience(tirupatiHeritageWalk)
                .providerId("host-45")
                .providerName("Smt. Lakshmi Prasanna")
                .providerType("ARTISAN")
                .status("INVITED")
                .build();

        when(localHostRepository.findById("host-45")).thenReturn(Optional.of(lakshmiArtisanHost));

        notificationService.emitSupportingProviderInvited(sp);

        ArgumentCaptor<Notification> notifCaptor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(notifCaptor.capture());

        Notification notif = notifCaptor.getValue();
        assertThat(notif.getUser().getId()).isEqualTo("usr-sih-host-lakshmi");
        assertThat(notif.getCategory()).isEqualTo("SUPPORTING_PROVIDER_INVITE");
        assertThat(notif.getMessage()).contains("Ravi Kumar");
        assertThat(notif.getMessage()).contains("Tirupati Seshachalam Foothills & Ancient Temple Heritage Walk");
    }

    @Test
    @DisplayName("SIH Demo 5: Supporting Provider Responds ACCEPT -> Ravi Kumar receives acceptance notification")
    void testSupportingProviderResponseGeneratesHostNotification() {
        ExperienceSupportingProvider sp = ExperienceSupportingProvider.builder()
                .id("supp-tpt-kalamkari-1")
                .experience(tirupatiHeritageWalk)
                .providerId("host-45")
                .providerName("Smt. Lakshmi Prasanna")
                .providerType("ARTISAN")
                .status("ACCEPTED")
                .build();

        notificationService.emitSupportingProviderResponded(sp);

        ArgumentCaptor<Notification> notifCaptor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(notifCaptor.capture());

        Notification notif = notifCaptor.getValue();
        assertThat(notif.getUser().getId()).isEqualTo("usr-sih-guide-ravi");
        assertThat(notif.getCategory()).isEqualTo("SUPPORTING_PROVIDER_RESPONSE");
        assertThat(notif.getTitle()).contains("Supporting Partner Accepted");
        assertThat(notif.getMessage()).contains("Smt. Lakshmi Prasanna has accepted your collaboration invitation");
    }

    @Test
    @DisplayName("Guide Rejects Booking -> Tourist receives REJECTED notification")
    void testGuideRejectsBookingGeneratesTouristNotification() {
        ExperienceBooking booking = ExperienceBooking.builder()
                .id("booking-exp-102")
                .bookingReference("YS-EXP-992212")
                .tourist(touristUser)
                .host(raviGuideHost)
                .experience(tirupatiHeritageWalk)
                .status("REQUESTED")
                .build();

        when(experienceBookingRepository.findById("booking-exp-102")).thenReturn(Optional.of(booking));
        when(experienceBookingRepository.save(any(ExperienceBooking.class))).thenAnswer(inv -> inv.getArgument(0));

        ExperienceBookingDto rejected = experienceBookingService.rejectBooking("booking-exp-102", "usr-sih-guide-ravi", "Fully booked on that date");

        assertThat(rejected.getStatus()).isEqualTo("REJECTED");

        ArgumentCaptor<Notification> notifCaptor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(notifCaptor.capture());

        Notification notif = notifCaptor.getValue();
        assertThat(notif.getUser().getId()).isEqualTo("usr-sih-tourist");
        assertThat(notif.getCategory()).isEqualTo("GUIDE_BOOKING_REJECTED");
        assertThat(notif.getMessage()).contains("declined");
        assertThat(notif.getMessage()).contains("Fully booked on that date");
    }

    @Test
    @DisplayName("Hotel Accepts Booking -> Tourist receives ACCEPTED notification")
    void testHotelAcceptsBookingGeneratesTouristNotification() {
        HotelBooking hotelBooking = HotelBooking.builder()
                .id("booking-htl-102")
                .bookingReference("YS-HTL-882201")
                .hotel(tirupatiGrandHotel)
                .traveler(touristUser)
                .guestName("SIH Demo Tourist")
                .bookingStatus(HotelBookingStatus.ACCEPTED)
                .build();

        notificationService.emitHotelBookingAccepted(hotelBooking);

        ArgumentCaptor<Notification> notifCaptor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(notifCaptor.capture());

        Notification notif = notifCaptor.getValue();
        assertThat(notif.getUser().getId()).isEqualTo("usr-sih-tourist");
        assertThat(notif.getCategory()).isEqualTo("HOTEL_BOOKING_ACCEPTED");
        assertThat(notif.getTitle()).contains("Hotel Booking Accepted");
        assertThat(notif.getMessage()).contains("Tirupati Grand Residency");
    }

    @Test
    @DisplayName("Hotel Rejects Booking -> Tourist receives REJECTED notification")
    void testHotelRejectsBookingGeneratesTouristNotification() {
        HotelBooking hotelBooking = HotelBooking.builder()
                .id("booking-htl-103")
                .bookingReference("YS-HTL-882202")
                .hotel(tirupatiGrandHotel)
                .traveler(touristUser)
                .guestName("SIH Demo Tourist")
                .bookingStatus(HotelBookingStatus.REJECTED)
                .build();

        notificationService.emitHotelBookingRejected(hotelBooking, "No rooms available for selected dates");

        ArgumentCaptor<Notification> notifCaptor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(notifCaptor.capture());

        Notification notif = notifCaptor.getValue();
        assertThat(notif.getUser().getId()).isEqualTo("usr-sih-tourist");
        assertThat(notif.getCategory()).isEqualTo("HOTEL_BOOKING_REJECTED");
        assertThat(notif.getTitle()).contains("Hotel Booking Declined");
        assertThat(notif.getMessage()).contains("No rooms available for selected dates");
    }

    @Test
    @DisplayName("Supporting Provider Declines -> Ravi Kumar receives decline notification")
    void testSupportingProviderDeclinesGeneratesHostNotification() {
        ExperienceSupportingProvider sp = ExperienceSupportingProvider.builder()
                .id("supp-tpt-kalamkari-2")
                .experience(tirupatiHeritageWalk)
                .providerId("host-45")
                .providerName("Smt. Lakshmi Prasanna")
                .providerType("ARTISAN")
                .status("DECLINED")
                .build();

        notificationService.emitSupportingProviderResponded(sp);

        ArgumentCaptor<Notification> notifCaptor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(notifCaptor.capture());

        Notification notif = notifCaptor.getValue();
        assertThat(notif.getUser().getId()).isEqualTo("usr-sih-guide-ravi");
        assertThat(notif.getCategory()).isEqualTo("SUPPORTING_PROVIDER_RESPONSE");
        assertThat(notif.getTitle()).contains("Supporting Partner Declined");
        assertThat(notif.getMessage()).contains("declined");
    }

    @Test
    @DisplayName("Deduplication: Repeated emit calls do NOT create duplicate notifications")
    void testNotificationDeduplication() {
        ExperienceBooking booking = ExperienceBooking.builder()
                .id("booking-exp-101")
                .bookingReference("YS-EXP-992211")
                .tourist(touristUser)
                .host(raviGuideHost)
                .experience(tirupatiHeritageWalk)
                .status("ACCEPTED")
                .build();

        Notification existingNotif = Notification.builder()
                .id("notif-existing")
                .user(touristUser)
                .title("✓ Guide Booking Accepted")
                .message("Your guide Ravi Kumar has accepted your request for 'Tirupati Seshachalam Foothills & Ancient Temple Heritage Walk' (YS-EXP-992211)! Proceed to complete payment.")
                .category("GUIDE_BOOKING_ACCEPTED")
                .referenceLink("/bookings")
                .read(false)
                .createdAt(Instant.now())
                .build();

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc("usr-sih-tourist"))
                .thenReturn(List.of(existingNotif));

        // Call emit again
        notificationService.emitGuideBookingAccepted(booking);

        // Verify save was NOT called again because duplicate was suppressed
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    @DisplayName("Security: Mark as read enforces user ownership (IDOR Prevention)")
    void testMarkAsReadIdorPrevention() {
        Notification touristNotif = Notification.builder()
                .id("notif-tourist-1")
                .user(touristUser)
                .title("Test")
                .message("Test message")
                .category("SYSTEM")
                .read(false)
                .build();

        when(userRepository.findById("usr-sih-guide-ravi")).thenReturn(Optional.of(guideUser));
        when(notificationRepository.findById("notif-tourist-1")).thenReturn(Optional.of(touristNotif));

        // Ravi tries to mark Tourist's notification as read
        org.assertj.core.api.Assertions.assertThatThrownBy(() ->
                notificationService.markAsRead("notif-tourist-1", "usr-sih-guide-ravi")
        ).isInstanceOf(org.springframework.security.access.AccessDeniedException.class);
    }

    @Test
    @DisplayName("Security Verification: NotificationController queries strictly by authenticated principal without IDOR")
    void testNotificationControllerStrictAuthorization() {
        UserPrincipal raviPrincipal = UserPrincipal.builder()
                .userId("usr-sih-guide-ravi")
                .email("ravi.guide@yatrasetu.demo")
                .role(Role.PARTNER)
                .build();

        Notification n1 = Notification.builder()
                .id("notif-1")
                .user(guideUser)
                .title("🔔 New Trip Request")
                .message("Test message")
                .category("GUIDE_BOOKING_REQUEST")
                .read(false)
                .createdAt(Instant.now())
                .build();

        when(userRepository.findById("usr-sih-guide-ravi")).thenReturn(Optional.of(guideUser));
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc("usr-sih-guide-ravi"))
                .thenReturn(List.of(n1));

        ResponseEntity<ApiResponse<List<NotificationDto>>> response = notificationController.getMyNotifications(false, raviPrincipal);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).hasSize(1);
        assertThat(response.getBody().getData().get(0).getTitle()).isEqualTo("🔔 New Trip Request");
    }
}
