package com.yatrasetu.service;

import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.web.dto.CreateHotelRequest;
import com.yatrasetu.web.dto.HotelDto;
import com.yatrasetu.web.dto.HotelVerificationRequest;
import com.yatrasetu.web.dto.UpdateHotelRequest;
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
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class Phase22HotelPartnerVerificationTest {

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private DestinationRepository destinationRepository;

    @Mock
    private CityRepository cityRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HotelRoomTypeRepository roomTypeRepository;

    @Mock
    private HotelRatePlanRepository ratePlanRepository;

    @Mock
    private HotelInventoryRepository inventoryRepository;

    @Mock
    private HotelBookingRepository bookingRepository;

    @Mock
    private HotelBookingAllocationRepository bookingAllocationRepository;

    @InjectMocks
    private HotelService hotelService;

    private User partnerA;
    private User partnerB;
    private User travelerUser;
    private User governmentUser;
    private State keralaState;
    private City kochiCity;
    private Destination fortKochiDest;
    private Hotel datasetHotel;
    private Hotel partnerHotelA;

    @BeforeEach
    void setUp() {
        partnerA = User.builder()
                .id("usr-partner-a")
                .authUserId("auth-partner-a")
                .email("partner.a@hotel.com")
                .fullName("Rajesh Menon")
                .role(Role.PARTNER)
                .partnerSubtype(PartnerSubtype.HOTEL)
                .build();

        partnerB = User.builder()
                .id("usr-partner-b")
                .authUserId("auth-partner-b")
                .email("partner.b@hotel.com")
                .fullName("Sunil Kumar")
                .role(Role.PARTNER)
                .partnerSubtype(PartnerSubtype.HOMESTAY)
                .build();

        travelerUser = User.builder()
                .id("usr-traveler-1")
                .authUserId("auth-traveler-1")
                .email("traveler@example.com")
                .fullName("Ananya Sharma")
                .role(Role.TRAVELER)
                .build();

        governmentUser = User.builder()
                .id("usr-gov-officer")
                .authUserId("auth-gov-officer")
                .email("tourism.officer@kerala.gov.in")
                .fullName("Kerala Tourism Reviewer")
                .role(Role.GOVERNMENT)
                .build();

        keralaState = State.builder()
                .id("IN-KL")
                .stateName("Kerala")
                .build();

        kochiCity = City.builder()
                .id("kochi")
                .cityName("Kochi")
                .state(keralaState)
                .build();

        fortKochiDest = Destination.builder()
                .id("dest-155")
                .destinationName("Fort Kochi Heritage Zone")
                .city(kochiCity)
                .state(keralaState)
                .latitude(BigDecimal.valueOf(9.965))
                .longitude(BigDecimal.valueOf(76.242))
                .build();

        datasetHotel = Hotel.builder()
                .id("htl-1")
                .hotelName("Crowne Plaza Kochi")
                .city(kochiCity)
                .destination(fortKochiDest)
                .hotelRating(BigDecimal.valueOf(4.6))
                .pricePerNight(BigDecimal.valueOf(8854.0))
                .amenities(List.of("Free Wi-Fi", "Pool", "Spa"))
                .category("Luxury")
                .address("Maradu, Kochi")
                .isPartnerProperty(false)
                .inventoryType("DATASET_PROPERTY")
                .sourceType(SourceType.DATASET)
                .verificationStatus(HotelVerificationStatus.UNVERIFIED)
                .owner(null)
                .isActive(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        partnerHotelA = Hotel.builder()
                .id("htl-partner-a1")
                .hotelName("Old Harbour Heritage Stay")
                .owner(partnerA)
                .city(kochiCity)
                .destination(fortKochiDest)
                .hotelRating(BigDecimal.valueOf(4.8))
                .pricePerNight(BigDecimal.valueOf(11500.0))
                .amenities(List.of("Heritage Garden", "Ayurvedic Spa", "Sea View Terrace"))
                .category("Heritage")
                .address("Tower Road, Fort Kochi")
                .latitude(BigDecimal.valueOf(9.964))
                .longitude(BigDecimal.valueOf(76.241))
                .isPartnerProperty(true)
                .inventoryType("PARTNER_PMS")
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .verificationStatus(HotelVerificationStatus.UNVERIFIED)
                .isActive(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    @Test
    @DisplayName("1. Partner can register a new hotel property in draft status")
    void testPartnerCanCreateHotelProperty() {
        when(userRepository.findById("usr-partner-a")).thenReturn(Optional.of(partnerA));
        when(cityRepository.findById("kochi")).thenReturn(Optional.of(kochiCity));
        when(destinationRepository.findById("dest-155")).thenReturn(Optional.of(fortKochiDest));
        when(hotelRepository.existsByHotelNameIgnoreCaseAndCityId("Old Harbour Heritage Stay", "kochi")).thenReturn(false);
        when(hotelRepository.save(any(Hotel.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateHotelRequest request = CreateHotelRequest.builder()
                .hotelName("Old Harbour Heritage Stay")
                .cityId("kochi")
                .destinationId("dest-155")
                .category("Heritage")
                .pricePerNight(BigDecimal.valueOf(11500.0))
                .address("Tower Road, Fort Kochi")
                .amenities(List.of("Heritage Garden", "Ayurvedic Spa"))
                .latitude(BigDecimal.valueOf(9.964))
                .longitude(BigDecimal.valueOf(76.241))
                .contactPhone("+91 484 2218000")
                .contactEmail("stay@oldharbourhotel.com")
                .checkInTime("14:00")
                .checkOutTime("11:00")
                .build();

        HotelDto created = hotelService.createPartnerHotel("usr-partner-a", request);

        assertThat(created).isNotNull();
        assertThat(created.getHotelName()).isEqualTo("Old Harbour Heritage Stay");
        assertThat(created.getOwnerId()).isEqualTo("usr-partner-a");
        assertThat(created.getSourceType()).isEqualTo("PARTNER_SUBMITTED");
        assertThat(created.getInventoryType()).isEqualTo("PARTNER_PMS");
        assertThat(created.getVerificationStatus()).isEqualTo("UNVERIFIED");
        assertThat(created.getIsPartnerProperty()).isTrue();
    }

    @Test
    @DisplayName("2. Partner owns created hotel and list returns only own properties")
    void testPartnerOwnershipList() {
        when(userRepository.findById("usr-partner-a")).thenReturn(Optional.of(partnerA));
        when(hotelRepository.findByOwnerId("usr-partner-a")).thenReturn(List.of(partnerHotelA));

        List<HotelDto> myHotels = hotelService.getMyHotels("usr-partner-a");

        assertThat(myHotels).hasSize(1);
        assertThat(myHotels.get(0).getId()).isEqualTo("htl-partner-a1");
        assertThat(myHotels.get(0).getOwnerId()).isEqualTo("usr-partner-a");
    }

    @Test
    @DisplayName("3. Partner can edit own hotel property")
    void testPartnerCanEditOwnHotel() {
        when(userRepository.findById("usr-partner-a")).thenReturn(Optional.of(partnerA));
        when(hotelRepository.findById("htl-partner-a1")).thenReturn(Optional.of(partnerHotelA));
        when(cityRepository.findById("kochi")).thenReturn(Optional.of(kochiCity));
        when(destinationRepository.findById("dest-155")).thenReturn(Optional.of(fortKochiDest));
        when(hotelRepository.save(any(Hotel.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateHotelRequest request = UpdateHotelRequest.builder()
                .hotelName("Old Harbour Heritage Stay - Fort Kochi")
                .cityId("kochi")
                .destinationId("dest-155")
                .category("Heritage")
                .pricePerNight(BigDecimal.valueOf(12500.0))
                .address("Tower Road, Fort Kochi, Kochi, Kerala")
                .amenities(List.of("Heritage Garden", "Ayurvedic Spa", "Boutique Pool"))
                .latitude(BigDecimal.valueOf(9.964))
                .longitude(BigDecimal.valueOf(76.241))
                .contactPhone("+91 484 2218000")
                .build();

        HotelDto updated = hotelService.updatePartnerHotel("usr-partner-a", "htl-partner-a1", request);

        assertThat(updated.getHotelName()).isEqualTo("Old Harbour Heritage Stay - Fort Kochi");
        assertThat(updated.getPricePerNight()).isEqualTo(BigDecimal.valueOf(12500.0));
        assertThat(updated.getAmenities()).contains("Boutique Pool");
    }

    @Test
    @DisplayName("4. Partner B cannot edit Partner A's hotel property (AccessDeniedException)")
    void testCrossPartnerEditBlocked() {
        when(userRepository.findById("usr-partner-b")).thenReturn(Optional.of(partnerB));
        when(hotelRepository.findById("htl-partner-a1")).thenReturn(Optional.of(partnerHotelA));

        UpdateHotelRequest request = UpdateHotelRequest.builder()
                .hotelName("Hijacked Hotel")
                .cityId("kochi")
                .category("Budget")
                .pricePerNight(BigDecimal.valueOf(500.0))
                .build();

        assertThatThrownBy(() -> hotelService.updatePartnerHotel("usr-partner-b", "htl-partner-a1", request))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("You do not own this hotel property");
    }

    @Test
    @DisplayName("5. Traveler cannot mutate or create hotel properties")
    void testTravelerCannotCreateHotel() {
        when(userRepository.findById("usr-traveler-1")).thenReturn(Optional.of(travelerUser));

        CreateHotelRequest request = CreateHotelRequest.builder()
                .hotelName("Traveler Hotel")
                .cityId("kochi")
                .pricePerNight(BigDecimal.valueOf(2000.0))
                .build();

        assertThatThrownBy(() -> hotelService.createPartnerHotel("usr-traveler-1", request))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("PARTNER role privileges");
    }

    @Test
    @DisplayName("6. Partner can submit hotel for verification")
    void testPartnerCanSubmitForVerification() {
        when(userRepository.findById("usr-partner-a")).thenReturn(Optional.of(partnerA));
        when(hotelRepository.findById("htl-partner-a1")).thenReturn(Optional.of(partnerHotelA));
        when(hotelRepository.save(any(Hotel.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HotelDto submitted = hotelService.submitHotelForVerification("usr-partner-a", "htl-partner-a1");

        assertThat(submitted.getVerificationStatus()).isEqualTo("PENDING_REVIEW");
    }

    @Test
    @DisplayName("7. Government can view pending verification queue")
    void testGovernmentCanViewPendingQueue() {
        partnerHotelA.setVerificationStatus(HotelVerificationStatus.PENDING_REVIEW);
        when(hotelRepository.findByVerificationStatus(HotelVerificationStatus.PENDING_REVIEW))
                .thenReturn(List.of(partnerHotelA));

        List<HotelDto> pending = hotelService.getPendingVerificationHotels();

        assertThat(pending).hasSize(1);
        assertThat(pending.get(0).getId()).isEqualTo("htl-partner-a1");
        assertThat(pending.get(0).getVerificationStatus()).isEqualTo("PENDING_REVIEW");
    }

    @Test
    @DisplayName("8. Government can approve hotel property to VERIFIED")
    void testGovernmentCanApproveHotel() {
        partnerHotelA.setVerificationStatus(HotelVerificationStatus.PENDING_REVIEW);
        when(hotelRepository.findById("htl-partner-a1")).thenReturn(Optional.of(partnerHotelA));
        when(hotelRepository.save(any(Hotel.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HotelVerificationRequest request = HotelVerificationRequest.builder()
                .decision("APPROVED")
                .notes("Property ownership and commercial establishment registration verified.")
                .build();

        HotelDto verified = hotelService.verifyHotel("usr-gov-officer", "htl-partner-a1", request);

        assertThat(verified.getVerificationStatus()).isEqualTo("VERIFIED");
        assertThat(verified.getVerifiedBy()).isEqualTo("usr-gov-officer");
        assertThat(verified.getVerifiedAt()).isNotNull();
        assertThat(verified.getVerificationNotes()).contains("commercial establishment registration verified");
    }

    @Test
    @DisplayName("9. Government can reject hotel property with rejection reason")
    void testGovernmentCanRejectHotel() {
        partnerHotelA.setVerificationStatus(HotelVerificationStatus.PENDING_REVIEW);
        when(hotelRepository.findById("htl-partner-a1")).thenReturn(Optional.of(partnerHotelA));
        when(hotelRepository.save(any(Hotel.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HotelVerificationRequest request = HotelVerificationRequest.builder()
                .decision("REJECTED")
                .rejectionReason("Incomplete street address and unverified contact number.")
                .notes("Please update address and re-submit.")
                .build();

        HotelDto rejected = hotelService.verifyHotel("usr-gov-officer", "htl-partner-a1", request);

        assertThat(rejected.getVerificationStatus()).isEqualTo("REJECTED");
        assertThat(rejected.getRejectionReason()).isEqualTo("Incomplete street address and unverified contact number.");
    }

    @Test
    @DisplayName("10. Government can suspend hotel property")
    void testGovernmentCanSuspendHotel() {
        partnerHotelA.setVerificationStatus(HotelVerificationStatus.VERIFIED);
        when(hotelRepository.findById("htl-partner-a1")).thenReturn(Optional.of(partnerHotelA));
        when(hotelRepository.save(any(Hotel.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HotelVerificationRequest request = HotelVerificationRequest.builder()
                .decision("SUSPENDED")
                .notes("License renewal audit pending.")
                .build();

        HotelDto suspended = hotelService.verifyHotel("usr-gov-officer", "htl-partner-a1", request);

        assertThat(suspended.getVerificationStatus()).isEqualTo("SUSPENDED");
        assertThat(suspended.getVerificationNotes()).isEqualTo("License renewal audit pending.");
    }

    @Test
    @DisplayName("11. Important verified-field changes trigger re-review (resets to PENDING_REVIEW)")
    void testVerifiedFieldChangeTriggersReVerification() {
        partnerHotelA.setVerificationStatus(HotelVerificationStatus.VERIFIED);
        partnerHotelA.setVerifiedBy("usr-gov-officer");
        partnerHotelA.setVerifiedAt(Instant.now());

        when(userRepository.findById("usr-partner-a")).thenReturn(Optional.of(partnerA));
        when(hotelRepository.findById("htl-partner-a1")).thenReturn(Optional.of(partnerHotelA));
        when(cityRepository.findById("kochi")).thenReturn(Optional.of(kochiCity));
        when(hotelRepository.save(any(Hotel.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Partner changes the name from "Old Harbour Heritage Stay" to "New Brand Luxury Resort"
        UpdateHotelRequest request = UpdateHotelRequest.builder()
                .hotelName("New Brand Luxury Resort")
                .cityId("kochi")
                .category("Luxury")
                .pricePerNight(BigDecimal.valueOf(18000.0))
                .address("New Address 123")
                .build();

        HotelDto updated = hotelService.updatePartnerHotel("usr-partner-a", "htl-partner-a1", request);

        assertThat(updated.getVerificationStatus()).isEqualTo("PENDING_REVIEW");
        assertThat(updated.getVerificationNotes()).contains("Re-verification required following partner update");
    }

    @Test
    @DisplayName("12. Dataset hotel is not automatically partner-owned")
    void testDatasetHotelNotPartnerOwned() {
        HotelDto dto = hotelService.toDto(datasetHotel);

        assertThat(dto.getOwnerId()).isNull();
        assertThat(dto.getSourceType()).isEqualTo("DATASET");
        assertThat(dto.getInventoryType()).isEqualTo("DATASET_PROPERTY");
        assertThat(dto.getIsPartnerProperty()).isFalse();
        assertThat(dto.getVerificationStatus()).isEqualTo("UNVERIFIED");
    }

    @Test
    @DisplayName("13. Partner cannot delete another partner's hotel property")
    void testPartnerCannotDeleteOtherPartnerHotel() {
        when(userRepository.findById("usr-partner-b")).thenReturn(Optional.of(partnerB));
        when(hotelRepository.findById("htl-partner-a1")).thenReturn(Optional.of(partnerHotelA));

        assertThatThrownBy(() -> hotelService.deletePartnerHotel("usr-partner-b", "htl-partner-a1"))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("You do not own this hotel property");
    }

    @Test
    @DisplayName("14. Invalid coordinates are rejected with IllegalArgumentException")
    void testInvalidCoordinatesRejected() {
        when(userRepository.findById("usr-partner-a")).thenReturn(Optional.of(partnerA));
        when(cityRepository.findById("kochi")).thenReturn(Optional.of(kochiCity));

        CreateHotelRequest request = CreateHotelRequest.builder()
                .hotelName("Impossible Lat Resort")
                .cityId("kochi")
                .pricePerNight(BigDecimal.valueOf(3000.0))
                .latitude(BigDecimal.valueOf(150.0)) // Invalid lat > 90
                .longitude(BigDecimal.valueOf(76.0))
                .build();

        assertThatThrownBy(() -> hotelService.createPartnerHotel("usr-partner-a", request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid coordinates");
    }

    @Test
    @DisplayName("15. Invalid city reference is rejected with IllegalArgumentException")
    void testInvalidCityRejected() {
        when(userRepository.findById("usr-partner-a")).thenReturn(Optional.of(partnerA));
        when(cityRepository.findById("invalid-city-id")).thenReturn(Optional.empty());

        CreateHotelRequest request = CreateHotelRequest.builder()
                .hotelName("Nowhere Inn")
                .cityId("invalid-city-id")
                .pricePerNight(BigDecimal.valueOf(1000.0))
                .build();

        assertThatThrownBy(() -> hotelService.createPartnerHotel("usr-partner-a", request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("City not found");
    }
}
