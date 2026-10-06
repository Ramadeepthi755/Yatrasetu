package com.yatrasetu.service;

import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.web.dto.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class Phase22HotelRoomInventoryTest {

    @Autowired
    private HotelRoomService hotelRoomService;

    @Autowired
    private HotelRoomTypeRepository roomTypeRepository;

    @Autowired
    private HotelInventoryRepository inventoryRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CityRepository cityRepository;

    private User partnerA;
    private User partnerB;
    private Hotel hotelA;
    private Hotel hotelB;
    private Hotel datasetHotel;

    @BeforeEach
    void setUp() {
        // Create Partner A
        partnerA = userRepository.save(User.builder()
                .id("usr-partner-room-a")
                .authUserId("auth-partner-room-a")
                .email("partner.a@yatrasetu.test")
                .fullName("Partner A Hoteliers")
                .role(Role.PARTNER)
                .partnerSubtype(PartnerSubtype.HOTEL)
                .active(true)
                .verified(true)
                .build());

        // Create Partner B
        partnerB = userRepository.save(User.builder()
                .id("usr-partner-room-b")
                .authUserId("auth-partner-room-b")
                .email("partner.b@yatrasetu.test")
                .fullName("Partner B Homestays")
                .role(Role.PARTNER)
                .partnerSubtype(PartnerSubtype.HOMESTAY)
                .active(true)
                .verified(true)
                .build());

        City city = cityRepository.findAll().stream().findFirst().orElse(null);

        // Hotel A owned by Partner A (Verified)
        hotelA = hotelRepository.save(Hotel.builder()
                .id("htl-test-prop-a")
                .hotelName("Royal Palace Heritage Stay")
                .owner(partnerA)
                .city(city)
                .pricePerNight(BigDecimal.valueOf(3500))
                .category("HERITAGE_HOTEL")
                .address("Palace Road, Central Heritage Zone")
                .isPartnerProperty(true)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .verificationStatus(HotelVerificationStatus.VERIFIED)
                .isActive(true)
                .build());

        // Hotel B owned by Partner B (Draft)
        hotelB = hotelRepository.save(Hotel.builder()
                .id("htl-test-prop-b")
                .hotelName("Green Valley Homestay")
                .owner(partnerB)
                .city(city)
                .pricePerNight(BigDecimal.valueOf(1800))
                .category("HOMESTAY")
                .address("Tea Garden Trail, Valley Road")
                .isPartnerProperty(true)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .verificationStatus(HotelVerificationStatus.UNVERIFIED)
                .isActive(true)
                .build());

        // Dataset Hotel (Owner = null)
        datasetHotel = hotelRepository.save(Hotel.builder()
                .id("htl-test-dataset-only")
                .hotelName("Grand Dataset Inn")
                .owner(null)
                .city(city)
                .pricePerNight(BigDecimal.valueOf(2200))
                .category("HOTEL")
                .isPartnerProperty(false)
                .sourceType(SourceType.DATASET)
                .verificationStatus(HotelVerificationStatus.UNVERIFIED)
                .isActive(true)
                .build());
    }

    @Test
    @DisplayName("1. Partner A can create room type for own hotel")
    void testPartnerCanCreateRoomType() {
        CreateRoomTypeRequest req = CreateRoomTypeRequest.builder()
                .roomTypeName("Deluxe Royal King Room")
                .description("Spacious heritage room with traditional Jharokha window")
                .maxOccupancy(2)
                .bedConfiguration("1 King Bed")
                .roomSizeSqft(350)
                .amenities(List.of("Free WiFi", "Hot Shower", "Heritage Decor"))
                .isAccessible(true)
                .baseInventoryUnits(8)
                .build();

        HotelRoomTypeDto created = hotelRoomService.createRoomType(hotelA.getId(), req, partnerA.getEmail());

        assertNotNull(created);
        assertNotNull(created.getId());
        assertEquals("Deluxe Royal King Room", created.getRoomTypeName());
        assertEquals(8, created.getBaseInventoryUnits());
        assertEquals("PARTNER_SUBMITTED", created.getSourceType());
        assertTrue(created.getIsActive());

        // Verify baseline inventory initialized
        List<HotelInventoryDto> inv = hotelRoomService.getRoomInventory(hotelA.getId(), created.getId(), partnerA.getEmail());
        assertEquals(1, inv.size());
        assertEquals(8, inv.get(0).getTotalUnits());
        assertEquals(0, inv.get(0).getBlockedUnits());
    }

    @Test
    @DisplayName("2. Partner A cannot create room type for Partner B's hotel (403 Forbidden)")
    void testPartnerCannotCreateRoomForOtherHotel() {
        CreateRoomTypeRequest req = CreateRoomTypeRequest.builder()
                .roomTypeName("Unauthorized Room")
                .maxOccupancy(2)
                .baseInventoryUnits(5)
                .build();

        assertThrows(AccessDeniedException.class, () ->
                hotelRoomService.createRoomType(hotelB.getId(), req, partnerA.getEmail())
        );
    }

    @Test
    @DisplayName("3. Partner cannot create room type for unowned Dataset Hotel")
    void testPartnerCannotCreateRoomForDatasetHotel() {
        CreateRoomTypeRequest req = CreateRoomTypeRequest.builder()
                .roomTypeName("Dataset Fake Room")
                .maxOccupancy(2)
                .baseInventoryUnits(5)
                .build();

        assertThrows(AccessDeniedException.class, () ->
                hotelRoomService.createRoomType(datasetHotel.getId(), req, partnerA.getEmail())
        );
    }

    @Test
    @DisplayName("4. Duplicate room type name for same hotel is rejected")
    void testDuplicateRoomTypeNameRejected() {
        CreateRoomTypeRequest req1 = CreateRoomTypeRequest.builder()
                .roomTypeName("Deluxe Suite")
                .maxOccupancy(2)
                .baseInventoryUnits(4)
                .build();
        hotelRoomService.createRoomType(hotelA.getId(), req1, partnerA.getEmail());

        CreateRoomTypeRequest req2 = CreateRoomTypeRequest.builder()
                .roomTypeName("  deluxe suite  ") // Case-insensitive and trimmed duplicate
                .maxOccupancy(3)
                .baseInventoryUnits(2)
                .build();

        assertThrows(IllegalArgumentException.class, () ->
                hotelRoomService.createRoomType(hotelA.getId(), req2, partnerA.getEmail())
        );
    }

    @Test
    @DisplayName("5. Negative inventory units and invalid max occupancy rejected")
    void testInvalidRoomInputsRejected() {
        CreateRoomTypeRequest negativeInvReq = CreateRoomTypeRequest.builder()
                .roomTypeName("Negative Room")
                .maxOccupancy(2)
                .baseInventoryUnits(-5)
                .build();

        assertThrows(IllegalArgumentException.class, () ->
                hotelRoomService.createRoomType(hotelA.getId(), negativeInvReq, partnerA.getEmail())
        );

        CreateRoomTypeRequest zeroOccupancyReq = CreateRoomTypeRequest.builder()
                .roomTypeName("Zero Guest Room")
                .maxOccupancy(0)
                .baseInventoryUnits(5)
                .build();

        assertThrows(IllegalArgumentException.class, () ->
                hotelRoomService.createRoomType(hotelA.getId(), zeroOccupancyReq, partnerA.getEmail())
        );
    }

    @Test
    @DisplayName("6. Partner can edit own room type")
    void testPartnerCanEditRoomType() {
        CreateRoomTypeRequest req = CreateRoomTypeRequest.builder()
                .roomTypeName("Garden Cottage")
                .maxOccupancy(2)
                .baseInventoryUnits(4)
                .build();
        HotelRoomTypeDto created = hotelRoomService.createRoomType(hotelA.getId(), req, partnerA.getEmail());

        UpdateRoomTypeRequest updateReq = UpdateRoomTypeRequest.builder()
                .roomTypeName("Premium Garden Cottage")
                .maxOccupancy(3)
                .baseInventoryUnits(6)
                .build();

        HotelRoomTypeDto updated = hotelRoomService.updateRoomType(hotelA.getId(), created.getId(), updateReq, partnerA.getEmail());
        assertEquals("Premium Garden Cottage", updated.getRoomTypeName());
        assertEquals(3, updated.getMaxOccupancy());
        assertEquals(6, updated.getBaseInventoryUnits());

        // Verify baseline inventory was synced to 6
        List<HotelInventoryDto> inv = hotelRoomService.getRoomInventory(hotelA.getId(), created.getId(), partnerA.getEmail());
        assertEquals(6, inv.get(0).getTotalUnits());
    }

    @Test
    @DisplayName("7. Partner A cannot edit Partner B's room type")
    void testPartnerCannotEditOtherRoomType() {
        CreateRoomTypeRequest req = CreateRoomTypeRequest.builder()
                .roomTypeName("Valley View Room")
                .maxOccupancy(2)
                .baseInventoryUnits(3)
                .build();
        HotelRoomTypeDto createdB = hotelRoomService.createRoomType(hotelB.getId(), req, partnerB.getEmail());

        UpdateRoomTypeRequest updateReq = UpdateRoomTypeRequest.builder()
                .roomTypeName("Hacked Room")
                .build();

        assertThrows(AccessDeniedException.class, () ->
                hotelRoomService.updateRoomType(hotelB.getId(), createdB.getId(), updateReq, partnerA.getEmail())
        );
    }

    @Test
    @DisplayName("8. Partner can update physical inventory capacity")
    void testPartnerCanUpdateInventory() {
        CreateRoomTypeRequest req = CreateRoomTypeRequest.builder()
                .roomTypeName("Standard Room")
                .maxOccupancy(2)
                .baseInventoryUnits(5)
                .build();
        HotelRoomTypeDto created = hotelRoomService.createRoomType(hotelA.getId(), req, partnerA.getEmail());

        UpdateInventoryRequest invReq = UpdateInventoryRequest.builder()
                .totalUnits(10)
                .blockedUnits(2)
                .build();

        HotelInventoryDto updatedInv = hotelRoomService.updateRoomInventory(hotelA.getId(), created.getId(), invReq, partnerA.getEmail());
        assertEquals(10, updatedInv.getTotalUnits());
        assertEquals(2, updatedInv.getBlockedUnits());
    }

    @Test
    @DisplayName("9. Blocked units exceeding total units rejected")
    void testBlockedExceedingTotalRejected() {
        CreateRoomTypeRequest req = CreateRoomTypeRequest.builder()
                .roomTypeName("Executive Room")
                .maxOccupancy(2)
                .baseInventoryUnits(5)
                .build();
        HotelRoomTypeDto created = hotelRoomService.createRoomType(hotelA.getId(), req, partnerA.getEmail());

        UpdateInventoryRequest invalidInvReq = UpdateInventoryRequest.builder()
                .totalUnits(4)
                .blockedUnits(6) // 6 > 4 -> impossible
                .build();

        assertThrows(IllegalArgumentException.class, () ->
                hotelRoomService.updateRoomInventory(hotelA.getId(), created.getId(), invalidInvReq, partnerA.getEmail())
        );
    }

    @Test
    @DisplayName("10. Date-specific inventory capacity can be maintained")
    void testDateSpecificInventory() {
        CreateRoomTypeRequest req = CreateRoomTypeRequest.builder()
                .roomTypeName("Festival Villa")
                .maxOccupancy(4)
                .baseInventoryUnits(2)
                .build();
        HotelRoomTypeDto created = hotelRoomService.createRoomType(hotelA.getId(), req, partnerA.getEmail());

        LocalDate festiveDate = LocalDate.now().plusDays(15);
        UpdateInventoryRequest dateInvReq = UpdateInventoryRequest.builder()
                .inventoryDate(festiveDate)
                .totalUnits(2)
                .blockedUnits(1) // 1 unit maintenance
                .build();

        HotelInventoryDto dateInv = hotelRoomService.updateRoomInventory(hotelA.getId(), created.getId(), dateInvReq, partnerA.getEmail());
        assertEquals(festiveDate, dateInv.getInventoryDate());
        assertEquals(2, dateInv.getTotalUnits());
        assertEquals(1, dateInv.getBlockedUnits());

        List<HotelInventoryDto> allInv = hotelRoomService.getRoomInventory(hotelA.getId(), created.getId(), partnerA.getEmail());
        assertEquals(2, allInv.size()); // 1 baseline + 1 date-specific
    }

    @Test
    @DisplayName("11. Partner can delete own room type")
    void testPartnerCanDeleteRoomType() {
        CreateRoomTypeRequest req = CreateRoomTypeRequest.builder()
                .roomTypeName("Temporary Tent")
                .maxOccupancy(2)
                .baseInventoryUnits(2)
                .build();
        HotelRoomTypeDto created = hotelRoomService.createRoomType(hotelA.getId(), req, partnerA.getEmail());

        hotelRoomService.deleteRoomType(hotelA.getId(), created.getId(), partnerA.getEmail());

        List<HotelRoomTypeDto> rooms = hotelRoomService.getPartnerRoomTypes(hotelA.getId(), partnerA.getEmail());
        assertTrue(rooms.stream().noneMatch(r -> r.getId().equals(created.getId())));
    }

    @Test
    @DisplayName("12. Traveler can view room types of active verified hotel")
    void testTravelerCanViewPublicRooms() {
        CreateRoomTypeRequest req = CreateRoomTypeRequest.builder()
                .roomTypeName("Public Heritage Room")
                .maxOccupancy(2)
                .baseInventoryUnits(5)
                .build();
        hotelRoomService.createRoomType(hotelA.getId(), req, partnerA.getEmail());

        List<HotelRoomTypeDto> publicRooms = hotelRoomService.getPublicRoomTypes(hotelA.getId());
        assertEquals(1, publicRooms.size());
        assertEquals("Public Heritage Room", publicRooms.get(0).getRoomTypeName());
    }

    @Test
    @DisplayName("13. Traveler cannot view room types of suspended hotel")
    void testTravelerCannotViewSuspendedHotelRooms() {
        CreateRoomTypeRequest req = CreateRoomTypeRequest.builder()
                .roomTypeName("Suspended Stay Room")
                .maxOccupancy(2)
                .baseInventoryUnits(5)
                .build();
        hotelRoomService.createRoomType(hotelA.getId(), req, partnerA.getEmail());

        // Suspend hotelA
        hotelA.setVerificationStatus(HotelVerificationStatus.SUSPENDED);
        hotelRepository.save(hotelA);

        List<HotelRoomTypeDto> publicRooms = hotelRoomService.getPublicRoomTypes(hotelA.getId());
        assertTrue(publicRooms.isEmpty());
    }

    @Test
    @DisplayName("14. Dataset hotel has no room types by default (honest empty state)")
    void testDatasetHotelEmptyRooms() {
        List<HotelRoomTypeDto> publicRooms = hotelRoomService.getPublicRoomTypes(datasetHotel.getId());
        assertTrue(publicRooms.isEmpty());
    }
}
