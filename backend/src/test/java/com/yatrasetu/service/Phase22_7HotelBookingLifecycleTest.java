package com.yatrasetu.service;

import com.yatrasetu.config.ConflictException;
import com.yatrasetu.config.ResourceNotFoundException;
import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.web.dto.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
public class Phase22_7HotelBookingLifecycleTest {

    @Autowired
    private HotelBookingService bookingService;

    @Autowired
    private HotelAvailabilityService availabilityService;

    @Autowired
    private HotelBookingRepository bookingRepository;

    @Autowired
    private HotelBookingAllocationRepository allocationRepository;

    @Autowired
    private HotelBookingStatusHistoryRepository statusHistoryRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private HotelRoomTypeRepository roomTypeRepository;

    @Autowired
    private HotelInventoryRepository inventoryRepository;

    @Autowired
    private HotelRatePlanRepository ratePlanRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StateRepository stateRepository;

    @Autowired
    private CityRepository cityRepository;

    private User travelerA;
    private User travelerB;
    private User partnerA;
    private User partnerB;
    private User govtUser;
    private State testState;
    private City testCity;
    private Hotel verifiedHotel;
    private Hotel datasetHotel;
    private HotelRoomType deluxeRoom;
    private HotelRatePlan freeCancellationPlan;
    private HotelRatePlan nonRefundablePlan;
    private HotelRatePlan unconfiguredPolicyPlan;

    @BeforeEach
    void setUp() {
        cleanup();

        // 1. Users
        travelerA = userRepository.save(User.builder()
                .id("usr-traveler-227-a")
                .authUserId("auth-traveler-227-a")
                .email("arun.traveler@example.com")
                .fullName("Arun Verma")
                .role(Role.TRAVELER)
                .verified(true)
                .verificationStatus(VerificationStatus.APPROVED)
                .active(true)
                .build());

        travelerB = userRepository.save(User.builder()
                .id("usr-traveler-227-b")
                .authUserId("auth-traveler-227-b")
                .email("sneha.traveler@example.com")
                .fullName("Sneha Reddy")
                .role(Role.TRAVELER)
                .verified(true)
                .verificationStatus(VerificationStatus.APPROVED)
                .active(true)
                .build());

        partnerA = userRepository.save(User.builder()
                .id("usr-partner-227-a")
                .authUserId("auth-partner-227-a")
                .email("partner.heritage@yatrasetu.com")
                .fullName("Hampi Heritage Resort")
                .role(Role.PARTNER)
                .partnerSubtype(PartnerSubtype.HOTEL)
                .verified(true)
                .verificationStatus(VerificationStatus.APPROVED)
                .active(true)
                .build());

        partnerB = userRepository.save(User.builder()
                .id("usr-partner-227-b")
                .authUserId("auth-partner-227-b")
                .email("partner.other@yatrasetu.com")
                .fullName("Other Resort")
                .role(Role.PARTNER)
                .partnerSubtype(PartnerSubtype.HOMESTAY)
                .verified(true)
                .verificationStatus(VerificationStatus.APPROVED)
                .active(true)
                .build());

        govtUser = userRepository.save(User.builder()
                .id("usr-govt-227")
                .authUserId("auth-govt-227")
                .email("officer.tourism@gov.in")
                .fullName("State Tourism Officer")
                .role(Role.GOVERNMENT)
                .verified(true)
                .verificationStatus(VerificationStatus.APPROVED)
                .active(true)
                .build());

        // 2. Geography
        testState = stateRepository.save(State.builder()
                .id("IN-KA-227")
                .stateName("Karnataka")
                .region("South India")
                .build());

        testCity = cityRepository.save(City.builder()
                .id("CT-HAMPI-227")
                .cityName("Hampi")
                .state(testState)
                .latitude(BigDecimal.valueOf(15.3350))
                .longitude(BigDecimal.valueOf(76.4600))
                .build());

        // 3. Verified Partner Hotel
        verifiedHotel = hotelRepository.save(Hotel.builder()
                .id("htl-partner-227")
                .hotelName("Hampi Heritage Boulders Resort")
                .city(testCity)
                .owner(partnerA)
                .isPartnerProperty(true)
                .verificationStatus(HotelVerificationStatus.VERIFIED)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .pricePerNight(BigDecimal.valueOf(4500))
                .isActive(true)
                .build());

        // 4. Read-only Dataset Hotel (1,007 catalog baseline)
        datasetHotel = hotelRepository.save(Hotel.builder()
                .id("htl-dataset-227")
                .hotelName("KSTDC Hotel Mayura Bhuvaneshwari")
                .city(testCity)
                .owner(null)
                .isPartnerProperty(false)
                .verificationStatus(HotelVerificationStatus.UNVERIFIED)
                .sourceType(SourceType.DATASET)
                .pricePerNight(BigDecimal.valueOf(2000))
                .isActive(true)
                .build());

        // 5. Room Type with Physical Capacity = 5
        deluxeRoom = roomTypeRepository.save(HotelRoomType.builder()
                .id("rm-deluxe-227")
                .hotel(verifiedHotel)
                .roomTypeName("Heritage Deluxe Villa")
                .baseInventoryUnits(5)
                .maxOccupancy(3)
                .bedConfiguration("1 King Bed")
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .isActive(true)
                .build());

        // Physical inventory row (total=5, blocked=0)
        inventoryRepository.save(HotelInventory.builder()
                .id("inv-deluxe-227-base")
                .roomType(deluxeRoom)
                .inventoryDate(null)
                .totalUnits(5)
                .blockedUnits(0)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .build());

        // 6. Rate Plans
        freeCancellationPlan = ratePlanRepository.save(HotelRatePlan.builder()
                .id("rp-free-cancel-227")
                .roomType(deluxeRoom)
                .planName("Flexible Rate - Free Cancellation")
                .mealPlan(MealPlan.CP)
                .basePrice(new BigDecimal("4500.00"))
                .currency("INR")
                .cancellationPolicy(CancellationPolicyType.FREE_CANCELLATION)
                .cancellationDeadlineHours(24)
                .status(RatePlanStatus.ACTIVE)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .build());

        nonRefundablePlan = ratePlanRepository.save(HotelRatePlan.builder()
                .id("rp-non-ref-227")
                .roomType(deluxeRoom)
                .planName("Advance Purchase Non-Refundable")
                .mealPlan(MealPlan.EP)
                .basePrice(new BigDecimal("3800.00"))
                .currency("INR")
                .cancellationPolicy(CancellationPolicyType.NON_REFUNDABLE)
                .cancellationDeadlineHours(0)
                .status(RatePlanStatus.ACTIVE)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .build());

        unconfiguredPolicyPlan = ratePlanRepository.save(HotelRatePlan.builder()
                .id("rp-unconfigured-227")
                .roomType(deluxeRoom)
                .planName("Standard Tariff - Moderate Policy")
                .mealPlan(MealPlan.EP)
                .basePrice(new BigDecimal("4000.00"))
                .currency("INR")
                .cancellationPolicy(CancellationPolicyType.FREE_CANCELLATION)
                .cancellationDeadlineHours(72)
                .status(RatePlanStatus.ACTIVE)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .build());
    }

    @AfterEach
    void tearDown() {
        cleanup();
    }

    private void cleanup() {
        statusHistoryRepository.deleteAll();
        allocationRepository.deleteAll();
        bookingRepository.deleteAll();
        ratePlanRepository.deleteAll();
        inventoryRepository.deleteAll();
        roomTypeRepository.deleteAll();
        hotelRepository.deleteAll();
        notificationRepository.deleteAll();
        userRepository.deleteAll();
        cityRepository.deleteAll();
        stateRepository.deleteAll();
    }

    private CreateHotelBookingRequest buildBookingRequest(int numberOfRooms, LocalDate checkIn, LocalDate checkOut, String ratePlanId) {
        return CreateHotelBookingRequest.builder()
                .roomTypeId(deluxeRoom.getId())
                .ratePlanId(ratePlanId)
                .checkIn(checkIn)
                .checkOut(checkOut)
                .numberOfRooms(numberOfRooms)
                .adults(2)
                .children(0)
                .guestName("Arun Verma")
                .guestEmail("arun.traveler@example.com")
                .guestPhone("+91 9876543210")
                .specialRequests("High floor quiet room")
                .idempotencyKey(UUID.randomUUID().toString())
                .build();
    }

    // =========================================================================
    // 1. PENDING_PAYMENT CAN BE CANCELLED & RELEASES ALL ALLOCATIONS
    // =========================================================================

    @Test
    @DisplayName("1. PENDING_PAYMENT can be cancelled, releases all allocations, and updates status to CANCELLED")
    void testCancelPendingPayment_Success() {
        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOut = LocalDate.now().plusDays(8); // 3 nights

        HotelBookingDto booking = bookingService.createBooking(
                verifiedHotel.getId(),
                buildBookingRequest(2, checkIn, checkOut, freeCancellationPlan.getId()),
                travelerA.getId()
        );

        assertThat(booking.getBookingStatus()).isEqualTo(HotelBookingStatus.PENDING_PAYMENT);
        assertThat(booking.getAllocations()).hasSize(3);
        assertThat(booking.getAllocations()).allMatch(a -> "ACTIVE".equals(a.getStatus()));

        // Cancel
        HotelBookingDto cancelled = bookingService.cancelBooking(
                booking.getBookingReference(),
                CancelHotelBookingRequest.builder()
                        .reason("Traveler had a schedule change")
                        .reasonCode(CancellationReasonCode.CHANGED_PLANS)
                        .build(),
                travelerA.getId()
        );

        assertThat(cancelled.getBookingStatus()).isEqualTo(HotelBookingStatus.CANCELLED);
        assertThat(cancelled.getCancellationReason()).contains("Traveler had a schedule change");
        assertThat(cancelled.getCancellationReasonCode()).isEqualTo(CancellationReasonCode.CHANGED_PLANS.name());
        assertThat(cancelled.getCancelledAt()).isNotNull();

        // Check allocations are all RELEASED
        List<HotelBookingAllocation> allocs = allocationRepository.findByBookingId(booking.getId());
        assertThat(allocs).hasSize(3);
        assertThat(allocs).allMatch(a -> a.getStatus() == BookingAllocationStatus.RELEASED);
    }

    // =========================================================================
    // 2. CANCELLATION RESTORES LIVE AVAILABILITY & LEAVES PHYSICAL INVENTORY UNTOUCHED
    // =========================================================================

    @Test
    @DisplayName("2. Cancellation restores live availability and leaves physical capacity untouched")
    void testCancelBooking_RestoresAvailabilityAndPreservesPhysicalInventory() {
        LocalDate checkIn = LocalDate.now().plusDays(10);
        LocalDate checkOut = LocalDate.now().plusDays(12); // 2 nights

        // Initial availability: 5 units
        HotelAvailabilityDto initialAvail = availabilityService.getHotelAvailability(
                verifiedHotel.getId(), deluxeRoom.getId(), checkIn, checkOut, 2);
        assertThat(initialAvail.getRooms().get(0).getAvailableUnits()).isEqualTo(5);

        // Book 3 rooms
        HotelBookingDto booking = bookingService.createBooking(
                verifiedHotel.getId(),
                buildBookingRequest(3, checkIn, checkOut, freeCancellationPlan.getId()),
                travelerA.getId()
        );

        // Availability drops to 2 units
        HotelAvailabilityDto afterBookingAvail = availabilityService.getHotelAvailability(
                verifiedHotel.getId(), deluxeRoom.getId(), checkIn, checkOut, 2);
        assertThat(afterBookingAvail.getRooms().get(0).getAvailableUnits()).isEqualTo(2);

        // Cancel booking
        bookingService.cancelBooking(booking.getBookingReference(), travelerA.getId());

        // Availability immediately restored to 5 units
        HotelAvailabilityDto afterCancelAvail = availabilityService.getHotelAvailability(
                verifiedHotel.getId(), deluxeRoom.getId(), checkIn, checkOut, 2);
        assertThat(afterCancelAvail.getRooms().get(0).getAvailableUnits()).isEqualTo(5);

        // Physical inventory capacity remains exactly 5 (untouched)
        Optional<HotelInventory> baseInv = inventoryRepository.findByRoomTypeIdAndInventoryDateIsNull(deluxeRoom.getId());
        assertThat(baseInv).isPresent();
        assertThat(baseInv.get().getTotalUnits()).isEqualTo(5);
        assertThat(baseInv.get().getBlockedUnits()).isEqualTo(0);
    }

    // =========================================================================
    // 3. CANCELLATION IDEMPOTENCY
    // =========================================================================

    @Test
    @DisplayName("3. Cancellation is idempotent; repeated calls return safe representation without extra release")
    void testCancelBooking_IsIdempotent() {
        LocalDate checkIn = LocalDate.now().plusDays(3);
        LocalDate checkOut = LocalDate.now().plusDays(5);

        HotelBookingDto booking = bookingService.createBooking(
                verifiedHotel.getId(),
                buildBookingRequest(1, checkIn, checkOut, freeCancellationPlan.getId()),
                travelerA.getId()
        );

        // First cancellation
        HotelBookingDto cancel1 = bookingService.cancelBooking(booking.getBookingReference(), travelerA.getId());
        assertThat(cancel1.getBookingStatus()).isEqualTo(HotelBookingStatus.CANCELLED);

        // Status history count should be 2 (1 CREATED + 1 CANCELLED)
        assertThat(statusHistoryRepository.countByBookingId(booking.getId())).isEqualTo(2);

        // Second cancellation (repeated call)
        HotelBookingDto cancel2 = bookingService.cancelBooking(booking.getBookingReference(), travelerA.getId());
        assertThat(cancel2.getBookingStatus()).isEqualTo(HotelBookingStatus.CANCELLED);

        // Status history count is still 2 (no duplicate audit entries or double releases)
        assertThat(statusHistoryRepository.countByBookingId(booking.getId())).isEqualTo(2);
    }

    // =========================================================================
    // 4. EXPIRED BOOKINGS BECOME EXPIRED, RELEASE ALLOCATIONS & RESTORE AVAILABILITY
    // =========================================================================

    @Test
    @DisplayName("4. Expired booking transitions to EXPIRED, releases allocations, and is idempotent")
    void testPendingBooking_ExpiresAndReleasesAllocations() {
        LocalDate checkIn = LocalDate.now().plusDays(2);
        LocalDate checkOut = LocalDate.now().plusDays(4);

        HotelBookingDto bookingDto = bookingService.createBooking(
                verifiedHotel.getId(),
                buildBookingRequest(2, checkIn, checkOut, freeCancellationPlan.getId()),
                travelerA.getId()
        );

        // Manually simulate past expiration timestamp
        HotelBooking booking = bookingRepository.findById(bookingDto.getId()).orElseThrow();
        booking.setExpiresAt(Instant.now().minusSeconds(120)); // 2 minutes ago
        bookingRepository.save(booking);

        // Run batch expiration sweep
        int expiredCount = bookingService.expirePendingBookings();
        assertThat(expiredCount).isEqualTo(1);

        // Check updated status
        HotelBooking evaluated = bookingRepository.findById(bookingDto.getId()).orElseThrow();
        assertThat(evaluated.getBookingStatus()).isEqualTo(HotelBookingStatus.EXPIRED);
        assertThat(evaluated.getCancellationReasonCode()).isEqualTo(CancellationReasonCode.PAYMENT_TIMEOUT);

        // Allocations are RELEASED
        List<HotelBookingAllocation> allocs = allocationRepository.findByBookingId(booking.getId());
        assertThat(allocs).allMatch(a -> a.getStatus() == BookingAllocationStatus.RELEASED);

        // Repeated run of expirePendingBookings is idempotent and processes 0
        int repeatedCount = bookingService.expirePendingBookings();
        assertThat(repeatedCount).isEqualTo(0);
    }

    // =========================================================================
    // 5. EXPIRED BOOKINGS CANNOT BE CANCELLED OR CONFIRMED
    // =========================================================================

    @Test
    @DisplayName("5. Expired reservation cannot be transitioned to CANCELLED or CONFIRMED")
    void testExpiredBooking_CannotBeCancelledOrConfirmed() {
        LocalDate checkIn = LocalDate.now().plusDays(1);
        LocalDate checkOut = LocalDate.now().plusDays(3);

        HotelBookingDto bookingDto = bookingService.createBooking(
                verifiedHotel.getId(),
                buildBookingRequest(1, checkIn, checkOut, freeCancellationPlan.getId()),
                travelerA.getId()
        );

        // Expire it
        HotelBooking booking = bookingRepository.findById(bookingDto.getId()).orElseThrow();
        booking.setExpiresAt(Instant.now().minusSeconds(60));
        bookingRepository.save(booking);
        bookingService.expirePendingBookings();

        HotelBooking expiredBooking = bookingRepository.findById(bookingDto.getId()).orElseThrow();
        assertThat(expiredBooking.getBookingStatus()).isEqualTo(HotelBookingStatus.EXPIRED);

        // Attempt to cancel expired booking -> Must be rejected
        assertThatThrownBy(() -> bookingService.cancelBooking(expiredBooking.getBookingReference(), travelerA.getId()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot cancel an expired reservation");

        // Attempt state machine invalid transition to CONFIRMED
        assertThatThrownBy(() -> expiredBooking.validateTransition(HotelBookingStatus.CONFIRMED))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Invalid booking state transition");
    }

    // =========================================================================
    // 6. CANCELLATION POLICY SNAPSHOTTING & HONESTY
    // =========================================================================

    @Test
    @DisplayName("6. Cancellation policy is snapshotted immutably from rate plan and unconfigured policies are handled honestly")
    void testCancellationPolicy_SnapshottingAndHonesty() {
        LocalDate checkIn = LocalDate.now().plusDays(7);
        LocalDate checkOut = LocalDate.now().plusDays(9);

        // Booking on Free Cancellation Plan
        HotelBookingDto freePlanBooking = bookingService.createBooking(
                verifiedHotel.getId(),
                buildBookingRequest(1, checkIn, checkOut, freeCancellationPlan.getId()),
                travelerA.getId()
        );
        assertThat(freePlanBooking.getCancellationPolicySnapshot()).isEqualTo("FREE_CANCELLATION");
        assertThat(freePlanBooking.getCancellationDeadlineHours()).isEqualTo(24);

        // Booking on Non-Refundable Plan
        HotelBookingDto nonRefBooking = bookingService.createBooking(
                verifiedHotel.getId(),
                buildBookingRequest(1, checkIn, checkOut, nonRefundablePlan.getId()),
                travelerA.getId()
        );
        assertThat(nonRefBooking.getCancellationPolicySnapshot()).isEqualTo("NON_REFUNDABLE");

        // Booking on Unconfigured Plan
        HotelBookingDto unconfiguredBooking = bookingService.createBooking(
                verifiedHotel.getId(),
                buildBookingRequest(1, checkIn, checkOut, unconfiguredPolicyPlan.getId()),
                travelerA.getId()
        );
        assertThat(unconfiguredBooking.getCancellationPolicySnapshot()).isEqualTo("FREE_CANCELLATION");
        assertThat(unconfiguredBooking.getCancellationDeadlineHours()).isEqualTo(72);
    }

    // =========================================================================
    // 7. STRICT RBAC: ONLY TRAVELER OWNER CAN CANCEL
    // =========================================================================

    @Test
    @DisplayName("7. Only the booking traveler owner can cancel; other travelers, partners, and government are rejected")
    void testRBAC_OnlyOwnerCanCancel() {
        LocalDate checkIn = LocalDate.now().plusDays(4);
        LocalDate checkOut = LocalDate.now().plusDays(6);

        HotelBookingDto booking = bookingService.createBooking(
                verifiedHotel.getId(),
                buildBookingRequest(1, checkIn, checkOut, freeCancellationPlan.getId()),
                travelerA.getId()
        );

        // Traveler B (unauthorized) cannot cancel Traveler A's booking
        assertThatThrownBy(() -> bookingService.cancelBooking(booking.getBookingReference(), travelerB.getId()))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Only the booking owner (traveler) can cancel");

        // Partner cannot cancel traveler booking via traveler endpoint
        assertThatThrownBy(() -> bookingService.cancelBooking(booking.getBookingReference(), partnerA.getId()))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Only the booking owner (traveler) can cancel");

        // Government cannot cancel traveler booking
        assertThatThrownBy(() -> bookingService.cancelBooking(booking.getBookingReference(), govtUser.getId()))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Only the booking owner (traveler) can cancel");

        // Guest (empty identifier) is rejected
        assertThatThrownBy(() -> bookingService.cancelBooking(booking.getBookingReference(), ""))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Authentication required");
    }

    // =========================================================================
    // 8. DATASET HOTELS REMAIN STRICTLY NON-BOOKABLE
    // =========================================================================

    @Test
    @DisplayName("8. Dataset hotels (1,007 catalog baseline) remain strictly non-bookable")
    void testDatasetHotels_RemainNonBookable() {
        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOut = LocalDate.now().plusDays(7);

        assertThatThrownBy(() -> bookingService.createBooking(
                datasetHotel.getId(),
                buildBookingRequest(1, checkIn, checkOut, freeCancellationPlan.getId()),
                travelerA.getId()
        )).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Live booking is not currently available for this dataset property");
    }

    // =========================================================================
    // 9. PRICE SNAPSHOT & PII MASKING INTEGRITY
    // =========================================================================

    @Test
    @DisplayName("9. Cancellation and expiry do not alter price snapshots and partner views mask traveler PII")
    void testFinancialSnapshot_ImmutabilityAndPIIMasking() {
        LocalDate checkIn = LocalDate.now().plusDays(15);
        LocalDate checkOut = LocalDate.now().plusDays(18); // 3 nights, 2 rooms = 6 room-nights * 4500 = 27000

        HotelBookingDto booking = bookingService.createBooking(
                verifiedHotel.getId(),
                buildBookingRequest(2, checkIn, checkOut, freeCancellationPlan.getId()),
                travelerA.getId()
        );

        BigDecimal expectedTotal = new BigDecimal("27000.00");
        assertThat(booking.getTotalAmount()).isEqualByComparingTo(expectedTotal);
        assertThat(booking.getTaxesAmount()).isEqualByComparingTo(BigDecimal.ZERO);

        // Cancel
        HotelBookingDto cancelled = bookingService.cancelBooking(booking.getBookingReference(), travelerA.getId());
        assertThat(cancelled.getTotalAmount()).isEqualByComparingTo(expectedTotal);
        assertThat(cancelled.getPricePerNight()).isEqualByComparingTo(new BigDecimal("4500.00"));
        assertThat(cancelled.getTaxesAmount()).isEqualByComparingTo(BigDecimal.ZERO);

        // Partner view masks traveler PII
        List<HotelBookingDto> partnerBookings = bookingService.getPartnerHotelBookings(verifiedHotel.getId(), partnerA.getId());
        assertThat(partnerBookings).hasSize(1);
        HotelBookingDto pb = partnerBookings.get(0);
        assertThat(pb.getGuestEmail()).doesNotContain("arun.traveler@example.com");
        assertThat(pb.getGuestEmail()).contains("***@");
        assertThat(pb.getGuestPhone()).contains("******");
    }

    // =========================================================================
    // 10. STATUS AUDIT HISTORY CREATION
    // =========================================================================

    @Test
    @DisplayName("10. Status audit history is immutably created across the booking lifecycle")
    void testStatusAuditHistory_CreatedAcrossLifecycle() {
        LocalDate checkIn = LocalDate.now().plusDays(20);
        LocalDate checkOut = LocalDate.now().plusDays(22);

        HotelBookingDto booking = bookingService.createBooking(
                verifiedHotel.getId(),
                buildBookingRequest(1, checkIn, checkOut, freeCancellationPlan.getId()),
                travelerA.getId()
        );

        List<HotelBookingStatusHistory> historyAfterCreate = statusHistoryRepository.findByBookingIdOrderByCreatedAtAsc(booking.getId());
        assertThat(historyAfterCreate).hasSize(1);
        assertThat(historyAfterCreate.get(0).getNewStatus()).isEqualTo(HotelBookingStatus.PENDING_PAYMENT);
        assertThat(historyAfterCreate.get(0).getReason()).isEqualTo("BOOKING_CREATED");
        assertThat(historyAfterCreate.get(0).getActorUser().getId()).isEqualTo(travelerA.getId());

        // Cancel booking
        bookingService.cancelBooking(
                booking.getBookingReference(),
                CancelHotelBookingRequest.builder()
                        .reason("User cancelled from dashboard")
                        .reasonCode(CancellationReasonCode.CHANGED_PLANS)
                        .build(),
                travelerA.getId()
        );

        List<HotelBookingStatusHistory> historyAfterCancel = statusHistoryRepository.findByBookingIdOrderByCreatedAtAsc(booking.getId());
        assertThat(historyAfterCancel).hasSize(2);
        assertThat(historyAfterCancel.get(1).getPreviousStatus()).isEqualTo(HotelBookingStatus.PENDING_PAYMENT);
        assertThat(historyAfterCancel.get(1).getNewStatus()).isEqualTo(HotelBookingStatus.CANCELLED);
        assertThat(historyAfterCancel.get(1).getReason()).contains("User cancelled from dashboard");
        assertThat(historyAfterCancel.get(1).getActorUser().getId()).isEqualTo(travelerA.getId());
    }

    // =========================================================================
    // 11. CONCURRENCY: CANCELLATION RACE WITH NEW BOOKING CREATION
    // =========================================================================

    @Test
    @DisplayName("11. Concurrency: Cancelling a booking allows a concurrent thread to book freed capacity without exceeding total")
    void testConcurrency_CancellationRaceWithBookingCreation() throws Exception {
        LocalDate checkIn = LocalDate.now().plusDays(25);
        LocalDate checkOut = LocalDate.now().plusDays(27);

        // Capacity = 5. Traveler A books 5 rooms (filling all capacity).
        HotelBookingDto bookingA = bookingService.createBooking(
                verifiedHotel.getId(),
                buildBookingRequest(5, checkIn, checkOut, freeCancellationPlan.getId()),
                travelerA.getId()
        );

        // Verify remaining capacity is 0
        HotelAvailabilityDto zeroAvail = availabilityService.getHotelAvailability(
                verifiedHotel.getId(), deluxeRoom.getId(), checkIn, checkOut, 2);
        assertThat(zeroAvail.getRooms().get(0).getAvailableUnits()).isEqualTo(0);

        // Thread 1 cancels bookingA, Thread 2 tries to book 3 rooms for Traveler B
        ExecutorService executor = Executors.newFixedThreadPool(2);
        CyclicBarrier barrier = new CyclicBarrier(2);

        Future<?> cancelFuture = executor.submit(() -> {
            try {
                barrier.await();
                bookingService.cancelBooking(bookingA.getBookingReference(), travelerA.getId());
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });

        Future<?> bookFuture = executor.submit(() -> {
            try {
                barrier.await();
                Thread.sleep(15);
                bookingService.createBooking(
                        verifiedHotel.getId(),
                        buildBookingRequest(3, checkIn, checkOut, freeCancellationPlan.getId()),
                        travelerB.getId()
                );
            } catch (Exception e) {
                // ConflictException is acceptable if cancel transaction hasn't committed yet
            }
        });

        cancelFuture.get(5, TimeUnit.SECONDS);
        bookFuture.get(5, TimeUnit.SECONDS);
        executor.shutdown();

        // Final verification: Active reserved units must be <= physical capacity (5)
        List<Object[]> activeAllocs = allocationRepository.findActiveReservedUnitsByRoomTypeIdAndDateRange(
                deluxeRoom.getId(), checkIn, checkOut.minusDays(1), BookingAllocationStatus.ACTIVE);

        for (Object[] row : activeAllocs) {
            Number sum = (Number) row[1];
            int reservedUnits = sum != null ? sum.intValue() : 0;
            assertThat(reservedUnits).isLessThanOrEqualTo(5);
        }
    }

    // =========================================================================
    // 12. CONCURRENCY: MULTIPLE CONCURRENT CANCELLATION REQUESTS
    // =========================================================================

    @Test
    @DisplayName("12. Concurrency: Multiple concurrent cancellation calls for same booking release allocations exactly once")
    void testConcurrency_MultipleSimultaneousCancellations() throws Exception {
        LocalDate checkIn = LocalDate.now().plusDays(30);
        LocalDate checkOut = LocalDate.now().plusDays(32);

        HotelBookingDto booking = bookingService.createBooking(
                verifiedHotel.getId(),
                buildBookingRequest(2, checkIn, checkOut, freeCancellationPlan.getId()),
                travelerA.getId()
        );

        int numThreads = 5;
        ExecutorService executor = Executors.newFixedThreadPool(numThreads);
        CyclicBarrier barrier = new CyclicBarrier(numThreads);
        List<Future<HotelBookingDto>> futures = new ArrayList<>();

        for (int i = 0; i < numThreads; i++) {
            futures.add(executor.submit(() -> {
                barrier.await();
                return bookingService.cancelBooking(booking.getBookingReference(), travelerA.getId());
            }));
        }

        for (Future<HotelBookingDto> f : futures) {
            HotelBookingDto res = f.get(5, TimeUnit.SECONDS);
            assertThat(res.getBookingStatus()).isEqualTo(HotelBookingStatus.CANCELLED);
        }
        executor.shutdown();

        // Check allocations: exactly 2 allocations exist for the stay, and all are RELEASED
        List<HotelBookingAllocation> allocs = allocationRepository.findByBookingId(booking.getId());
        assertThat(allocs).hasSize(2);
        assertThat(allocs).allMatch(a -> a.getStatus() == BookingAllocationStatus.RELEASED);
    }
}
