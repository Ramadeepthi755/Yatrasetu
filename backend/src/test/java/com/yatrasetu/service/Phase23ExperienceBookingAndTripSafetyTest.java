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
public class Phase23ExperienceBookingAndTripSafetyTest {

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

    @InjectMocks
    private ExperienceBookingService bookingService;

    private User touristUser;
    private User hostUser;
    private LocalHost host;
    private Experience experience;
    private Destination destination;
    private ExperienceBooking booking;
    private UserPrincipal touristPrincipal;
    private UserPrincipal hostPrincipal;
    private UserPrincipal unauthorizedPrincipal;

    @BeforeEach
    void setUp() {
        touristUser = User.builder()
                .id("user-tourist-1")
                .fullName("Aarav Sharma")
                .email("aarav@example.com")
                .phone("+919876543210")
                .role(Role.TRAVELER)
                .build();

        hostUser = User.builder()
                .id("user-host-1")
                .fullName("Rajesh Kumar")
                .email("rajesh@example.com")
                .phone("+919876500000")
                .role(Role.PARTNER)
                .build();

        host = LocalHost.builder()
                .id("host-1")
                .name("Rajesh Kumar")
                .user(hostUser)
                .roleTitle("Senior Heritage Historian")
                .isVerified(true)
                .rating(BigDecimal.valueOf(4.9))
                .experienceCount(120)
                .build();

        destination = Destination.builder()
                .id("dest-jaipur")
                .destinationName("Jaipur")
                .latitude(BigDecimal.valueOf(26.9124))
                .longitude(BigDecimal.valueOf(75.7873))
                .build();

        experience = Experience.builder()
                .id("exp-1")
                .title("Amber Fort Sunrise Walking Tour")
                .destination(destination)
                .host(host)
                .pricePerPerson(BigDecimal.valueOf(1200))
                .durationHours(BigDecimal.valueOf(3.5))
                .build();

        booking = ExperienceBooking.builder()
                .id("book-1")
                .bookingReference("BK-EXP-123456")
                .tourist(touristUser)
                .host(host)
                .experience(experience)
                .destination(destination)
                .bookingType("PREDEFINED")
                .bookingDate(LocalDate.now().plusDays(2))
                .startTime("06:30 AM")
                .guestCount(2)
                .totalAmount(BigDecimal.valueOf(2400))
                .status("CONFIRMED")
                .paymentStatus("PAID")
                .build();

        touristPrincipal = UserPrincipal.builder()
                .userId(touristUser.getId())
                .authUserId("auth-tourist-1")
                .email(touristUser.getEmail())
                .role(Role.TRAVELER)
                .build();
        hostPrincipal = UserPrincipal.builder()
                .userId(hostUser.getId())
                .authUserId("auth-host-1")
                .email(hostUser.getEmail())
                .role(Role.PARTNER)
                .build();
        unauthorizedPrincipal = UserPrincipal.builder()
                .userId("user-stranger-99")
                .authUserId("auth-stranger-99")
                .email("stranger@example.com")
                .role(Role.TRAVELER)
                .build();
    }

    @Test
    @DisplayName("Test Meeting Point & Host Phone population on confirmed booking DTO")
    void testMeetingPointAndHostPhoneOnConfirmedBooking() {
        when(checkinRepository.findByBookingIdOrderByCreatedAtAsc(booking.getId())).thenReturn(Collections.emptyList());
        when(supportingProviderRepository.findByExperienceId(experience.getId())).thenReturn(Collections.emptyList());

        when(bookingRepository.findById("book-1")).thenReturn(Optional.of(booking));

        ExperienceBookingDto dto = bookingService.getBookingById("book-1", touristPrincipal);

        assertThat(dto).isNotNull();
        assertThat(dto.getBookingReference()).isEqualTo("BK-EXP-123456");
        assertThat(dto.getMeetingPointName()).contains("Jaipur");
        assertThat(dto.getMeetingPointLatitude()).isEqualTo(BigDecimal.valueOf(26.9124));
        assertThat(dto.getMeetingPointLongitude()).isEqualTo(BigDecimal.valueOf(75.7873));
        assertThat(dto.getHostPhone()).isEqualTo("+919876500000");
        assertThat(dto.getDurationHours()).isEqualTo(BigDecimal.valueOf(3.5));
    }

    @Test
    @DisplayName("Test Sending and Retrieving Trip-Scoped Messages between Tourist and Host")
    void testTripScopedMessaging() {
        when(bookingRepository.findById("book-1")).thenReturn(Optional.of(booking));
        when(userRepository.findById(touristPrincipal.getUserId())).thenReturn(Optional.of(touristUser));
        when(bookingMessageRepository.save(any(BookingMessage.class))).thenAnswer(inv -> {
            BookingMessage m = inv.getArgument(0);
            return m;
        });

        SendBookingMessageRequest req = new SendBookingMessageRequest("Hi Rajesh, looking forward to meeting at Amber Fort!");
        BookingMessageDto sent = bookingService.sendBookingMessage("book-1", req, touristPrincipal);

        assertThat(sent).isNotNull();
        assertThat(sent.getMessage()).isEqualTo("Hi Rajesh, looking forward to meeting at Amber Fort!");
        assertThat(sent.getSenderId()).isEqualTo("user-tourist-1");
        assertThat(sent.getReceiverId()).isEqualTo("user-host-1");

        // Test retrieval
        BookingMessage msg = BookingMessage.builder()
                .id("msg-1")
                .booking(booking)
                .sender(touristUser)
                .receiver(hostUser)
                .message("Hi Rajesh, looking forward to meeting at Amber Fort!")
                .isRead(false)
                .createdAt(Instant.now())
                .build();
        when(bookingMessageRepository.findByBookingIdOrderByCreatedAtAsc("book-1")).thenReturn(List.of(msg));

        List<BookingMessageDto> messages = bookingService.getBookingMessages("book-1", hostPrincipal);
        assertThat(messages).hasSize(1);
        assertThat(messages.get(0).getMessage()).isEqualTo("Hi Rajesh, looking forward to meeting at Amber Fort!");
    }

    @Test
    @DisplayName("Test IDOR Prevention on Trip Messages")
    void testIdorProtectionOnMessages() {
        when(bookingRepository.findById("book-1")).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.getBookingMessages("book-1", unauthorizedPrincipal))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Access denied");

        SendBookingMessageRequest req = new SendBookingMessageRequest("Malicious message attempt");
        assertThatThrownBy(() -> bookingService.sendBookingMessage("book-1", req, unauthorizedPrincipal))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Access denied");
    }

    @Test
    @DisplayName("Test Trip Safety SOS Incident Trigger")
    void testTripSafetySosIncidentTrigger() {
        when(userRepository.findById(touristPrincipal.getUserId())).thenReturn(Optional.of(touristUser));
        when(bookingRepository.findById("book-1")).thenReturn(Optional.of(booking));
        when(incidentRepository.save(any(TripSafetyIncident.class))).thenAnswer(inv -> inv.getArgument(0));

        TripSafetyIncidentDto incident = bookingService.triggerSos(
                "book-1",
                "Severe rainstorm near trailhead, need immediate assistance",
                BigDecimal.valueOf(26.9124),
                BigDecimal.valueOf(75.7873),
                touristPrincipal
        );

        assertThat(incident).isNotNull();
        assertThat(incident.getIncidentType()).isEqualTo("SOS");
        assertThat(incident.getSeverity()).isEqualTo("CRITICAL");
        assertThat(incident.getStatus()).isEqualTo("REPORTED");
        assertThat(incident.getEmergencyContactNotified()).isTrue();
    }

    @Test
    @DisplayName("Test Cash Milestone Payment Lifecycle (50% at Start, 50% at Completion)")
    void testCashPaymentMilestones() {
        booking.setTotalAmount(BigDecimal.valueOf(3600.00));
        when(bookingRepository.findById("book-1")).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(ExperienceBooking.class))).thenAnswer(inv -> inv.getArgument(0));

        // 1. Tourist selects cash payment
        ExperienceBookingDto cashBooking = bookingService.selectCashPayment("book-1", touristPrincipal);
        assertThat(cashBooking.getPaymentMethod()).isEqualTo("CASH");
        assertThat(cashBooking.getStatus()).isEqualTo("CONFIRMED");
        assertThat(cashBooking.getPaymentStatus()).isEqualTo("PENDING");
        assertThat(cashBooking.getCashMilestone1Amount()).isEqualByComparingTo(BigDecimal.valueOf(1800.00));
        assertThat(cashBooking.getCashMilestone2Amount()).isEqualByComparingTo(BigDecimal.valueOf(1800.00));
        assertThat(cashBooking.getCashMilestone1Paid()).isFalse();

        // 2. Guide records milestone 1 received at trip start
        ExperienceBookingDto m1Recorded = bookingService.recordCashMilestone("book-1", 1, hostUser.getId());
        assertThat(m1Recorded.getCashMilestone1Paid()).isTrue();
        assertThat(m1Recorded.getPaymentStatus()).isEqualTo("PARTIALLY_PAID");

        // 3. Guide records milestone 2 received on trip completion
        ExperienceBookingDto m2Recorded = bookingService.recordCashMilestone("book-1", 2, hostUser.getId());
        assertThat(m2Recorded.getCashMilestone2Paid()).isTrue();
        assertThat(m2Recorded.getPaymentStatus()).isEqualTo("PAID");
    }

    @Test
    @DisplayName("Test Place-Wise Iconic Meeting Point Mapping")
    void testPlaceWiseMeetingPointMapping() {
        Destination tirupatiDest = Destination.builder()
                .id("dest-136")
                .destinationName("Tirupati")
                .latitude(BigDecimal.valueOf(13.6521))
                .longitude(BigDecimal.valueOf(79.4267))
                .build();
        booking.setDestination(tirupatiDest);
        when(bookingRepository.findById("book-1")).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(ExperienceBooking.class))).thenAnswer(inv -> inv.getArgument(0));

        ExperienceBookingDto dto = bookingService.startTrip("book-1", hostUser.getId());
        assertThat(dto.getMeetingPointName()).isEqualTo("Kapila Theertham Main Entrance, Seshachalam Foothills");
        assertThat(dto.getMeetingPointLatitude()).isEqualByComparingTo(BigDecimal.valueOf(13.6521));
        assertThat(dto.getMeetingPointLongitude()).isEqualByComparingTo(BigDecimal.valueOf(79.4267));
    }
}
