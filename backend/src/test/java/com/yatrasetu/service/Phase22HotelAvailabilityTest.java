package com.yatrasetu.service;

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
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
public class Phase22HotelAvailabilityTest {

    @Autowired
    private HotelAvailabilityService availabilityService;

    @Autowired
    private HotelRoomService hotelRoomService;

    @Autowired
    private HotelRatePlanService ratePlanService;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private HotelRoomTypeRepository roomTypeRepository;

    @Autowired
    private HotelInventoryRepository inventoryRepository;

    @Autowired
    private HotelRatePlanRepository ratePlanRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StateRepository stateRepository;

    @Autowired
    private CityRepository cityRepository;

    private User partnerA;
    private User partnerB;
    private State testState;
    private City testCity;
    private Hotel verifiedPartnerHotel;
    private Hotel datasetHotel;
    private HotelRoomType deluxeRoom;

    @BeforeEach
    void setUp() {
        cleanup();

        partnerA = userRepository.save(User.builder()
                .id("usr-partner-avail-a")
                .authUserId("auth-partner-avail-a")
                .email("partner.a@yatrasetu.com")
                .fullName("Ramesh Hoteliers")
                .role(Role.PARTNER)
                .partnerSubtype(PartnerSubtype.HOMESTAY)
                .verified(true)
                .verificationStatus(VerificationStatus.APPROVED)
                .active(true)
                .build());

        partnerB = userRepository.save(User.builder()
                .id("usr-partner-avail-b")
                .authUserId("auth-partner-avail-b")
                .email("partner.b@yatrasetu.com")
                .fullName("Suresh Resorts")
                .role(Role.PARTNER)
                .partnerSubtype(PartnerSubtype.HOTEL)
                .verified(true)
                .verificationStatus(VerificationStatus.APPROVED)
                .active(true)
                .build());

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

        // 1. Verified Partner Hotel
        verifiedPartnerHotel = hotelRepository.save(Hotel.builder()
                .id("hotel-partner-mysuru")
                .hotelName("Mysuru Heritage Palace View")
                .city(testCity)
                .owner(partnerA)
                .isPartnerProperty(true)
                .verificationStatus(HotelVerificationStatus.VERIFIED)
                .verifiedAt(Instant.now())
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .pricePerNight(BigDecimal.valueOf(4500))
                .isActive(true)
                .build());

        // 2. Dataset Hotel (Not partnered, dataset source)
        datasetHotel = hotelRepository.save(Hotel.builder()
                .id("hotel-dataset-sample")
                .hotelName("Legacy Dataset Lodge")
                .city(testCity)
                .owner(null)
                .isPartnerProperty(false)
                .verificationStatus(HotelVerificationStatus.UNVERIFIED)
                .sourceType(SourceType.DATASET)
                .pricePerNight(BigDecimal.valueOf(2500))
                .isActive(true)
                .build());

        // 3. Room Type with Baseline Capacity 10
        deluxeRoom = roomTypeRepository.save(HotelRoomType.builder()
                .id("room-deluxe-101")
                .hotel(verifiedPartnerHotel)
                .roomTypeName("Deluxe Palace View")
                .maxOccupancy(2)
                .baseInventoryUnits(10)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .isActive(true)
                .build());

        // Baseline inventory: total = 10, blocked = 0
        inventoryRepository.save(HotelInventory.builder()
                .id("inv-base-101")
                .roomType(deluxeRoom)
                .inventoryDate(null)
                .totalUnits(10)
                .blockedUnits(0)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .build());
    }

    @AfterEach
    void tearDown() {
        cleanup();
    }

    private void cleanup() {
        inventoryRepository.deleteAll();
        ratePlanRepository.deleteAll();
        roomTypeRepository.deleteAll();
        hotelRepository.deleteAll();
        cityRepository.deleteAll();
        stateRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Scenario A: Baseline 10 units, blocked 0 -> Available = 10")
    void testBaselineInventoryAvailableUnits() {
        LocalDate checkIn = LocalDate.of(2026, 10, 10);
        LocalDate checkOut = LocalDate.of(2026, 10, 11);

        HotelAvailabilityDto result = availabilityService.getHotelAvailability(
                verifiedPartnerHotel.getId(), deluxeRoom.getId(), checkIn, checkOut, 2);

        assertThat(result.getIsLiveAvailability()).isTrue();
        assertThat(result.getStatus()).isEqualTo(HotelAvailabilityStatus.AVAILABLE);
        assertThat(result.getRooms()).hasSize(1);

        HotelAvailabilityDto.RoomTypeAvailabilityDto room = result.getRooms().get(0);
        assertThat(room.getAvailableUnits()).isEqualTo(10);
        assertThat(room.getStatus()).isEqualTo(HotelAvailabilityStatus.AVAILABLE);
        assertThat(room.getNightly()).hasSize(1);
        assertThat(room.getNightly().get(0).getAvailableUnits()).isEqualTo(10);
        assertThat(room.getNightly().get(0).getIsDateOverride()).isFalse();
    }

    @Test
    @DisplayName("Scenario B: Baseline 10 units, blocked 2 -> Available = 8")
    void testBaselineInventoryWithBlockedUnits() {
        // Update baseline blocked units to 2
        hotelRoomService.updateRoomInventory(
                verifiedPartnerHotel.getId(),
                deluxeRoom.getId(),
                UpdateInventoryRequest.builder()
                        .inventoryDate(null)
                        .totalUnits(10)
                        .blockedUnits(2)
                        .build(),
                partnerA.getEmail()
        );

        LocalDate checkIn = LocalDate.of(2026, 10, 10);
        LocalDate checkOut = LocalDate.of(2026, 10, 11);

        HotelAvailabilityDto result = availabilityService.getHotelAvailability(
                verifiedPartnerHotel.getId(), deluxeRoom.getId(), checkIn, checkOut, 2);

        HotelAvailabilityDto.RoomTypeAvailabilityDto room = result.getRooms().get(0);
        assertThat(room.getAvailableUnits()).isEqualTo(8);
        assertThat(room.getStatus()).isEqualTo(HotelAvailabilityStatus.AVAILABLE);
    }

    @Test
    @DisplayName("Scenario C: Baseline 10, Date-Specific Total 8 / Blocked 2 -> Available = 6 (Override completely applies)")
    void testDateSpecificOverrideWithBlockedUnits() {
        LocalDate date = LocalDate.of(2026, 10, 10);

        // Set date-specific inventory: total = 8, blocked = 2
        hotelRoomService.updateRoomInventory(
                verifiedPartnerHotel.getId(),
                deluxeRoom.getId(),
                UpdateInventoryRequest.builder()
                        .inventoryDate(date)
                        .totalUnits(8)
                        .blockedUnits(2)
                        .build(),
                partnerA.getEmail()
        );

        LocalDate checkIn = date;
        LocalDate checkOut = date.plusDays(1);

        HotelAvailabilityDto result = availabilityService.getHotelAvailability(
                verifiedPartnerHotel.getId(), deluxeRoom.getId(), checkIn, checkOut, 2);

        HotelAvailabilityDto.RoomTypeAvailabilityDto room = result.getRooms().get(0);
        assertThat(room.getAvailableUnits()).isEqualTo(6); // 8 - 2 = 6 (NOT 10 - 2 = 8)
        assertThat(room.getNightly().get(0).getIsDateOverride()).isTrue();
    }

    @Test
    @DisplayName("Scenario D: Baseline 10, Date-Specific Total 8 / Blocked 0 -> Available = 8")
    void testDateSpecificOverrideZeroBlocked() {
        LocalDate date = LocalDate.of(2026, 10, 10);

        hotelRoomService.updateRoomInventory(
                verifiedPartnerHotel.getId(),
                deluxeRoom.getId(),
                UpdateInventoryRequest.builder()
                        .inventoryDate(date)
                        .totalUnits(8)
                        .blockedUnits(0)
                        .build(),
                partnerA.getEmail()
        );

        LocalDate checkIn = date;
        LocalDate checkOut = date.plusDays(1);

        HotelAvailabilityDto result = availabilityService.getHotelAvailability(
                verifiedPartnerHotel.getId(), deluxeRoom.getId(), checkIn, checkOut, 2);

        HotelAvailabilityDto.RoomTypeAvailabilityDto room = result.getRooms().get(0);
        assertThat(room.getAvailableUnits()).isEqualTo(8);
        assertThat(room.getNightly().get(0).getIsDateOverride()).isTrue();
    }

    @Test
    @DisplayName("Scenario E: Multi-night stay (Night 1 = 5, Night 2 = 3, Night 3 = 4) -> Minimum Available = 3")
    void testMultiNightMinimumCalculation() {
        LocalDate night1 = LocalDate.of(2026, 10, 10);
        LocalDate night2 = LocalDate.of(2026, 10, 11);
        LocalDate night3 = LocalDate.of(2026, 10, 12);
        LocalDate checkOut = LocalDate.of(2026, 10, 13); // checkout date

        // Set date specific overrides:
        inventoryRepository.save(HotelInventory.builder()
                .id("inv-d1")
                .roomType(deluxeRoom)
                .inventoryDate(night1)
                .totalUnits(5)
                .blockedUnits(0)
                .build());

        inventoryRepository.save(HotelInventory.builder()
                .id("inv-d2")
                .roomType(deluxeRoom)
                .inventoryDate(night2)
                .totalUnits(5)
                .blockedUnits(2) // 5 - 2 = 3
                .build());

        inventoryRepository.save(HotelInventory.builder()
                .id("inv-d3")
                .roomType(deluxeRoom)
                .inventoryDate(night3)
                .totalUnits(4)
                .blockedUnits(0) // 4 - 0 = 4
                .build());

        HotelAvailabilityDto result = availabilityService.getHotelAvailability(
                verifiedPartnerHotel.getId(), deluxeRoom.getId(), night1, checkOut, 2);

        HotelAvailabilityDto.RoomTypeAvailabilityDto room = result.getRooms().get(0);
        assertThat(room.getAvailableUnits()).isEqualTo(3);
        assertThat(room.getStatus()).isEqualTo(HotelAvailabilityStatus.AVAILABLE);
        assertThat(room.getNightly()).hasSize(3);
        assertThat(room.getNightly().get(0).getAvailableUnits()).isEqualTo(5);
        assertThat(room.getNightly().get(1).getAvailableUnits()).isEqualTo(3);
        assertThat(room.getNightly().get(2).getAvailableUnits()).isEqualTo(4);
    }

    @Test
    @DisplayName("Scenario F: One night sold out (5, 0, 4) -> Overall Room is SOLD_OUT (0 available)")
    void testOneNightSoldOutCausesOverallSoldOut() {
        LocalDate night1 = LocalDate.of(2026, 10, 10);
        LocalDate night2 = LocalDate.of(2026, 10, 11);
        LocalDate night3 = LocalDate.of(2026, 10, 12);
        LocalDate checkOut = LocalDate.of(2026, 10, 13);

        inventoryRepository.save(HotelInventory.builder()
                .id("inv-d1")
                .roomType(deluxeRoom)
                .inventoryDate(night1)
                .totalUnits(5)
                .blockedUnits(0)
                .build());

        inventoryRepository.save(HotelInventory.builder()
                .id("inv-d2")
                .roomType(deluxeRoom)
                .inventoryDate(night2)
                .totalUnits(5)
                .blockedUnits(5) // 5 - 5 = 0 (SOLD OUT on night 2)
                .build());

        inventoryRepository.save(HotelInventory.builder()
                .id("inv-d3")
                .roomType(deluxeRoom)
                .inventoryDate(night3)
                .totalUnits(4)
                .blockedUnits(0)
                .build());

        HotelAvailabilityDto result = availabilityService.getHotelAvailability(
                verifiedPartnerHotel.getId(), deluxeRoom.getId(), night1, checkOut, 2);

        HotelAvailabilityDto.RoomTypeAvailabilityDto room = result.getRooms().get(0);
        assertThat(room.getAvailableUnits()).isEqualTo(0);
        assertThat(room.getStatus()).isEqualTo(HotelAvailabilityStatus.SOLD_OUT);
        assertThat(room.getIsAvailable()).isFalse();
        assertThat(result.getStatus()).isEqualTo(HotelAvailabilityStatus.SOLD_OUT);
    }

    @Test
    @DisplayName("Scenario G: Dataset Hotel returns honest UNAVAILABLE_DATA with 0 fake inventory")
    void testDatasetHotelReturnsUnavailableData() {
        LocalDate checkIn = LocalDate.of(2026, 10, 10);
        LocalDate checkOut = LocalDate.of(2026, 10, 13);

        HotelAvailabilityDto result = availabilityService.getHotelAvailability(
                datasetHotel.getId(), null, checkIn, checkOut, 2);

        assertThat(result.getIsLiveAvailability()).isFalse();
        assertThat(result.getStatus()).isEqualTo(HotelAvailabilityStatus.UNAVAILABLE_DATA);
        assertThat(result.getProvenance()).isEqualTo("DATASET");
        assertThat(result.getRooms()).isEmpty(); // ZERO fabricated room types
        assertThat(result.getNote()).contains("Live availability is not currently provided for this dataset property.");
    }

    @Test
    @DisplayName("Scenario H: Rate Plan count does NOT multiply or change physical availability count")
    void testRatePlansDoNotAlterAvailabilityCount() {
        // Create 2 active rate plans for the room
        ratePlanRepository.save(HotelRatePlan.builder()
                .id("rp-flexible")
                .roomType(deluxeRoom)
                .planName("Flexible Rate (Free Cancellation)")
                .basePrice(BigDecimal.valueOf(5000))
                .status(RatePlanStatus.ACTIVE)
                .build());

        ratePlanRepository.save(HotelRatePlan.builder()
                .id("rp-non-refundable")
                .roomType(deluxeRoom)
                .planName("Non-Refundable Saver")
                .basePrice(BigDecimal.valueOf(4500))
                .status(RatePlanStatus.ACTIVE)
                .build());

        LocalDate checkIn = LocalDate.of(2026, 10, 10);
        LocalDate checkOut = LocalDate.of(2026, 10, 11);

        HotelAvailabilityDto result = availabilityService.getHotelAvailability(
                verifiedPartnerHotel.getId(), deluxeRoom.getId(), checkIn, checkOut, 2);

        HotelAvailabilityDto.RoomTypeAvailabilityDto room = result.getRooms().get(0);
        assertThat(room.getAvailableUnits()).isEqualTo(10); // Still exactly 10 units!
        assertThat(room.getRatePlans()).hasSize(2);
        assertThat(room.getRatePlans().get(0).getBasePrice()).isEqualByComparingTo("4500.00");
        assertThat(room.getRatePlans().get(1).getBasePrice()).isEqualByComparingTo("5000.00");
    }

    @Test
    @DisplayName("Scenario I: Checkout date is excluded from evaluation window")
    void testCheckoutDateExcluded() {
        LocalDate checkIn = LocalDate.of(2026, 10, 10);
        LocalDate checkOut = LocalDate.of(2026, 10, 12); // 2 nights: 10th and 11th

        // Set check-out date (12th) to 0 inventory
        inventoryRepository.save(HotelInventory.builder()
                .id("inv-checkout-date")
                .roomType(deluxeRoom)
                .inventoryDate(checkOut)
                .totalUnits(0)
                .blockedUnits(0)
                .build());

        HotelAvailabilityDto result = availabilityService.getHotelAvailability(
                verifiedPartnerHotel.getId(), deluxeRoom.getId(), checkIn, checkOut, 2);

        // Since check-out date is excluded, availability on 10th & 11th is 10
        HotelAvailabilityDto.RoomTypeAvailabilityDto room = result.getRooms().get(0);
        assertThat(room.getAvailableUnits()).isEqualTo(10);
        assertThat(room.getNightly()).hasSize(2);
    }

    @Test
    @DisplayName("Scenario J: Invalid date ranges are rejected with IllegalArgumentException")
    void testInvalidDateRangesRejected() {
        LocalDate date = LocalDate.of(2026, 10, 10);

        // Same check-in and check-out
        assertThatThrownBy(() -> availabilityService.getHotelAvailability(
                verifiedPartnerHotel.getId(), deluxeRoom.getId(), date, date, 2))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("strictly after");

        // Check-out before check-in
        assertThatThrownBy(() -> availabilityService.getHotelAvailability(
                verifiedPartnerHotel.getId(), deluxeRoom.getId(), date, date.minusDays(1), 2))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("strictly after");

        // Null dates
        assertThatThrownBy(() -> availabilityService.getHotelAvailability(
                verifiedPartnerHotel.getId(), deluxeRoom.getId(), null, date, 2))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Scenario K: Cross-Partner Modification Denied (Partner B cannot modify Partner A's hotel)")
    void testCrossPartnerOwnershipEnforced() {
        assertThatThrownBy(() -> hotelRoomService.updateRoomInventory(
                verifiedPartnerHotel.getId(),
                deluxeRoom.getId(),
                UpdateInventoryRequest.builder()
                        .inventoryDate(LocalDate.of(2026, 10, 15))
                        .totalUnits(5)
                        .blockedUnits(1)
                        .build(),
                partnerB.getEmail() // Partner B trying to modify Partner A's hotel
        )).isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("do not have permission");
    }

    @Test
    @DisplayName("Scenario L: Negative units and Blocked > Total are rejected")
    void testInvalidUnitsRejected() {
        // Negative total
        assertThatThrownBy(() -> hotelRoomService.updateRoomInventory(
                verifiedPartnerHotel.getId(),
                deluxeRoom.getId(),
                UpdateInventoryRequest.builder()
                        .inventoryDate(LocalDate.of(2026, 10, 15))
                        .totalUnits(-5)
                        .blockedUnits(0)
                        .build(),
                partnerA.getEmail()
        )).isInstanceOf(IllegalArgumentException.class);

        // Blocked > Total
        assertThatThrownBy(() -> hotelRoomService.updateRoomInventory(
                verifiedPartnerHotel.getId(),
                deluxeRoom.getId(),
                UpdateInventoryRequest.builder()
                        .inventoryDate(LocalDate.of(2026, 10, 15))
                        .totalUnits(5)
                        .blockedUnits(8)
                        .build(),
                partnerA.getEmail()
        )).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cannot exceed total units");
    }

    @Test
    @DisplayName("Scenario M: Bulk Date Range Inventory Update sets inventory atomically")
    void testBulkInventoryUpdate() {
        LocalDate start = LocalDate.of(2026, 10, 20);
        LocalDate end = LocalDate.of(2026, 10, 24); // 5 days

        List<HotelInventoryDto> result = hotelRoomService.updateBulkRoomInventory(
                verifiedPartnerHotel.getId(),
                deluxeRoom.getId(),
                BulkInventoryUpdateRequest.builder()
                        .startDate(start)
                        .endDate(end)
                        .totalUnits(6)
                        .blockedUnits(1)
                        .build(),
                partnerA.getEmail()
        );

        assertThat(result).hasSize(5);
        for (HotelInventoryDto inv : result) {
            assertThat(inv.getTotalUnits()).isEqualTo(6);
            assertThat(inv.getBlockedUnits()).isEqualTo(1);
        }

        // Query availability across this window
        HotelAvailabilityDto avail = availabilityService.getHotelAvailability(
                verifiedPartnerHotel.getId(), deluxeRoom.getId(), start, end.plusDays(1), 2);

        HotelAvailabilityDto.RoomTypeAvailabilityDto room = avail.getRooms().get(0);
        assertThat(room.getAvailableUnits()).isEqualTo(5); // 6 - 1 = 5
        assertThat(room.getNightly()).hasSize(5);
    }

    @Test
    @DisplayName("Scenario N: Room Type belonging to another hotel is rejected with IllegalArgumentException")
    void testRoomTypeBelongsToAnotherHotelRejected() {
        Hotel otherHotel = hotelRepository.save(Hotel.builder()
                .id("hotel-other-partner")
                .hotelName("Another Property")
                .city(testCity)
                .owner(partnerA)
                .isPartnerProperty(true)
                .verificationStatus(HotelVerificationStatus.VERIFIED)
                .pricePerNight(BigDecimal.valueOf(3000))
                .isActive(true)
                .build());

        LocalDate checkIn = LocalDate.of(2026, 10, 10);
        LocalDate checkOut = LocalDate.of(2026, 10, 11);

        assertThatThrownBy(() -> availabilityService.getHotelAvailability(
                otherHotel.getId(), deluxeRoom.getId(), checkIn, checkOut, 2))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("does not belong to hotel");
    }
}
