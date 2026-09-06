package com.yatrasetu.service;

import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
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
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
public class Phase22_10PartnerOperationsTest {

    @Autowired
    private HotelService hotelService;

    @Autowired
    private HotelRoomService hotelRoomService;

    @Autowired
    private HotelRatePlanService hotelRatePlanService;

    @Autowired
    private HotelBookingService bookingService;

    @Autowired
    private HotelPaymentService paymentService;

    @Autowired
    private NotificationService notificationService;

    @MockBean
    private PaymentProvider paymentProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StateRepository stateRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private HotelRoomTypeRepository roomTypeRepository;

    @Autowired
    private HotelInventoryRepository inventoryRepository;

    @Autowired
    private HotelRatePlanRepository ratePlanRepository;

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

    private User partnerA;
    private User partnerB;
    private User traveler;
    private State testState;
    private City testCity;
    private Hotel datasetHotel;

    private static final String TEST_ORDER_ID = "order_p22_10_test_123";
    private static final String TEST_PAYMENT_ID = "pay_p22_10_test_987";
    private static final String TEST_VALID_SIGNATURE = "valid_sig_p22_10";

    @BeforeEach
    void setUp() {
        // Clean up transient entities
        cleanup();

        when(paymentProvider.isAvailable()).thenReturn(true);
        when(paymentProvider.getProviderName()).thenReturn("RAZORPAY");
        when(paymentProvider.getPublicKeyId()).thenReturn("rzp_test_key_partner");
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

        // 1. Create Users
        partnerA = userRepository.save(User.builder()
                .id("usr-partner-a-" + UUID.randomUUID())
                .authUserId("auth-partner-a-" + UUID.randomUUID())
                .email("partnerA@yatrasetu.com")
                .fullName("Partner Alpha Stays")
                .role(Role.PARTNER)
                .partnerSubtype(PartnerSubtype.HOTEL)
                .build());

        partnerB = userRepository.save(User.builder()
                .id("usr-partner-b-" + UUID.randomUUID())
                .authUserId("auth-partner-b-" + UUID.randomUUID())
                .email("partnerB@yatrasetu.com")
                .fullName("Partner Beta Hotels")
                .role(Role.PARTNER)
                .partnerSubtype(PartnerSubtype.HOTEL)
                .build());

        traveler = userRepository.save(User.builder()
                .id("usr-traveler-" + UUID.randomUUID())
                .authUserId("auth-traveler-" + UUID.randomUUID())
                .email("traveler@yatrasetu.com")
                .fullName("Rahul Sharma")
                .role(Role.TRAVELER)
                .build());

        // 2. Geography
        testState = stateRepository.save(State.builder()
                .id("state-rajasthan")
                .stateName("Rajasthan")
                .region("North India")
                .build());

        testCity = cityRepository.save(City.builder()
                .id("city-udaipur")
                .cityName("Udaipur")
                .state(testState)
                .latitude(BigDecimal.valueOf(24.5854))
                .longitude(BigDecimal.valueOf(73.7125))
                .build());

        // 3. Dataset Catalog Hotel (Read-only, non-claimable)
        datasetHotel = hotelRepository.save(Hotel.builder()
                .id("hotel-dataset-catalog-1")
                .hotelName("Udaipur Heritage Palace (Catalog)")
                .city(testCity)
                .pricePerNight(BigDecimal.valueOf(4500))
                .hotelRating(BigDecimal.valueOf(4.5))
                .isPartnerProperty(false)
                .sourceType(SourceType.DATASET)
                .verificationStatus(HotelVerificationStatus.UNVERIFIED)
                .isActive(true)
                .build());
    }

    @AfterEach
    void tearDown() {
        cleanup();
    }

    private void cleanup() {
        notificationRepository.deleteAll();
        transactionRepository.deleteAll();
        webhookEventRepository.deleteAll();
        allocationRepository.deleteAll();
        statusHistoryRepository.deleteAll();
        bookingRepository.deleteAll();
        ratePlanRepository.deleteAll();
        inventoryRepository.deleteAll();
        roomTypeRepository.deleteAll();
        hotelRepository.deleteAll();
        cityRepository.deleteAll();
        stateRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void test01_partnerCanCreateOwnHotel() {
        CreateHotelRequest req = CreateHotelRequest.builder()
                .hotelName("Alpha Lake Resort")
                .cityId(testCity.getId())
                .category("RESORT")
                .pricePerNight(BigDecimal.valueOf(5000))
                .address("Pichola Lake Road, Udaipur")
                .amenities(List.of("WiFi", "Pool", "Lake View"))
                .contactPhone("+91 9876543210")
                .contactEmail("contact@alphalake.com")
                .build();

        HotelDto created = hotelService.createPartnerHotel(partnerA.getId(), req);

        assertThat(created).isNotNull();
        assertThat(created.getId()).isNotNull();
        assertThat(created.getHotelName()).isEqualTo("Alpha Lake Resort");
        assertThat(created.getOwnerId()).isEqualTo(partnerA.getId());
        assertThat(created.getSourceType()).isEqualTo("PARTNER_SUBMITTED");
        assertThat(created.getVerificationStatus()).isEqualTo("UNVERIFIED");
        assertThat(created.getIsPartnerProperty()).isTrue();
    }

    @Test
    void test02_travelerCannotCreatePartnerHotel() {
        CreateHotelRequest req = CreateHotelRequest.builder()
                .hotelName("Traveler Rogue Hotel")
                .cityId(testCity.getId())
                .pricePerNight(BigDecimal.valueOf(3000))
                .build();

        assertThatThrownBy(() -> hotelService.createPartnerHotel(traveler.getId(), req))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("User does not have PARTNER role privileges");
    }

    @Test
    void test03_partnerCannotEditAnotherPartnersHotel() {
        CreateHotelRequest req = CreateHotelRequest.builder()
                .hotelName("Alpha Grand")
                .cityId(testCity.getId())
                .pricePerNight(BigDecimal.valueOf(4000))
                .build();
        HotelDto hotelA = hotelService.createPartnerHotel(partnerA.getId(), req);

        UpdateHotelRequest updateReq = UpdateHotelRequest.builder()
                .hotelName("Hijacked by Partner B")
                .cityId(testCity.getId())
                .pricePerNight(BigDecimal.valueOf(2000))
                .build();

        assertThatThrownBy(() -> hotelService.updatePartnerHotel(partnerB.getId(), hotelA.getId(), updateReq))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("You do not own this hotel property");
    }

    @Test
    void test04_partnerCannotClaimDatasetHotel() {
        UpdateHotelRequest updateReq = UpdateHotelRequest.builder()
                .hotelName("Claimed Dataset Hotel")
                .cityId(testCity.getId())
                .pricePerNight(BigDecimal.valueOf(3000))
                .build();

        assertThatThrownBy(() -> hotelService.updatePartnerHotel(partnerA.getId(), datasetHotel.getId(), updateReq))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void test05_datasetHotelRemainsCatalogOnlyAndNonBookable() {
        Hotel reloaded = hotelRepository.findById(datasetHotel.getId()).orElseThrow();
        assertThat(reloaded.getSourceType()).isEqualTo(SourceType.DATASET);
        assertThat(reloaded.getIsPartnerProperty()).isFalse();
        assertThat(reloaded.getOwner()).isNull();

        String bookability = hotelService.deriveBookabilityStatus(reloaded);
        assertThat(bookability).isEqualTo("UNVERIFIED");
    }

    @Test
    void test06_submitHotelForVerificationTransitionsToPendingReview() {
        CreateHotelRequest req = CreateHotelRequest.builder()
                .hotelName("Alpha Boutique Stay")
                .cityId(testCity.getId())
                .pricePerNight(BigDecimal.valueOf(3500))
                .build();
        HotelDto hotelA = hotelService.createPartnerHotel(partnerA.getId(), req);
        assertThat(hotelA.getVerificationStatus()).isEqualTo("UNVERIFIED");

        HotelDto submitted = hotelService.submitHotelForVerification(partnerA.getId(), hotelA.getId());
        assertThat(submitted.getVerificationStatus()).isEqualTo("PENDING_REVIEW");

        // Partner B cannot submit Partner A's hotel
        assertThatThrownBy(() -> hotelService.submitHotelForVerification(partnerB.getId(), hotelA.getId()))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void test07_governmentVerificationWorkflow() {
        CreateHotelRequest req = CreateHotelRequest.builder()
                .hotelName("Alpha Palace")
                .cityId(testCity.getId())
                .pricePerNight(BigDecimal.valueOf(6000))
                .build();
        HotelDto hotel = hotelService.createPartnerHotel(partnerA.getId(), req);
        hotelService.submitHotelForVerification(partnerA.getId(), hotel.getId());

        // Government Approves
        HotelVerificationRequest approveReq = HotelVerificationRequest.builder()
                .decision("APPROVED")
                .notes("Verified on-site by Ministry Official.")
                .build();
        HotelDto verified = hotelService.verifyHotel("gov-officer-1", hotel.getId(), approveReq);

        assertThat(verified.getVerificationStatus()).isEqualTo("VERIFIED");
        assertThat(verified.getVerifiedBy()).isEqualTo("gov-officer-1");
    }

    @Test
    void test08_sensitiveEditsOnVerifiedPropertyResetStatusToPendingReview() {
        CreateHotelRequest req = CreateHotelRequest.builder()
                .hotelName("Alpha Heritage")
                .cityId(testCity.getId())
                .address("100 Old City Road")
                .category("HOTEL")
                .pricePerNight(BigDecimal.valueOf(4500))
                .build();
        HotelDto hotel = hotelService.createPartnerHotel(partnerA.getId(), req);
        hotelService.submitHotelForVerification(partnerA.getId(), hotel.getId());

        hotelService.verifyHotel("gov-officer-1", hotel.getId(),
                HotelVerificationRequest.builder().decision("APPROVED").build());

        Hotel reloaded = hotelRepository.findById(hotel.getId()).orElseThrow();
        assertThat(reloaded.getVerificationStatus()).isEqualTo(HotelVerificationStatus.VERIFIED);

        // Partner changes property name / address -> triggers re-verification requirement
        UpdateHotelRequest updateReq = UpdateHotelRequest.builder()
                .hotelName("Alpha Heritage Extended & Spa")
                .cityId(testCity.getId())
                .address("200 New Extension Road")
                .category("HOTEL")
                .pricePerNight(BigDecimal.valueOf(5500))
                .build();

        HotelDto updated = hotelService.updatePartnerHotel(partnerA.getId(), hotel.getId(), updateReq);
        assertThat(updated.getVerificationStatus()).isEqualTo("PENDING_REVIEW");
        assertThat(updated.getVerificationNotes()).contains("Re-verification required");
    }

    @Test
    void test09_roomTypeManagementAndOwnership() {
        CreateHotelRequest req = CreateHotelRequest.builder()
                .hotelName("Alpha Oasis")
                .cityId(testCity.getId())
                .pricePerNight(BigDecimal.valueOf(4000))
                .build();
        HotelDto hotel = hotelService.createPartnerHotel(partnerA.getId(), req);

        CreateRoomTypeRequest roomReq = CreateRoomTypeRequest.builder()
                .roomTypeName("Deluxe Lake View Suite")
                .description("Spacious suite with balcony")
                .maxOccupancy(2)
                .bedConfiguration("1 King Bed")
                .roomSizeSqft(450)
                .baseInventoryUnits(5)
                .amenities(List.of("AC", "Balcony", "Mini Bar"))
                .build();

        HotelRoomTypeDto room = hotelRoomService.createRoomType(hotel.getId(), roomReq, partnerA.getId());
        assertThat(room).isNotNull();
        assertThat(room.getRoomTypeName()).isEqualTo("Deluxe Lake View Suite");
        assertThat(room.getBaseInventoryUnits()).isEqualTo(5);
        assertThat(room.getIsActive()).isTrue();

        // Partner B cannot create room for Partner A's hotel
        assertThatThrownBy(() -> hotelRoomService.createRoomType(hotel.getId(), roomReq, partnerB.getId()))
                .isInstanceOf(AccessDeniedException.class);

        // Duplicate room name rejected
        assertThatThrownBy(() -> hotelRoomService.createRoomType(hotel.getId(), roomReq, partnerA.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists for this property");
    }

    @Test
    void test10_roomTypeValidationRejectsNegativeInventoryAndZeroOccupancy() {
        CreateHotelRequest req = CreateHotelRequest.builder()
                .hotelName("Alpha Sunset")
                .cityId(testCity.getId())
                .pricePerNight(BigDecimal.valueOf(4000))
                .build();
        HotelDto hotel = hotelService.createPartnerHotel(partnerA.getId(), req);

        CreateRoomTypeRequest invalidOccupancy = CreateRoomTypeRequest.builder()
                .roomTypeName("Zero Guest Room")
                .maxOccupancy(0)
                .baseInventoryUnits(5)
                .build();
        assertThatThrownBy(() -> hotelRoomService.createRoomType(hotel.getId(), invalidOccupancy, partnerA.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Maximum occupancy must be at least 1");

        CreateRoomTypeRequest negativeUnits = CreateRoomTypeRequest.builder()
                .roomTypeName("Negative Room")
                .maxOccupancy(2)
                .baseInventoryUnits(-3)
                .build();
        assertThatThrownBy(() -> hotelRoomService.createRoomType(hotel.getId(), negativeUnits, partnerA.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Base inventory units cannot be negative");
    }

    @Test
    void test11_inventoryUpdateSafetyRejectsBlockedGreaterThanTotal() {
        CreateHotelRequest req = CreateHotelRequest.builder()
                .hotelName("Alpha Haveli")
                .cityId(testCity.getId())
                .pricePerNight(BigDecimal.valueOf(4000))
                .build();
        HotelDto hotel = hotelService.createPartnerHotel(partnerA.getId(), req);

        HotelRoomTypeDto room = hotelRoomService.createRoomType(hotel.getId(), CreateRoomTypeRequest.builder()
                .roomTypeName("Heritage Room")
                .maxOccupancy(2)
                .baseInventoryUnits(10)
                .build(), partnerA.getId());

        UpdateInventoryRequest invReq = UpdateInventoryRequest.builder()
                .totalUnits(5)
                .blockedUnits(8) // Blocked > Total -> invalid!
                .inventoryDate(LocalDate.now().plusDays(5))
                .build();

        assertThatThrownBy(() -> hotelRoomService.updateRoomInventory(hotel.getId(), room.getId(), invReq, partnerA.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Blocked units (8) cannot exceed total units (5)");
    }

    @Test
    void test12_inventoryCannotBeReducedBelowActiveReservations() {
        // Setup Hotel, Room, Rate Plan, Verification
        CreateHotelRequest req = CreateHotelRequest.builder()
                .hotelName("Alpha Royal Stay")
                .cityId(testCity.getId())
                .pricePerNight(BigDecimal.valueOf(4000))
                .build();
        HotelDto hotelDto = hotelService.createPartnerHotel(partnerA.getId(), req);
        hotelService.submitHotelForVerification(partnerA.getId(), hotelDto.getId());
        hotelService.verifyHotel("gov-officer-1", hotelDto.getId(),
                HotelVerificationRequest.builder().decision("APPROVED").build());

        HotelRoomTypeDto room = hotelRoomService.createRoomType(hotelDto.getId(), CreateRoomTypeRequest.builder()
                .roomTypeName("Executive Room")
                .maxOccupancy(2)
                .baseInventoryUnits(5)
                .build(), partnerA.getId());

        HotelRatePlanDto ratePlan = hotelRatePlanService.createRatePlan(hotelDto.getId(), room.getId(),
                CreateRatePlanRequest.builder()
                        .planName("Standard Flexible")
                        .mealPlan("EP")
                        .basePrice(BigDecimal.valueOf(4000))
                        .status("ACTIVE")
                        .build(),
                partnerA.getId());

        LocalDate checkIn = LocalDate.now().plusDays(10);
        LocalDate checkOut = LocalDate.now().plusDays(12);

        // Traveler books 4 rooms
        CreateHotelBookingRequest bookingReq = CreateHotelBookingRequest.builder()
                .roomTypeId(room.getId())
                .ratePlanId(ratePlan.getId())
                .checkIn(checkIn)
                .checkOut(checkOut)
                .numberOfRooms(4)
                .adults(4)
                .guestName("Rohan Verma")
                .guestEmail("rohan@example.com")
                .guestPhone("+91 9999988888")
                .build();

        HotelBookingDto booking = bookingService.createBooking(hotelDto.getId(), bookingReq, traveler.getId());
        assertThat(booking.getBookingStatus()).isEqualTo(HotelBookingStatus.PENDING_PAYMENT);

        // Partner attempts to reduce inventory to 2 units for checkIn date (Active reservations = 4)
        UpdateInventoryRequest reduceReq = UpdateInventoryRequest.builder()
                .inventoryDate(checkIn)
                .totalUnits(2)
                .blockedUnits(0)
                .build();

        assertThatThrownBy(() -> hotelRoomService.updateRoomInventory(hotelDto.getId(), room.getId(), reduceReq, partnerA.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cannot be reduced below active reservations (4)");
    }

    @Test
    void test13_bulkInventoryUpdateAndCalendarAuthoritativeDerivation() {
        CreateHotelRequest req = CreateHotelRequest.builder()
                .hotelName("Alpha Vista")
                .cityId(testCity.getId())
                .pricePerNight(BigDecimal.valueOf(3000))
                .build();
        HotelDto hotel = hotelService.createPartnerHotel(partnerA.getId(), req);

        HotelRoomTypeDto room = hotelRoomService.createRoomType(hotel.getId(), CreateRoomTypeRequest.builder()
                .roomTypeName("Standard Vista Room")
                .maxOccupancy(2)
                .baseInventoryUnits(8)
                .build(), partnerA.getId());

        LocalDate start = LocalDate.now().plusDays(1);
        LocalDate end = LocalDate.now().plusDays(7);

        BulkInventoryUpdateRequest bulkReq = BulkInventoryUpdateRequest.builder()
                .startDate(start)
                .endDate(end)
                .totalUnits(10)
                .blockedUnits(2)
                .build();

        List<HotelInventoryDto> updated = hotelRoomService.updateBulkRoomInventory(hotel.getId(), room.getId(), bulkReq, partnerA.getId());
        assertThat(updated).hasSize(7);
        assertThat(updated.get(0).getTotalUnits()).isEqualTo(10);
        assertThat(updated.get(0).getBlockedUnits()).isEqualTo(2);

        // Fetch authoritative calendar
        List<HotelInventoryCalendarDto> calendar = hotelRoomService.getPartnerHotelInventoryCalendar(
                hotel.getId(), room.getId(), start, end, partnerA.getId());

        assertThat(calendar).hasSize(7);
        for (HotelInventoryCalendarDto cal : calendar) {
            assertThat(cal.getTotalUnits()).isEqualTo(10);
            assertThat(cal.getBlockedUnits()).isEqualTo(2);
            assertThat(cal.getReservedUnits()).isEqualTo(0);
            assertThat(cal.getAvailableUnits()).isEqualTo(8); // 10 - 2 - 0 = 8
        }
    }

    @Test
    void test14_ratePlanManagementAndLifecycle() {
        CreateHotelRequest req = CreateHotelRequest.builder()
                .hotelName("Alpha Grand Suites")
                .cityId(testCity.getId())
                .pricePerNight(BigDecimal.valueOf(5000))
                .build();
        HotelDto hotel = hotelService.createPartnerHotel(partnerA.getId(), req);

        HotelRoomTypeDto room = hotelRoomService.createRoomType(hotel.getId(), CreateRoomTypeRequest.builder()
                .roomTypeName("Royal Room")
                .maxOccupancy(2)
                .baseInventoryUnits(5)
                .build(), partnerA.getId());

        // Create Rate Plan
        CreateRatePlanRequest rateReq = CreateRatePlanRequest.builder()
                .planName("Breakfast & Dinner Special")
                .mealPlan("MAP")
                .basePrice(BigDecimal.valueOf(6500))
                .cancellationPolicy("FREE_CANCELLATION")
                .cancellationDeadlineHours(48)
                .status("DRAFT")
                .build();

        HotelRatePlanDto plan = hotelRatePlanService.createRatePlan(hotel.getId(), room.getId(), rateReq, partnerA.getId());
        assertThat(plan.getStatus()).isEqualTo("DRAFT");
        assertThat(plan.getBasePrice()).isEqualByComparingTo(BigDecimal.valueOf(6500));

        // Activate Rate Plan
        HotelRatePlanDto activated = hotelRatePlanService.activateRatePlan(hotel.getId(), room.getId(), plan.getId(), partnerA.getId());
        assertThat(activated.getStatus()).isEqualTo("ACTIVE");

        // Deactivate Rate Plan
        HotelRatePlanDto deactivated = hotelRatePlanService.deactivateRatePlan(hotel.getId(), room.getId(), plan.getId(), partnerA.getId());
        assertThat(deactivated.getStatus()).isEqualTo("INACTIVE");
    }

    @Test
    void test15_bookabilityStatusTransitions() {
        CreateHotelRequest req = CreateHotelRequest.builder()
                .hotelName("Alpha Status Check")
                .cityId(testCity.getId())
                .pricePerNight(BigDecimal.valueOf(3000))
                .build();
        HotelDto hotel = hotelService.createPartnerHotel(partnerA.getId(), req);
        Hotel hotelEntity = hotelRepository.findById(hotel.getId()).orElseThrow();

        // 1. Initial Draft -> UNVERIFIED
        assertThat(hotelService.deriveBookabilityStatus(hotelEntity)).isEqualTo("UNVERIFIED");

        // 2. Submitted -> PENDING_VERIFICATION
        hotelService.submitHotelForVerification(partnerA.getId(), hotel.getId());
        hotelEntity = hotelRepository.findById(hotel.getId()).orElseThrow();
        assertThat(hotelService.deriveBookabilityStatus(hotelEntity)).isEqualTo("PENDING_VERIFICATION");

        // 3. Verified but no active rooms -> VERIFIED_BUT_INCOMPLETE
        hotelService.verifyHotel("gov-1", hotel.getId(), HotelVerificationRequest.builder().decision("APPROVED").build());
        hotelEntity = hotelRepository.findById(hotel.getId()).orElseThrow();
        assertThat(hotelService.deriveBookabilityStatus(hotelEntity)).isEqualTo("VERIFIED_BUT_INCOMPLETE");

        // 4. Active room added but no rate plans -> VERIFIED_BUT_INCOMPLETE
        HotelRoomTypeDto room = hotelRoomService.createRoomType(hotel.getId(), CreateRoomTypeRequest.builder()
                .roomTypeName("Suite 101")
                .maxOccupancy(2)
                .baseInventoryUnits(5)
                .build(), partnerA.getId());
        hotelEntity = hotelRepository.findById(hotel.getId()).orElseThrow();
        assertThat(hotelService.deriveBookabilityStatus(hotelEntity)).isEqualTo("VERIFIED_BUT_INCOMPLETE");

        // 5. Active rate plan added -> BOOKABLE!
        hotelRatePlanService.createRatePlan(hotel.getId(), room.getId(), CreateRatePlanRequest.builder()
                .planName("Best Available Rate")
                .mealPlan("EP")
                .basePrice(BigDecimal.valueOf(3000))
                .status("ACTIVE")
                .build(), partnerA.getId());

        hotelEntity = hotelRepository.findById(hotel.getId()).orElseThrow();
        assertThat(hotelService.deriveBookabilityStatus(hotelEntity)).isEqualTo("BOOKABLE");
    }

    @Test
    void test16_partnerAnalyticsComputedHonestlyFromAuthoritativeData() {
        // Setup complete bookable hotel
        CreateHotelRequest req = CreateHotelRequest.builder()
                .hotelName("Alpha Analytics Resort")
                .cityId(testCity.getId())
                .pricePerNight(BigDecimal.valueOf(5000))
                .build();
        HotelDto hotel = hotelService.createPartnerHotel(partnerA.getId(), req);
        hotelService.submitHotelForVerification(partnerA.getId(), hotel.getId());
        hotelService.verifyHotel("gov-1", hotel.getId(), HotelVerificationRequest.builder().decision("APPROVED").build());

        HotelRoomTypeDto room = hotelRoomService.createRoomType(hotel.getId(), CreateRoomTypeRequest.builder()
                .roomTypeName("Deluxe Room")
                .maxOccupancy(2)
                .baseInventoryUnits(10)
                .build(), partnerA.getId());

        HotelRatePlanDto plan = hotelRatePlanService.createRatePlan(hotel.getId(), room.getId(), CreateRatePlanRequest.builder()
                .planName("Flexible Rate")
                .mealPlan("CP")
                .basePrice(BigDecimal.valueOf(5000))
                .status("ACTIVE")
                .build(), partnerA.getId());

        // Create and pay 1 booking
        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOut = LocalDate.now().plusDays(7);

        HotelBookingDto booking = bookingService.createBooking(hotel.getId(), CreateHotelBookingRequest.builder()
                .roomTypeId(room.getId())
                .ratePlanId(plan.getId())
                .checkIn(checkIn)
                .checkOut(checkOut)
                .numberOfRooms(2)
                .adults(2)
                .guestName("Aarav Mehta")
                .guestEmail("aarav@example.com")
                .guestPhone("+91 9123456780")
                .build(), traveler.getId());

        paymentService.createPaymentOrder(booking.getBookingReference(), traveler.getId());
        paymentService.verifyPayment(booking.getBookingReference(), VerifyPaymentRequest.builder()
                .razorpayPaymentId(TEST_PAYMENT_ID)
                .razorpayOrderId(TEST_ORDER_ID)
                .razorpaySignature(TEST_VALID_SIGNATURE)
                .build(), traveler.getId());

        // Fetch Analytics
        PartnerHotelAnalyticsDto analytics = hotelService.getPartnerHotelAnalytics(partnerA.getId(), hotel.getId());

        assertThat(analytics).isNotNull();
        assertThat(analytics.getHotelId()).isEqualTo(hotel.getId());
        assertThat(analytics.getConfirmedBookingsCount()).isEqualTo(1);
        assertThat(analytics.getTotalBookingsCount()).isEqualTo(1);
        assertThat(analytics.getPaidBookingValue()).isEqualByComparingTo(BigDecimal.valueOf(20000)); // 2 rooms * 2 nights * 5000 = 20,000
        assertThat(analytics.getReservedRoomNights()).isEqualTo(4); // 2 rooms * 2 nights = 4 allocated room-nights
        assertThat(analytics.getIsBookable()).isTrue();
        assertThat(analytics.getActiveRoomTypesCount()).isEqualTo(1);
        assertThat(analytics.getActiveRatePlansCount()).isEqualTo(1);

        // Partner B cannot access Partner A's analytics
        assertThatThrownBy(() -> hotelService.getPartnerHotelAnalytics(partnerB.getId(), hotel.getId()))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void test17_cannotDeleteRoomTypeWithActiveReservations() {
        CreateHotelRequest req = CreateHotelRequest.builder()
                .hotelName("Alpha Non-Deletable Stay")
                .cityId(testCity.getId())
                .pricePerNight(BigDecimal.valueOf(4000))
                .build();
        HotelDto hotel = hotelService.createPartnerHotel(partnerA.getId(), req);
        hotelService.submitHotelForVerification(partnerA.getId(), hotel.getId());
        hotelService.verifyHotel("gov-1", hotel.getId(), HotelVerificationRequest.builder().decision("APPROVED").build());

        HotelRoomTypeDto room = hotelRoomService.createRoomType(hotel.getId(), CreateRoomTypeRequest.builder()
                .roomTypeName("Reserved Suite")
                .maxOccupancy(2)
                .baseInventoryUnits(5)
                .build(), partnerA.getId());

        HotelRatePlanDto plan = hotelRatePlanService.createRatePlan(hotel.getId(), room.getId(), CreateRatePlanRequest.builder()
                .planName("Daily Flexible")
                .mealPlan("EP")
                .basePrice(BigDecimal.valueOf(4000))
                .status("ACTIVE")
                .build(), partnerA.getId());

        bookingService.createBooking(hotel.getId(), CreateHotelBookingRequest.builder()
                .roomTypeId(room.getId())
                .ratePlanId(plan.getId())
                .checkIn(LocalDate.now().plusDays(3))
                .checkOut(LocalDate.now().plusDays(5))
                .numberOfRooms(1)
                .adults(2)
                .guestName("Simran Kaur")
                .guestEmail("simran@example.com")
                .guestPhone("+91 9888877777")
                .build(), traveler.getId());

        // Attempt deletion of room with active reservation -> rejected safely!
        assertThatThrownBy(() -> hotelRoomService.deleteRoomType(hotel.getId(), room.getId(), partnerA.getId()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot delete room type with active reservations");
    }
}
