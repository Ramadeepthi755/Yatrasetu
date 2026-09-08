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
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
public class Phase22HotelBookingTest {

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
    private HotelPaymentTransactionRepository transactionRepository;

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
    private Hotel unverifiedHotel;
    private Hotel inactiveHotel;
    private HotelRoomType deluxeRoom;
    private HotelRoomType suiteRoom;
    private HotelRoomType inactiveRoom;
    private HotelRatePlan flexibleRatePlan;
    private HotelRatePlan nonRefundableRatePlan;
    private HotelRatePlan inactiveRatePlan;

    @BeforeEach
    void setUp() {
        cleanup();

        // 1. Users
        travelerA = userRepository.save(User.builder()
                .id("usr-traveler-a")
                .authUserId("auth-traveler-a")
                .email("rahul.traveler@example.com")
                .fullName("Rahul Sharma")
                .role(Role.TRAVELER)
                .verified(true)
                .verificationStatus(VerificationStatus.APPROVED)
                .active(true)
                .build());

        travelerB = userRepository.save(User.builder()
                .id("usr-traveler-b")
                .authUserId("auth-traveler-b")
                .email("priya.traveler@example.com")
                .fullName("Priya Patel")
                .role(Role.TRAVELER)
                .verified(true)
                .verificationStatus(VerificationStatus.APPROVED)
                .active(true)
                .build());

        partnerA = userRepository.save(User.builder()
                .id("usr-partner-a")
                .authUserId("auth-partner-a")
                .email("partner.a@yatrasetu.com")
                .fullName("Mysuru Royal Stays")
                .role(Role.PARTNER)
                .partnerSubtype(PartnerSubtype.HOTEL)
                .verified(true)
                .verificationStatus(VerificationStatus.APPROVED)
                .active(true)
                .build());

        partnerB = userRepository.save(User.builder()
                .id("usr-partner-b")
                .authUserId("auth-partner-b")
                .email("partner.b@yatrasetu.com")
                .fullName("Coorg Coffee Retreat")
                .role(Role.PARTNER)
                .partnerSubtype(PartnerSubtype.HOMESTAY)
                .verified(true)
                .verificationStatus(VerificationStatus.APPROVED)
                .active(true)
                .build());

        govtUser = userRepository.save(User.builder()
                .id("usr-govt-officer")
                .authUserId("auth-govt-officer")
                .email("officer@tourism.gov.in")
                .fullName("Director of Tourism")
                .role(Role.GOVERNMENT)
                .verified(true)
                .verificationStatus(VerificationStatus.APPROVED)
                .active(true)
                .build());

        // 2. Geography
        testState = stateRepository.save(State.builder()
                .id("IN-KA")
                .stateName("Karnataka")
                .region("South India")
                .build());

        testCity = cityRepository.save(City.builder()
                .id("city-mysuru")
                .cityName("Mysuru")
                .state(testState)
                .latitude(BigDecimal.valueOf(12.2958))
                .longitude(BigDecimal.valueOf(76.6394))
                .build());

        // 3. Hotels
        verifiedHotel = hotelRepository.save(Hotel.builder()
                .id("hotel-mysuru-royal")
                .hotelName("Mysuru Royal Palace Hotel")
                .city(testCity)
                .owner(partnerA)
                .isPartnerProperty(true)
                .verificationStatus(HotelVerificationStatus.VERIFIED)
                .verifiedAt(Instant.now())
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .pricePerNight(BigDecimal.valueOf(5000))
                .isActive(true)
                .build());

        datasetHotel = hotelRepository.save(Hotel.builder()
                .id("hotel-dataset-heritage")
                .hotelName("Legacy Dataset Lodge")
                .city(testCity)
                .owner(null)
                .isPartnerProperty(false)
                .verificationStatus(HotelVerificationStatus.UNVERIFIED)
                .sourceType(SourceType.DATASET)
                .pricePerNight(BigDecimal.valueOf(2000))
                .isActive(true)
                .build());

        unverifiedHotel = hotelRepository.save(Hotel.builder()
                .id("hotel-unverified-inn")
                .hotelName("Pending Approval Inn")
                .city(testCity)
                .owner(partnerA)
                .isPartnerProperty(true)
                .verificationStatus(HotelVerificationStatus.PENDING_REVIEW)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .pricePerNight(BigDecimal.valueOf(3000))
                .isActive(true)
                .build());

        inactiveHotel = hotelRepository.save(Hotel.builder()
                .id("hotel-inactive-resort")
                .hotelName("Closed Down Resort")
                .city(testCity)
                .owner(partnerA)
                .isPartnerProperty(true)
                .verificationStatus(HotelVerificationStatus.VERIFIED)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .pricePerNight(BigDecimal.valueOf(4000))
                .isActive(false)
                .build());

        // 4. Room Types
        deluxeRoom = roomTypeRepository.save(HotelRoomType.builder()
                .id("room-deluxe-201")
                .hotel(verifiedHotel)
                .roomTypeName("Deluxe Palace View")
                .description("Spacious room with palace garden view")
                .maxOccupancy(3)
                .baseInventoryUnits(5)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .isActive(true)
                .build());

        suiteRoom = roomTypeRepository.save(HotelRoomType.builder()
                .id("room-suite-202")
                .hotel(verifiedHotel)
                .roomTypeName("Maharaja Suite")
                .description("Luxury suite with private balcony")
                .maxOccupancy(4)
                .baseInventoryUnits(2)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .isActive(true)
                .build());

        inactiveRoom = roomTypeRepository.save(HotelRoomType.builder()
                .id("room-inactive-203")
                .hotel(verifiedHotel)
                .roomTypeName("Under Renovation Room")
                .description("Currently closed for remodeling")
                .maxOccupancy(2)
                .baseInventoryUnits(3)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .isActive(false)
                .build());

        // 5. Baseline Inventory (Deluxe = 5, Suite = 2)
        inventoryRepository.save(HotelInventory.builder()
                .id("inv-deluxe-base")
                .roomType(deluxeRoom)
                .inventoryDate(null)
                .totalUnits(5)
                .blockedUnits(0)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .build());

        inventoryRepository.save(HotelInventory.builder()
                .id("inv-suite-base")
                .roomType(suiteRoom)
                .inventoryDate(null)
                .totalUnits(2)
                .blockedUnits(0)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .build());

        // 6. Rate Plans
        flexibleRatePlan = ratePlanRepository.save(HotelRatePlan.builder()
                .id("rp-deluxe-flex")
                .roomType(deluxeRoom)
                .planName("Flexible Rate with Breakfast")
                .basePrice(BigDecimal.valueOf(5000.00))
                .currency("INR")
                .mealPlan(MealPlan.CP)
                .cancellationPolicy(CancellationPolicyType.FREE_CANCELLATION)
                .cancellationDeadlineHours(48)
                .status(RatePlanStatus.ACTIVE)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .build());

        nonRefundableRatePlan = ratePlanRepository.save(HotelRatePlan.builder()
                .id("rp-deluxe-nonref")
                .roomType(deluxeRoom)
                .planName("Non-Refundable Special")
                .basePrice(BigDecimal.valueOf(4200.00))
                .currency("INR")
                .mealPlan(MealPlan.EP)
                .cancellationPolicy(CancellationPolicyType.NON_REFUNDABLE)
                .status(RatePlanStatus.ACTIVE)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .build());

        inactiveRatePlan = ratePlanRepository.save(HotelRatePlan.builder()
                .id("rp-deluxe-inactive")
                .roomType(deluxeRoom)
                .planName("Expired Promotional Plan")
                .basePrice(BigDecimal.valueOf(3500.00))
                .currency("INR")
                .mealPlan(MealPlan.EP)
                .cancellationPolicy(CancellationPolicyType.NON_REFUNDABLE)
                .status(RatePlanStatus.INACTIVE)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .build());
    }

    @AfterEach
    void tearDown() {
        cleanup();
    }

    private void cleanup() {
        transactionRepository.deleteAll();
        statusHistoryRepository.deleteAll();
        allocationRepository.deleteAll();
        bookingRepository.deleteAll();
        inventoryRepository.deleteAll();
        ratePlanRepository.deleteAll();
        roomTypeRepository.deleteAll();
        hotelRepository.deleteAll();
        cityRepository.deleteAll();
        stateRepository.deleteAll();
        notificationRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("1. Guest / Unauthenticated booking attempt is rejected")
    void testUnauthenticatedBookingRejected() {
        CreateHotelBookingRequest request = CreateHotelBookingRequest.builder()
                .roomTypeId(deluxeRoom.getId())
                .ratePlanId(flexibleRatePlan.getId())
                .checkIn(LocalDate.of(2026, 10, 10))
                .checkOut(LocalDate.of(2026, 10, 12))
                .numberOfRooms(1)
                .adults(2)
                .guestName("Guest User")
                .guestEmail("guest@example.com")
                .guestPhone("+919876543210")
                .build();

        assertThatThrownBy(() -> bookingService.createBooking(verifiedHotel.getId(), request, null))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("2. Successful booking creates PENDING_PAYMENT / UNPAID reservation with correct allocations")
    void testSuccessfulBookingCreation() {
        LocalDate checkIn = LocalDate.of(2026, 10, 10);
        LocalDate checkOut = LocalDate.of(2026, 10, 13); // 3 nights: Oct 10, Oct 11, Oct 12

        CreateHotelBookingRequest request = CreateHotelBookingRequest.builder()
                .roomTypeId(deluxeRoom.getId())
                .ratePlanId(flexibleRatePlan.getId())
                .checkIn(checkIn)
                .checkOut(checkOut)
                .numberOfRooms(2)
                .adults(2)
                .guestName("Rahul Sharma")
                .guestEmail("rahul.traveler@example.com")
                .guestPhone("+919876543210")
                .specialRequests("Quiet room on high floor")
                .build();

        HotelBookingDto booking = bookingService.createBooking(verifiedHotel.getId(), request, travelerA.getEmail());

        assertThat(booking).isNotNull();
        assertThat(booking.getBookingReference()).startsWith("YTS-");
        assertThat(booking.getBookingStatus()).isEqualTo(HotelBookingStatus.PENDING_PAYMENT);
        assertThat(booking.getPaymentStatus()).isEqualTo(HotelPaymentStatus.UNPAID);
        assertThat(booking.getNumberOfNights()).isEqualTo(3);
        assertThat(booking.getNumberOfRooms()).isEqualTo(2);

        // Price snapshot check: 5000 * 3 nights * 2 rooms = 30000
        assertThat(booking.getPricePerNight()).isEqualByComparingTo("5000.00");
        assertThat(booking.getSubtotal()).isEqualByComparingTo("30000.00");
        assertThat(booking.getTaxesAmount()).isEqualByComparingTo("0.00");
        assertThat(booking.getFeesAmount()).isEqualByComparingTo("0.00");
        assertThat(booking.getTotalAmount()).isEqualByComparingTo("30000.00");
        assertThat(booking.getExpiresAt()).isNotNull();

        // Allocations check: 3 rows (Oct 10, Oct 11, Oct 12), allocatedUnits = 2
        List<HotelBookingAllocation> allocations = allocationRepository.findByBookingId(booking.getId());
        assertThat(allocations).hasSize(3);
        for (HotelBookingAllocation alloc : allocations) {
            assertThat(alloc.getAllocatedUnits()).isEqualTo(2);
            assertThat(alloc.getStatus()).isEqualTo(BookingAllocationStatus.ACTIVE);
            assertThat(alloc.getAllocationDate()).isBetween(checkIn, LocalDate.of(2026, 10, 12));
            assertThat(alloc.getAllocationDate()).isNotEqualTo(checkOut); // NOT Oct 13
        }

        // Verify physical inventory totalUnits is NOT modified
        List<HotelInventory> invList = inventoryRepository.findByRoomTypeIdInAndInventoryDateIsNull(List.of(deluxeRoom.getId()));
        assertThat(invList).hasSize(1);
        assertThat(invList.get(0).getTotalUnits()).isEqualTo(5); // Physical capacity remains 5
    }

    @Test
    @DisplayName("3. Booking attempt on dataset catalog hotel is strictly rejected")
    void testDatasetHotelBookingRejected() {
        CreateHotelBookingRequest request = CreateHotelBookingRequest.builder()
                .roomTypeId(deluxeRoom.getId())
                .ratePlanId(flexibleRatePlan.getId())
                .checkIn(LocalDate.of(2026, 10, 10))
                .checkOut(LocalDate.of(2026, 10, 11))
                .numberOfRooms(1)
                .adults(2)
                .guestName("Rahul Sharma")
                .guestEmail("rahul.traveler@example.com")
                .guestPhone("+919876543210")
                .build();

        assertThatThrownBy(() -> bookingService.createBooking(datasetHotel.getId(), request, travelerA.getEmail()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("dataset property");
    }

    @Test
    @DisplayName("4. Booking attempt on unverified or inactive hotel is rejected")
    void testUnverifiedOrInactiveHotelRejected() {
        CreateHotelBookingRequest request = CreateHotelBookingRequest.builder()
                .roomTypeId(deluxeRoom.getId())
                .ratePlanId(flexibleRatePlan.getId())
                .checkIn(LocalDate.of(2026, 10, 10))
                .checkOut(LocalDate.of(2026, 10, 11))
                .numberOfRooms(1)
                .adults(2)
                .guestName("Rahul Sharma")
                .guestEmail("rahul.traveler@example.com")
                .guestPhone("+919876543210")
                .build();

        // Unverified hotel
        assertThatThrownBy(() -> bookingService.createBooking(unverifiedHotel.getId(), request, travelerA.getEmail()))
                .isInstanceOf(IllegalArgumentException.class);

        // Inactive hotel
        assertThatThrownBy(() -> bookingService.createBooking(inactiveHotel.getId(), request, travelerA.getEmail()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("5. Inactive room type or inactive rate plan is rejected")
    void testInactiveRoomOrRatePlanRejected() {
        // Inactive room
        CreateHotelBookingRequest req1 = CreateHotelBookingRequest.builder()
                .roomTypeId(inactiveRoom.getId())
                .ratePlanId(flexibleRatePlan.getId())
                .checkIn(LocalDate.of(2026, 10, 10))
                .checkOut(LocalDate.of(2026, 10, 11))
                .numberOfRooms(1)
                .adults(2)
                .guestName("Rahul Sharma")
                .guestEmail("rahul.traveler@example.com")
                .guestPhone("+919876543210")
                .build();

        assertThatThrownBy(() -> bookingService.createBooking(verifiedHotel.getId(), req1, travelerA.getEmail()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("inactive");

        // Inactive rate plan
        CreateHotelBookingRequest req2 = CreateHotelBookingRequest.builder()
                .roomTypeId(deluxeRoom.getId())
                .ratePlanId(inactiveRatePlan.getId())
                .checkIn(LocalDate.of(2026, 10, 10))
                .checkOut(LocalDate.of(2026, 10, 11))
                .numberOfRooms(1)
                .adults(2)
                .guestName("Rahul Sharma")
                .guestEmail("rahul.traveler@example.com")
                .guestPhone("+919876543210")
                .build();

        assertThatThrownBy(() -> bookingService.createBooking(verifiedHotel.getId(), req2, travelerA.getEmail()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("inactive");
    }

    @Test
    @DisplayName("6. Mismatched room/hotel or rate/room hierarchy is rejected")
    void testHierarchyMismatchRejected() {
        // Rate plan belonging to deluxeRoom, but request passes suiteRoom
        CreateHotelBookingRequest request = CreateHotelBookingRequest.builder()
                .roomTypeId(suiteRoom.getId())
                .ratePlanId(flexibleRatePlan.getId()) // belongs to deluxeRoom
                .checkIn(LocalDate.of(2026, 10, 10))
                .checkOut(LocalDate.of(2026, 10, 11))
                .numberOfRooms(1)
                .adults(2)
                .guestName("Rahul Sharma")
                .guestEmail("rahul.traveler@example.com")
                .guestPhone("+919876543210")
                .build();

        assertThatThrownBy(() -> bookingService.createBooking(verifiedHotel.getId(), request, travelerA.getEmail()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("does not belong to room type");
    }

    @Test
    @DisplayName("7. Active booking allocations dynamically reduce availability and block overbooking")
    void testActiveAllocationsReduceAvailability() {
        LocalDate checkIn = LocalDate.of(2026, 10, 10);
        LocalDate checkOut = LocalDate.of(2026, 10, 12); // 2 nights

        // Capacity is 5. Traveler A books 3 rooms.
        CreateHotelBookingRequest reqA = CreateHotelBookingRequest.builder()
                .roomTypeId(deluxeRoom.getId())
                .ratePlanId(flexibleRatePlan.getId())
                .checkIn(checkIn)
                .checkOut(checkOut)
                .numberOfRooms(3)
                .adults(2)
                .guestName("Rahul Sharma")
                .guestEmail("rahul.traveler@example.com")
                .guestPhone("+919876543210")
                .build();

        bookingService.createBooking(verifiedHotel.getId(), reqA, travelerA.getEmail());

        // Check availability: Remaining should be 5 - 3 = 2
        HotelAvailabilityDto avail = availabilityService.getHotelAvailability(
                verifiedHotel.getId(), deluxeRoom.getId(), checkIn, checkOut, 2);
        assertThat(avail.getRooms().get(0).getAvailableUnits()).isEqualTo(2);

        // Traveler B attempts to book 3 rooms -> Must fail with ConflictException (409)
        CreateHotelBookingRequest reqB = CreateHotelBookingRequest.builder()
                .roomTypeId(deluxeRoom.getId())
                .ratePlanId(flexibleRatePlan.getId())
                .checkIn(checkIn)
                .checkOut(checkOut)
                .numberOfRooms(3)
                .adults(2)
                .guestName("Priya Patel")
                .guestEmail("priya.traveler@example.com")
                .guestPhone("+919876543211")
                .build();

        assertThatThrownBy(() -> bookingService.createBooking(verifiedHotel.getId(), reqB, travelerB.getEmail()))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Insufficient room availability");

        // Traveler B books remaining 2 rooms -> Succeeds
        reqB.setNumberOfRooms(2);
        HotelBookingDto bookingB = bookingService.createBooking(verifiedHotel.getId(), reqB, travelerB.getEmail());
        assertThat(bookingB.getNumberOfRooms()).isEqualTo(2);

        // Check availability again: Now SOLD OUT (0 units)
        HotelAvailabilityDto soldOutAvail = availabilityService.getHotelAvailability(
                verifiedHotel.getId(), deluxeRoom.getId(), checkIn, checkOut, 2);
        assertThat(soldOutAvail.getRooms().get(0).getAvailableUnits()).isEqualTo(0);
        assertThat(soldOutAvail.getRooms().get(0).getStatus()).isEqualTo(HotelAvailabilityStatus.SOLD_OUT);
    }

    @Test
    @DisplayName("8. Blocked inventory correctly reduces available capacity")
    void testBlockedInventoryReducesAvailability() {
        LocalDate checkIn = LocalDate.of(2026, 10, 10);
        LocalDate checkOut = LocalDate.of(2026, 10, 12);

        // Add date override on Oct 10 with 3 blocked units (Total = 5, Blocked = 3 -> Available = 2)
        inventoryRepository.save(HotelInventory.builder()
                .id("inv-override-oct10")
                .roomType(deluxeRoom)
                .inventoryDate(LocalDate.of(2026, 10, 10))
                .totalUnits(5)
                .blockedUnits(3)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .build());

        // Booking 3 rooms across Oct 10-12 must fail because Oct 10 only has 2 available
        CreateHotelBookingRequest req = CreateHotelBookingRequest.builder()
                .roomTypeId(deluxeRoom.getId())
                .ratePlanId(flexibleRatePlan.getId())
                .checkIn(checkIn)
                .checkOut(checkOut)
                .numberOfRooms(3)
                .adults(2)
                .guestName("Rahul Sharma")
                .guestEmail("rahul.traveler@example.com")
                .guestPhone("+919876543210")
                .build();

        assertThatThrownBy(() -> bookingService.createBooking(verifiedHotel.getId(), req, travelerA.getEmail()))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    @DisplayName("9. Idempotency key protection and conflict rejection")
    void testIdempotencyHandling() {
        String idempotencyKey = "idemp-unique-123456789";
        LocalDate checkIn = LocalDate.of(2026, 10, 10);
        LocalDate checkOut = LocalDate.of(2026, 10, 11);

        CreateHotelBookingRequest req1 = CreateHotelBookingRequest.builder()
                .roomTypeId(deluxeRoom.getId())
                .ratePlanId(flexibleRatePlan.getId())
                .checkIn(checkIn)
                .checkOut(checkOut)
                .numberOfRooms(1)
                .adults(2)
                .idempotencyKey(idempotencyKey)
                .guestName("Rahul Sharma")
                .guestEmail("rahul.traveler@example.com")
                .guestPhone("+919876543210")
                .build();

        // 1st request -> Creates booking
        HotelBookingDto first = bookingService.createBooking(verifiedHotel.getId(), req1, travelerA.getEmail());
        assertThat(first).isNotNull();

        // 2nd request with exact same key and parameters -> Returns same booking without extra allocations
        HotelBookingDto second = bookingService.createBooking(verifiedHotel.getId(), req1, travelerA.getEmail());
        assertThat(second.getBookingReference()).isEqualTo(first.getBookingReference());
        assertThat(second.getId()).isEqualTo(first.getId());

        // Verify allocations count is still 1 (not duplicated)
        List<HotelBookingAllocation> allocations = allocationRepository.findByBookingId(first.getId());
        assertThat(allocations).hasSize(1);

        // 3rd request with same key but DIFFERENT parameters (e.g. 2 rooms instead of 1) -> Must throw 409 Conflict
        CreateHotelBookingRequest reqDifferent = CreateHotelBookingRequest.builder()
                .roomTypeId(deluxeRoom.getId())
                .ratePlanId(flexibleRatePlan.getId())
                .checkIn(checkIn)
                .checkOut(checkOut)
                .numberOfRooms(2) // Changed from 1 to 2
                .adults(2)
                .idempotencyKey(idempotencyKey)
                .guestName("Rahul Sharma")
                .guestEmail("rahul.traveler@example.com")
                .guestPhone("+919876543210")
                .build();

        assertThatThrownBy(() -> bookingService.createBooking(verifiedHotel.getId(), reqDifferent, travelerA.getEmail()))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("previously used for a different booking");
    }

    @Test
    @DisplayName("10. Price snapshot immutability: Subsequent rate plan changes do not alter booked price")
    void testPriceSnapshotImmutability() {
        LocalDate checkIn = LocalDate.of(2026, 10, 10);
        LocalDate checkOut = LocalDate.of(2026, 10, 12); // 2 nights

        CreateHotelBookingRequest req = CreateHotelBookingRequest.builder()
                .roomTypeId(deluxeRoom.getId())
                .ratePlanId(flexibleRatePlan.getId()) // ₹5000 / night
                .checkIn(checkIn)
                .checkOut(checkOut)
                .numberOfRooms(1)
                .adults(2)
                .guestName("Rahul Sharma")
                .guestEmail("rahul.traveler@example.com")
                .guestPhone("+919876543210")
                .build();

        HotelBookingDto booking = bookingService.createBooking(verifiedHotel.getId(), req, travelerA.getEmail());
        assertThat(booking.getTotalAmount()).isEqualByComparingTo("10000.00");

        // Partner updates rate plan base price from ₹5000 to ₹9000
        flexibleRatePlan.setBasePrice(BigDecimal.valueOf(9000.00));
        ratePlanRepository.save(flexibleRatePlan);

        // Reload existing booking -> Must retain immutable ₹10000 snapshot
        HotelBookingDto reloaded = bookingService.getBookingByReference(booking.getBookingReference(), travelerA.getEmail());
        assertThat(reloaded.getPricePerNight()).isEqualByComparingTo("5000.00");
        assertThat(reloaded.getTotalAmount()).isEqualByComparingTo("10000.00");
    }

    @Test
    @DisplayName("11. RBAC and PII masking: Traveler isolation and Partner view")
    void testRbacAndPiiMasking() {
        CreateHotelBookingRequest req = CreateHotelBookingRequest.builder()
                .roomTypeId(deluxeRoom.getId())
                .ratePlanId(flexibleRatePlan.getId())
                .checkIn(LocalDate.of(2026, 10, 10))
                .checkOut(LocalDate.of(2026, 10, 11))
                .numberOfRooms(1)
                .adults(2)
                .guestName("Rahul Sharma")
                .guestEmail("rahul.traveler@example.com")
                .guestPhone("+919876543210")
                .build();

        HotelBookingDto booking = bookingService.createBooking(verifiedHotel.getId(), req, travelerA.getEmail());

        // Traveler A can view full unmasked details
        HotelBookingDto travelerAView = bookingService.getBookingByReference(booking.getBookingReference(), travelerA.getEmail());
        assertThat(travelerAView.getGuestPhone()).isEqualTo("+919876543210");
        assertThat(travelerAView.getGuestEmail()).isEqualTo("rahul.traveler@example.com");

        // Traveler B is denied access to Traveler A's booking
        assertThatThrownBy(() -> bookingService.getBookingByReference(booking.getBookingReference(), travelerB.getEmail()))
                .isInstanceOf(AccessDeniedException.class);

        // Partner A (hotel owner) can view booking with masked PII
        HotelBookingDto partnerAView = bookingService.getBookingByReference(booking.getBookingReference(), partnerA.getEmail());
        assertThat(partnerAView.getGuestPhone()).startsWith("******");
        assertThat(partnerAView.getGuestEmail()).doesNotContain("rahul.traveler");

        // Partner B (different hotel owner) is denied access
        assertThatThrownBy(() -> bookingService.getBookingByReference(booking.getBookingReference(), partnerB.getEmail()))
                .isInstanceOf(AccessDeniedException.class);

        // Partner A list bookings endpoint
        List<HotelBookingDto> partnerBookings = bookingService.getPartnerHotelBookings(verifiedHotel.getId(), partnerA.getEmail());
        assertThat(partnerBookings).hasSize(1);
        assertThat(partnerBookings.get(0).getGuestPhone()).startsWith("******");
    }

    @Test
    @DisplayName("12. Option A Pending Expiry: Releases allocations and restores availability")
    void testOptionAPendingExpiryAndIdempotency() {
        LocalDate checkIn = LocalDate.of(2026, 10, 10);
        LocalDate checkOut = LocalDate.of(2026, 10, 11);

        // Book all 5 rooms of deluxe room
        CreateHotelBookingRequest req = CreateHotelBookingRequest.builder()
                .roomTypeId(deluxeRoom.getId())
                .ratePlanId(flexibleRatePlan.getId())
                .checkIn(checkIn)
                .checkOut(checkOut)
                .numberOfRooms(5)
                .adults(2)
                .guestName("Rahul Sharma")
                .guestEmail("rahul.traveler@example.com")
                .guestPhone("+919876543210")
                .build();

        HotelBookingDto booking = bookingService.createBooking(verifiedHotel.getId(), req, travelerA.getEmail());

        // Availability is now 0
        HotelAvailabilityDto avail1 = availabilityService.getHotelAvailability(
                verifiedHotel.getId(), deluxeRoom.getId(), checkIn, checkOut, 2);
        assertThat(avail1.getRooms().get(0).getAvailableUnits()).isEqualTo(0);

        // Simulate expiration by setting expiresAt in the past
        HotelBooking entity = bookingRepository.findById(booking.getId()).orElseThrow();
        entity.setExpiresAt(Instant.now().minusSeconds(60));
        bookingRepository.save(entity);

        // Run expiry job
        int expiredCount = bookingService.expirePendingBookings();
        assertThat(expiredCount).isEqualTo(1);

        // Verify booking status is EXPIRED and allocations RELEASED
        HotelBooking reloaded = bookingRepository.findById(booking.getId()).orElseThrow();
        assertThat(reloaded.getBookingStatus()).isEqualTo(HotelBookingStatus.EXPIRED);

        List<HotelBookingAllocation> allocs = allocationRepository.findByBookingId(booking.getId());
        for (HotelBookingAllocation a : allocs) {
            assertThat(a.getStatus()).isEqualTo(BookingAllocationStatus.RELEASED);
        }

        // Availability immediately restored to 5
        HotelAvailabilityDto avail2 = availabilityService.getHotelAvailability(
                verifiedHotel.getId(), deluxeRoom.getId(), checkIn, checkOut, 2);
        assertThat(avail2.getRooms().get(0).getAvailableUnits()).isEqualTo(5);

        // Running expiry second time is idempotent (0 expired, no double release)
        int secondRun = bookingService.expirePendingBookings();
        assertThat(secondRun).isEqualTo(0);
    }

    @Test
    @DisplayName("13. Cancellation releases allocations and restores availability")
    void testBookingCancellation() {
        LocalDate checkIn = LocalDate.of(2026, 10, 10);
        LocalDate checkOut = LocalDate.of(2026, 10, 11);

        CreateHotelBookingRequest req = CreateHotelBookingRequest.builder()
                .roomTypeId(deluxeRoom.getId())
                .ratePlanId(flexibleRatePlan.getId())
                .checkIn(checkIn)
                .checkOut(checkOut)
                .numberOfRooms(3)
                .adults(2)
                .guestName("Rahul Sharma")
                .guestEmail("rahul.traveler@example.com")
                .guestPhone("+919876543210")
                .build();

        HotelBookingDto booking = bookingService.createBooking(verifiedHotel.getId(), req, travelerA.getEmail());

        // Availability is 2
        HotelAvailabilityDto avail1 = availabilityService.getHotelAvailability(
                verifiedHotel.getId(), deluxeRoom.getId(), checkIn, checkOut, 2);
        assertThat(avail1.getRooms().get(0).getAvailableUnits()).isEqualTo(2);

        // Cancel booking
        HotelBookingDto cancelled = bookingService.cancelBooking(booking.getBookingReference(), "Change of travel plans", travelerA.getEmail());
        assertThat(cancelled.getBookingStatus()).isEqualTo(HotelBookingStatus.CANCELLED);

        // Allocations are RELEASED
        List<HotelBookingAllocation> allocs = allocationRepository.findByBookingId(booking.getId());
        for (HotelBookingAllocation a : allocs) {
            assertThat(a.getStatus()).isEqualTo(BookingAllocationStatus.RELEASED);
        }

        // Availability restored to 5
        HotelAvailabilityDto avail2 = availabilityService.getHotelAvailability(
                verifiedHotel.getId(), deluxeRoom.getId(), checkIn, checkOut, 2);
        assertThat(avail2.getRooms().get(0).getAvailableUnits()).isEqualTo(5);
    }

    @Test
    @DisplayName("14. Concurrency Test: 2 concurrent threads requesting 3 rooms each on capacity 5 (Never overbook)")
    void testConcurrentBookingNoOverbooking() throws Exception {
        LocalDate checkIn = LocalDate.of(2026, 10, 10);
        LocalDate checkOut = LocalDate.of(2026, 10, 12); // 2 nights

        // Physical inventory = 5
        // Thread A requests 3 rooms
        // Thread B requests 3 rooms
        // Total requested = 6 (> 5). Exactly one must succeed and one must fail.

        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch latch = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);

        Callable<Void> taskA = () -> {
            latch.await();
            try {
                CreateHotelBookingRequest req = CreateHotelBookingRequest.builder()
                        .roomTypeId(deluxeRoom.getId())
                        .ratePlanId(flexibleRatePlan.getId())
                        .checkIn(checkIn)
                        .checkOut(checkOut)
                        .numberOfRooms(3)
                        .adults(2)
                        .guestName("Traveler Thread A")
                        .guestEmail("rahul.traveler@example.com")
                        .guestPhone("+919876543210")
                        .build();
                bookingService.createBooking(verifiedHotel.getId(), req, travelerA.getEmail());
                successCount.incrementAndGet();
            } catch (ConflictException e) {
                conflictCount.incrementAndGet();
            }
            return null;
        };

        Callable<Void> taskB = () -> {
            latch.await();
            try {
                CreateHotelBookingRequest req = CreateHotelBookingRequest.builder()
                        .roomTypeId(deluxeRoom.getId())
                        .ratePlanId(flexibleRatePlan.getId())
                        .checkIn(checkIn)
                        .checkOut(checkOut)
                        .numberOfRooms(3)
                        .adults(2)
                        .guestName("Traveler Thread B")
                        .guestEmail("priya.traveler@example.com")
                        .guestPhone("+919876543211")
                        .build();
                bookingService.createBooking(verifiedHotel.getId(), req, travelerB.getEmail());
                successCount.incrementAndGet();
            } catch (ConflictException e) {
                conflictCount.incrementAndGet();
            }
            return null;
        };

        Future<Void> f1 = executor.submit(taskA);
        Future<Void> f2 = executor.submit(taskB);

        // Start both simultaneously
        latch.countDown();

        f1.get(10, TimeUnit.SECONDS);
        f2.get(10, TimeUnit.SECONDS);
        executor.shutdown();

        // Exactly one should succeed and one should get ConflictException (409)
        assertThat(successCount.get()).isEqualTo(1);
        assertThat(conflictCount.get()).isEqualTo(1);

        // Total active allocations in DB must be exactly 3 units per night (<= 5 capacity)
        List<Object[]> activeReserved = allocationRepository.findActiveReservedUnitsByRoomTypeIdsAndDateRange(
                List.of(deluxeRoom.getId()), checkIn, checkOut.minusDays(1), BookingAllocationStatus.ACTIVE);

        for (Object[] row : activeReserved) {
            Number totalReserved = (Number) row[2];
            assertThat(totalReserved.intValue()).isEqualTo(3);
        }

        // Remaining availability must be 5 - 3 = 2
        HotelAvailabilityDto finalAvail = availabilityService.getHotelAvailability(
                verifiedHotel.getId(), deluxeRoom.getId(), checkIn, checkOut, 2);
        assertThat(finalAvail.getRooms().get(0).getAvailableUnits()).isEqualTo(2);

        // Physical inventory total_units is strictly 5 (never mutated)
        List<HotelInventory> invList = inventoryRepository.findByRoomTypeIdInAndInventoryDateIsNull(List.of(deluxeRoom.getId()));
        assertThat(invList.get(0).getTotalUnits()).isEqualTo(5);
    }
}
