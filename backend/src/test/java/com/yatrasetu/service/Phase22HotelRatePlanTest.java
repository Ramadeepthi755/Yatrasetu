package com.yatrasetu.service;

import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.web.dto.CreateRatePlanRequest;
import com.yatrasetu.web.dto.HotelRatePlanDto;
import com.yatrasetu.web.dto.UpdateRatePlanRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class Phase22HotelRatePlanTest {

    @Autowired
    private HotelRatePlanService ratePlanService;

    @Autowired
    private HotelRatePlanRepository ratePlanRepository;

    @Autowired
    private HotelRoomTypeRepository roomTypeRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private StateRepository stateRepository;

    private User partnerA;
    private User partnerB;
    private Hotel hotelA;
    private Hotel hotelB;
    private HotelRoomType roomA1;
    private HotelRoomType roomA2;
    private HotelRoomType roomB1;

    @BeforeEach
    void setUp() {
        State state = stateRepository.findAll().stream().findFirst().orElseGet(() ->
                stateRepository.save(State.builder().id("state-rp-test").stateName("Rajasthan").region("NORTH").build())
        );

        City city = cityRepository.findAll().stream().findFirst().orElseGet(() ->
                cityRepository.save(City.builder()
                        .id("city-rp-test")
                        .cityName("Jodhpur")
                        .state(state)
                        .latitude(BigDecimal.valueOf(26.2389))
                        .longitude(BigDecimal.valueOf(73.0243))
                        .build())
        );

        Destination dest = destinationRepository.findAll().stream().findFirst().orElse(null);

        partnerA = userRepository.save(User.builder()
                .id("usr-partner-rp-a")
                .authUserId("auth-partner-rp-a")
                .email("partner.a@yatrasetu.test")
                .fullName("Haveli Host A")
                .role(Role.PARTNER)
                .partnerSubtype(PartnerSubtype.HOTEL)
                .active(true)
                .verified(true)
                .build());

        partnerB = userRepository.save(User.builder()
                .id("usr-partner-rp-b")
                .authUserId("auth-partner-rp-b")
                .email("partner.b@yatrasetu.test")
                .fullName("Resort Host B")
                .role(Role.PARTNER)
                .partnerSubtype(PartnerSubtype.HOMESTAY)
                .active(true)
                .verified(true)
                .build());

        hotelA = hotelRepository.save(Hotel.builder()
                .id("htl-rp-a")
                .hotelName("Royal Haveli Heritage")
                .city(city)
                .destination(dest)
                .owner(partnerA)
                .isPartnerProperty(true)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .verificationStatus(HotelVerificationStatus.VERIFIED)
                .pricePerNight(BigDecimal.valueOf(4000))
                .isActive(true)
                .build());

        hotelB = hotelRepository.save(Hotel.builder()
                .id("htl-rp-b")
                .hotelName("Sunset Desert Camp")
                .city(city)
                .destination(dest)
                .owner(partnerB)
                .isPartnerProperty(true)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .verificationStatus(HotelVerificationStatus.VERIFIED)
                .pricePerNight(BigDecimal.valueOf(3000))
                .isActive(true)
                .build());

        roomA1 = roomTypeRepository.save(HotelRoomType.builder()
                .id("rm-a1")
                .hotel(hotelA)
                .roomTypeName("Deluxe Heritage King")
                .maxOccupancy(2)
                .bedConfiguration("1 King Bed")
                .baseInventoryUnits(5)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .isActive(true)
                .build());

        roomA2 = roomTypeRepository.save(HotelRoomType.builder()
                .id("rm-a2")
                .hotel(hotelA)
                .roomTypeName("Royal Haveli Suite")
                .maxOccupancy(4)
                .bedConfiguration("2 Queen Beds")
                .baseInventoryUnits(2)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .isActive(true)
                .build());

        roomB1 = roomTypeRepository.save(HotelRoomType.builder()
                .id("rm-b1")
                .hotel(hotelB)
                .roomTypeName("Luxury Desert Tent")
                .maxOccupancy(2)
                .bedConfiguration("1 King Bed")
                .baseInventoryUnits(8)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .isActive(true)
                .build());
    }

    @Test
    @DisplayName("Partner can create and list rate plan for own room type")
    void testPartnerCreateRatePlanSuccess() {
        CreateRatePlanRequest request = CreateRatePlanRequest.builder()
                .planName("Bed & Traditional Breakfast (CP)")
                .mealPlan("CP")
                .description("Includes complimentary organic breakfast spread in courtyard")
                .basePrice(BigDecimal.valueOf(4500))
                .currency("INR")
                .priceUnit("PER_NIGHT")
                .validFrom(LocalDate.of(2026, 10, 1))
                .validTo(LocalDate.of(2026, 12, 31))
                .cancellationPolicy("FREE_CANCELLATION")
                .cancellationDeadlineHours(24)
                .taxesIncluded(true)
                .feesIncluded(false)
                .status("ACTIVE")
                .build();

        HotelRatePlanDto created = ratePlanService.createRatePlan(hotelA.getId(), roomA1.getId(), request, partnerA.getEmail());

        assertThat(created).isNotNull();
        assertThat(created.getId()).startsWith("rate-");
        assertThat(created.getPlanName()).isEqualTo("Bed & Traditional Breakfast (CP)");
        assertThat(created.getMealPlan()).isEqualTo("CP");
        assertThat(created.getBasePrice()).isEqualByComparingTo(BigDecimal.valueOf(4500));
        assertThat(created.getCurrency()).isEqualTo("INR");
        assertThat(created.getTaxesIncluded()).isTrue();
        assertThat(created.getSourceType()).isEqualTo("PARTNER_SUBMITTED");
        assertThat(created.getStatus()).isEqualTo("ACTIVE");

        List<HotelRatePlanDto> plans = ratePlanService.getPartnerRatePlans(hotelA.getId(), roomA1.getId(), partnerA.getEmail());
        assertThat(plans).hasSize(1);
        assertThat(plans.get(0).getId()).isEqualTo(created.getId());
    }

    @Test
    @DisplayName("Multiple distinct meal plans (EP and CP) can coexist for the same room")
    void testMultipleDistinctMealPlansCoexist() {
        CreateRatePlanRequest epPlan = CreateRatePlanRequest.builder()
                .planName("Standard Room Only (EP)")
                .mealPlan("EP")
                .basePrice(BigDecimal.valueOf(3800))
                .status("ACTIVE")
                .build();

        CreateRatePlanRequest cpPlan = CreateRatePlanRequest.builder()
                .planName("Breakfast Included (CP)")
                .mealPlan("CP")
                .basePrice(BigDecimal.valueOf(4400))
                .status("ACTIVE")
                .build();

        ratePlanService.createRatePlan(hotelA.getId(), roomA1.getId(), epPlan, partnerA.getEmail());
        ratePlanService.createRatePlan(hotelA.getId(), roomA1.getId(), cpPlan, partnerA.getEmail());

        List<HotelRatePlanDto> plans = ratePlanService.getPartnerRatePlans(hotelA.getId(), roomA1.getId(), partnerA.getEmail());
        assertThat(plans).hasSize(2);
    }

    @Test
    @DisplayName("Overlapping active rate plans with identical meal plan for same room are rejected")
    void testOverlappingActiveSameMealPlanRejected() {
        CreateRatePlanRequest plan1 = CreateRatePlanRequest.builder()
                .planName("Autumn CP Special")
                .mealPlan("CP")
                .basePrice(BigDecimal.valueOf(4200))
                .validFrom(LocalDate.of(2026, 10, 1))
                .validTo(LocalDate.of(2026, 11, 30))
                .status("ACTIVE")
                .build();

        ratePlanService.createRatePlan(hotelA.getId(), roomA1.getId(), plan1, partnerA.getEmail());

        // Overlapping date range (Nov 15 to Dec 31 overlaps with Oct 1 to Nov 30)
        CreateRatePlanRequest overlapping = CreateRatePlanRequest.builder()
                .planName("Winter CP Special")
                .mealPlan("CP")
                .basePrice(BigDecimal.valueOf(4600))
                .validFrom(LocalDate.of(2026, 11, 15))
                .validTo(LocalDate.of(2026, 12, 31))
                .status("ACTIVE")
                .build();

        assertThatThrownBy(() -> ratePlanService.createRatePlan(hotelA.getId(), roomA1.getId(), overlapping, partnerA.getEmail()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("overlapping validity period");
    }

    @Test
    @DisplayName("Non-overlapping seasonal rate plans with identical meal plan are allowed")
    void testNonOverlappingSeasonalPlansAllowed() {
        CreateRatePlanRequest autumn = CreateRatePlanRequest.builder()
                .planName("Autumn CP")
                .mealPlan("CP")
                .basePrice(BigDecimal.valueOf(4200))
                .validFrom(LocalDate.of(2026, 9, 1))
                .validTo(LocalDate.of(2026, 10, 31))
                .status("ACTIVE")
                .build();

        CreateRatePlanRequest winter = CreateRatePlanRequest.builder()
                .planName("Winter Peak CP")
                .mealPlan("CP")
                .basePrice(BigDecimal.valueOf(5200))
                .validFrom(LocalDate.of(2026, 11, 1))
                .validTo(LocalDate.of(2026, 12, 31))
                .status("ACTIVE")
                .build();

        ratePlanService.createRatePlan(hotelA.getId(), roomA1.getId(), autumn, partnerA.getEmail());
        ratePlanService.createRatePlan(hotelA.getId(), roomA1.getId(), winter, partnerA.getEmail());

        List<HotelRatePlanDto> plans = ratePlanService.getPartnerRatePlans(hotelA.getId(), roomA1.getId(), partnerA.getEmail());
        assertThat(plans).hasSize(2);
    }

    @Test
    @DisplayName("Cross-partner isolation: Partner A cannot modify Partner B's rate plans")
    void testCrossPartnerIsolation() {
        CreateRatePlanRequest bPlan = CreateRatePlanRequest.builder()
                .planName("Desert Luxury CP")
                .mealPlan("CP")
                .basePrice(BigDecimal.valueOf(5000))
                .status("ACTIVE")
                .build();

        HotelRatePlanDto createdB = ratePlanService.createRatePlan(hotelB.getId(), roomB1.getId(), bPlan, partnerB.getEmail());

        // Partner A attempts to modify Partner B's plan
        UpdateRatePlanRequest updateReq = UpdateRatePlanRequest.builder()
                .basePrice(BigDecimal.valueOf(100))
                .build();

        assertThatThrownBy(() -> ratePlanService.updateRatePlan(hotelB.getId(), roomB1.getId(), createdB.getId(), updateReq, partnerA.getEmail()))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Access denied");

        assertThatThrownBy(() -> ratePlanService.deleteRatePlan(hotelB.getId(), roomB1.getId(), createdB.getId(), partnerA.getEmail()))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("Negative base price is strictly rejected")
    void testNegativePriceRejected() {
        CreateRatePlanRequest invalid = CreateRatePlanRequest.builder()
                .planName("Negative Price")
                .mealPlan("EP")
                .basePrice(BigDecimal.valueOf(-500))
                .build();

        assertThatThrownBy(() -> ratePlanService.createRatePlan(hotelA.getId(), roomA1.getId(), invalid, partnerA.getEmail()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Base price cannot be negative");
    }

    @Test
    @DisplayName("Invalid validity date range (valid_to < valid_from) is rejected")
    void testInvalidDateRangeRejected() {
        CreateRatePlanRequest invalidDates = CreateRatePlanRequest.builder()
                .planName("Time Travel Plan")
                .mealPlan("EP")
                .basePrice(BigDecimal.valueOf(3500))
                .validFrom(LocalDate.of(2026, 12, 31))
                .validTo(LocalDate.of(2026, 1, 1))
                .build();

        assertThatThrownBy(() -> ratePlanService.createRatePlan(hotelA.getId(), roomA1.getId(), invalidDates, partnerA.getEmail()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("valid_to cannot be earlier than valid_from");
    }

    @Test
    @DisplayName("Partner can activate and deactivate rate plan")
    void testActivateDeactivateLifecycle() {
        CreateRatePlanRequest request = CreateRatePlanRequest.builder()
                .planName("Draft Promotional Plan")
                .mealPlan("MAP")
                .basePrice(BigDecimal.valueOf(6000))
                .status("DRAFT")
                .build();

        HotelRatePlanDto plan = ratePlanService.createRatePlan(hotelA.getId(), roomA1.getId(), request, partnerA.getEmail());
        assertThat(plan.getStatus()).isEqualTo("DRAFT");

        HotelRatePlanDto activated = ratePlanService.activateRatePlan(hotelA.getId(), roomA1.getId(), plan.getId(), partnerA.getEmail());
        assertThat(activated.getStatus()).isEqualTo("ACTIVE");

        HotelRatePlanDto deactivated = ratePlanService.deactivateRatePlan(hotelA.getId(), roomA1.getId(), plan.getId(), partnerA.getEmail());
        assertThat(deactivated.getStatus()).isEqualTo("INACTIVE");
    }

    @Test
    @DisplayName("Public traveler rate visibility requires verified parent hotel")
    void testPublicVisibilityRequiresVerifiedHotel() {
        CreateRatePlanRequest request = CreateRatePlanRequest.builder()
                .planName("Verified Public Rate")
                .mealPlan("CP")
                .basePrice(BigDecimal.valueOf(4500))
                .status("ACTIVE")
                .build();

        ratePlanService.createRatePlan(hotelA.getId(), roomA1.getId(), request, partnerA.getEmail());

        // Hotel A is VERIFIED -> rates visible
        List<HotelRatePlanDto> publicPlans = ratePlanService.getPublicRatePlansForHotel(hotelA.getId());
        assertThat(publicPlans).hasSize(1);

        // Suspend Hotel A -> public rates automatically suppressed
        hotelA.setVerificationStatus(HotelVerificationStatus.SUSPENDED);
        hotelRepository.save(hotelA);

        List<HotelRatePlanDto> suppressedPlans = ratePlanService.getPublicRatePlansForHotel(hotelA.getId());
        assertThat(suppressedPlans).isEmpty();
    }

    @Test
    @DisplayName("Public traveler rate visibility suppresses inactive room rates")
    void testPublicVisibilitySuppressesInactiveRoomRates() {
        CreateRatePlanRequest request = CreateRatePlanRequest.builder()
                .planName("Room 2 Suite Plan")
                .mealPlan("MAP")
                .basePrice(BigDecimal.valueOf(7500))
                .status("ACTIVE")
                .build();

        ratePlanService.createRatePlan(hotelA.getId(), roomA2.getId(), request, partnerA.getEmail());

        // Deactivate Room A2
        roomA2.setIsActive(false);
        roomTypeRepository.save(roomA2);

        List<HotelRatePlanDto> publicPlans = ratePlanService.getPublicRatePlansForRoomType(hotelA.getId(), roomA2.getId());
        assertThat(publicPlans).isEmpty();
    }
}
