package com.yatrasetu.web.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.web.dto.CreateExperienceRequest;
import com.yatrasetu.web.dto.UpdateExperienceRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class Phase4ControllersTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StateRepository stateRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private LocalHostRepository localHostRepository;

    @Autowired
    private ExperienceRepository experienceRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private TravelBuddyRepository travelBuddyRepository;

    @Autowired
    private TravelBuddyRequestRepository travelBuddyRequestRepository;

    private User partner1;
    private User partner2;
    private User traveler;
    private State testState;
    private City testCity;
    private Destination testDest;
    private LocalHost host1;
    private LocalHost host2;
    private Experience exp1;
    private Hotel hotel1;

    @BeforeEach
    void setUp() {
        travelBuddyRequestRepository.deleteAll();
        travelBuddyRepository.deleteAll();
        experienceRepository.deleteAll();
        hotelRepository.deleteAll();
        localHostRepository.deleteAll();
        destinationRepository.deleteAll();
        cityRepository.deleteAll();
        stateRepository.deleteAll();
        userRepository.deleteAll();

        // Seed Users
        traveler = User.builder()
                .id("traveler-1")
                .authUserId("auth-traveler-1")
                .email("traveler@yatrasetu.in")
                .fullName("Priya Traveler")
                .role(Role.TRAVELER)
                .verified(true)
                .active(true)
                .build();
        userRepository.save(traveler);

        partner1 = User.builder()
                .id("partner-1")
                .authUserId("auth-partner-1")
                .email("partner1@yatrasetu.in")
                .fullName("Rohan Guide")
                .role(Role.PARTNER)
                .partnerSubtype(PartnerSubtype.GUIDE)
                .verified(true)
                .verificationStatus(VerificationStatus.APPROVED)
                .active(true)
                .build();
        userRepository.save(partner1);

        partner2 = User.builder()
                .id("partner-2")
                .authUserId("auth-partner-2")
                .email("partner2@yatrasetu.in")
                .fullName("Vikram Host")
                .role(Role.PARTNER)
                .partnerSubtype(PartnerSubtype.LOCAL_HOST)
                .verified(true)
                .verificationStatus(VerificationStatus.APPROVED)
                .active(true)
                .build();
        userRepository.save(partner2);

        // Seed Geography
        testState = State.builder()
                .id("IN-RJ")
                .stateName("Rajasthan")
                .region("North India")
                .capitalCity("Jaipur")
                .build();
        stateRepository.save(testState);

        testCity = City.builder()
                .id("jaipur")
                .cityName("Jaipur")
                .state(testState)
                .latitude(BigDecimal.valueOf(26.9124))
                .longitude(BigDecimal.valueOf(75.7873))
                .isTourismHub(true)
                .build();
        cityRepository.save(testCity);

        testDest = Destination.builder()
                .id("dest-jaipur")
                .destinationName("Jaipur Pink City")
                .state(testState)
                .city(testCity)
                .region("North India")
                .latitude(BigDecimal.valueOf(26.9124))
                .longitude(BigDecimal.valueOf(75.7873))
                .popularityScore(BigDecimal.valueOf(9.2))
                .description("Heritage Pink City")
                .isActive(true)
                .build();
        destinationRepository.save(testDest);

        // Seed Host 1 (owned by partner1)
        host1 = LocalHost.builder()
                .id("host-test-1")
                .user(partner1)
                .name("Rohan Guide")
                .state(testState)
                .city(testCity)
                .destination(testDest)
                .languages(List.of("English", "Hindi"))
                .skills(List.of("Guide", "Heritage Expert"))
                .roleTitle("Senior Heritage Guide")
                .pricePerHour(BigDecimal.valueOf(450.0))
                .rating(BigDecimal.valueOf(4.9))
                .experienceCount(42)
                .isVerified(true)
                .isDemoData(false)
                .about("Expert in Jaipur royal havelis.")
                .build();
        localHostRepository.save(host1);

        // Seed Host 2 (owned by partner2)
        host2 = LocalHost.builder()
                .id("host-test-2")
                .user(partner2)
                .name("Vikram Host")
                .state(testState)
                .city(testCity)
                .destination(testDest)
                .languages(List.of("English", "Hindi"))
                .skills(List.of("Food Expert"))
                .roleTitle("Culinary Storyteller")
                .pricePerHour(BigDecimal.valueOf(600.0))
                .rating(BigDecimal.valueOf(4.7))
                .experienceCount(20)
                .isVerified(true)
                .isDemoData(false)
                .about("Food walk expert.")
                .build();
        localHostRepository.save(host2);

        // Seed Experience 1 (hosted by host1, owned by partner1)
        exp1 = Experience.builder()
                .id("exp-test-1")
                .host(host1)
                .destination(testDest)
                .city(testCity)
                .title("Jaipur Royal Haveli Architecture Walk")
                .description("Explore secret courtyards of the Pink City.")
                .category("Heritage Tour")
                .durationHours(BigDecimal.valueOf(3.0))
                .pricePerPerson(BigDecimal.valueOf(1100.0))
                .maxGroupSize(8)
                .includedItems(List.of("Expert guide", "Haveli tea"))
                .languages(List.of("English", "Hindi"))
                .isApproved(true)
                .isActive(true)
                .isDemoData(false)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        experienceRepository.save(exp1);

        // Seed Hotel 1
        hotel1 = Hotel.builder()
                .id("hotel-test-1")
                .hotelName("Jaipur Royal Palace Haveli")
                .city(testCity)
                .destination(testDest)
                .hotelRating(BigDecimal.valueOf(4.8))
                .pricePerNight(BigDecimal.valueOf(4200.0))
                .category("Heritage")
                .amenities(List.of("WiFi", "Swimming Pool", "Rooftop Restaurant"))
                .address("Old City, Jaipur")
                .isPartnerProperty(true)
                .isActive(true)
                .build();
        hotelRepository.save(hotel1);
    }

    // =========================================================================
    // 1. Local Hosts Public Endpoints
    // =========================================================================

    @Test
    void testGetLocalHostsPublicEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/local"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.totalElements").value(2));
    }

    @Test
    void testGetLocalHostById() throws Exception {
        mockMvc.perform(get("/api/v1/local/{id}", host1.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Rohan Guide"))
                .andExpect(jsonPath("$.data.experiences").isArray())
                .andExpect(jsonPath("$.data.experiences[0].title").value("Jaipur Royal Haveli Architecture Walk"));
    }

    @Test
    void testGetLocalHostsByDestination() throws Exception {
        mockMvc.perform(get("/api/v1/local/destination/{destinationId}", testDest.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    // =========================================================================
    // 2. Experiences Public Endpoints
    // =========================================================================

    @Test
    void testGetExperiencesPublicEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/experiences"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].title").value("Jaipur Royal Haveli Architecture Walk"));
    }

    @Test
    void testGetExperienceById() throws Exception {
        mockMvc.perform(get("/api/v1/experiences/{id}", exp1.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.category").value("Heritage Tour"))
                .andExpect(jsonPath("$.data.hostName").value("Rohan Guide"));
    }

    @Test
    void testGetExperienceCategories() throws Exception {
        mockMvc.perform(get("/api/v1/experiences/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    // =========================================================================
    // 3. Hotels Public Endpoints
    // =========================================================================

    @Test
    void testGetHotelsPublicEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/hotels"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].hotelName").value("Jaipur Royal Palace Haveli"))
                .andExpect(jsonPath("$.data.content[0].category").value("Heritage"));
    }

    @Test
    void testGetHotelById() throws Exception {
        mockMvc.perform(get("/api/v1/hotels/{id}", hotel1.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.hotelName").value("Jaipur Royal Palace Haveli"));
    }

    @Test
    void testGetHotelCategories() throws Exception {
        mockMvc.perform(get("/api/v1/hotels/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    // =========================================================================
    // 4. Destination Integrations
    // =========================================================================

    @Test
    void testDestinationHostsAndExperiencesIntegration() throws Exception {
        mockMvc.perform(get("/api/v1/destinations/{id}/hosts", testDest.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());

        mockMvc.perform(get("/api/v1/destinations/{id}/experiences", testDest.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].title").value("Jaipur Royal Haveli Architecture Walk"));
    }

    // =========================================================================
    // 5. Partner CRUD & Server-Side Ownership Authorization
    // =========================================================================

    @Test
    void testUnauthenticatedPartnerExperiencesReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/partner/experiences"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testTravelerAccessToPartnerExperiencesReturns403() throws Exception {
        mockMvc.perform(get("/api/v1/partner/experiences")
                .header("X-Test-User-Email", traveler.getEmail()))
                .andExpect(status().isForbidden());
    }

    @Test
    void testPartnerCanCreateOwnExperience() throws Exception {
        CreateExperienceRequest newExp = CreateExperienceRequest.builder()
                .destinationId(testDest.getId())
                .cityId(testCity.getId())
                .title("Amber Fort Secret Tunnels Walk")
                .description("Walk inside hidden tunnels of Amer.")
                .category("Heritage Tour")
                .durationHours(BigDecimal.valueOf(2.5))
                .pricePerPerson(BigDecimal.valueOf(850.0))
                .maxGroupSize(10)
                .build();

        mockMvc.perform(post("/api/v1/partner/experiences")
                .header("X-Test-User-Email", partner1.getEmail())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newExp)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Amber Fort Secret Tunnels Walk"));
    }

    @Test
    void testPartnerCanUpdateOwnExperience() throws Exception {
        UpdateExperienceRequest updateReq = UpdateExperienceRequest.builder()
                .title("Jaipur Royal Haveli Walk - Enhanced Edition")
                .pricePerPerson(BigDecimal.valueOf(1350.0))
                .build();

        mockMvc.perform(put("/api/v1/partner/experiences/{id}", exp1.getId())
                .header("X-Test-User-Email", partner1.getEmail())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Jaipur Royal Haveli Walk - Enhanced Edition"))
                .andExpect(jsonPath("$.data.pricePerPerson").value(1350.0));
    }

    @Test
    void testPartnerCannotUpdateAnotherPartnersExperience() throws Exception {
        // Partner 2 attempts to modify Partner 1's experience
        UpdateExperienceRequest unauthorizedReq = UpdateExperienceRequest.builder()
                .title("Hijacked Experience Title")
                .build();

        mockMvc.perform(put("/api/v1/partner/experiences/{id}", exp1.getId())
                .header("X-Test-User-Email", partner2.getEmail())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(unauthorizedReq)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testPartnerCannotDeleteAnotherPartnersExperience() throws Exception {
        // Partner 2 attempts to delete Partner 1's experience
        mockMvc.perform(delete("/api/v1/partner/experiences/{id}", exp1.getId())
                .header("X-Test-User-Email", partner2.getEmail()))
                .andExpect(status().isForbidden());
    }

    @Test
    void testPartnerCanDeleteOwnExperience() throws Exception {
        mockMvc.perform(delete("/api/v1/partner/experiences/{id}", exp1.getId())
                .header("X-Test-User-Email", partner1.getEmail()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
