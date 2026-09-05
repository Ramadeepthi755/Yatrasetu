package com.yatrasetu.web.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.web.dto.*;
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
import java.time.LocalDate;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class Phase5TravelConnectTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private StateRepository stateRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private TravelBuddyRepository travelBuddyRepository;

    @Autowired
    private TravelBuddyRequestRepository travelBuddyRequestRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    private User travelerA;
    private User travelerB;
    private User travelerC;
    private State testState;
    private City testCity;
    private Destination testDest;
    private Destination otherDest;
    private TravelBuddy buddyA;
    private TravelBuddy buddyB;
    private TravelBuddy buddyC;

    @BeforeEach
    void setUp() {
        messageRepository.deleteAll();
        notificationRepository.deleteAll();
        travelBuddyRequestRepository.deleteAll();
        travelBuddyRepository.deleteAll();
        profileRepository.deleteAll();
        destinationRepository.deleteAll();
        cityRepository.deleteAll();
        stateRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Create Users
        travelerA = userRepository.save(User.builder()
                .id("usr-a")
                .authUserId("auth-usr-a")
                .email("traveler_a@test.com")
                .fullName("Aarav Explorer")
                .role(Role.TRAVELER)
                .verified(true)
                .active(true)
                .createdAt(Instant.now())
                .build());

        travelerB = userRepository.save(User.builder()
                .id("usr-b")
                .authUserId("auth-usr-b")
                .email("traveler_b@test.com")
                .fullName("Bhavna Culture")
                .role(Role.TRAVELER)
                .verified(true)
                .active(true)
                .createdAt(Instant.now())
                .build());

        travelerC = userRepository.save(User.builder()
                .id("usr-c")
                .authUserId("auth-usr-c")
                .email("traveler_c@test.com")
                .fullName("Chirag Hidden")
                .role(Role.TRAVELER)
                .verified(true)
                .active(true)
                .createdAt(Instant.now())
                .build());

        Profile profA = Profile.builder()
                .id(travelerA.getId())
                .user(travelerA)
                .displayName("Aarav Explorer")
                .bio("Passionate about heritage walks and ancient ghats.")
                .travelStyle("Cultural Explorer")
                .travelConnectEnabled(true)
                .interests(List.of("Heritage", "Culture", "Photography"))
                .languages(List.of("English", "Hindi"))
                .build();
        travelerA.setProfile(profA);
        travelerA = userRepository.save(travelerA);

        Profile profB = Profile.builder()
                .id(travelerB.getId())
                .user(travelerB)
                .displayName("Bhavna Culture")
                .bio("Food and spiritual culture enthusiast.")
                .travelStyle("Cultural Explorer")
                .travelConnectEnabled(true)
                .interests(List.of("Heritage", "Food"))
                .languages(List.of("English", "Hindi"))
                .build();
        travelerB.setProfile(profB);
        travelerB = userRepository.save(travelerB);

        // Traveler C has Travel Connect DISABLED
        Profile profC = Profile.builder()
                .id(travelerC.getId())
                .user(travelerC)
                .displayName("Chirag Hidden")
                .bio("Private traveler.")
                .travelStyle("Budget")
                .travelConnectEnabled(false)
                .interests(List.of("Adventure"))
                .languages(List.of("English"))
                .build();
        travelerC.setProfile(profC);
        travelerC = userRepository.save(travelerC);

        // 3. Create Locations
        testState = stateRepository.save(State.builder()
                .id("IN-UP")
                .stateName("Uttar Pradesh")
                .region("North India")
                .build());

        testCity = cityRepository.save(City.builder()
                .id("city-varanasi")
                .cityName("Varanasi")
                .state(testState)
                .latitude(BigDecimal.valueOf(25.3176))
                .longitude(BigDecimal.valueOf(82.9739))
                .isTourismHub(true)
                .build());

        testDest = destinationRepository.save(Destination.builder()
                .id("dest-4")
                .destinationName("Varanasi (Kashi)")
                .state(testState)
                .city(testCity)
                .region("North India")
                .latitude(BigDecimal.valueOf(25.3176))
                .longitude(BigDecimal.valueOf(82.9739))
                .description("Spiritual capital of India.")
                .isActive(true)
                .build());

        otherDest = destinationRepository.save(Destination.builder()
                .id("dest-3")
                .destinationName("Jaipur")
                .state(testState)
                .city(testCity)
                .region("North India")
                .latitude(BigDecimal.valueOf(26.9124))
                .longitude(BigDecimal.valueOf(75.7873))
                .description("The Pink City.")
                .isActive(true)
                .build());

        // 4. Create Travel Buddy Trips
        // Traveler A: Varanasi, Oct 10 - Oct 14, 2026
        buddyA = travelBuddyRepository.save(TravelBuddy.builder()
                .id("tb-test-a")
                .user(travelerA)
                .destination(testDest)
                .destinationCity("Varanasi")
                .state(testState)
                .travelDate(LocalDate.of(2026, 10, 10))
                .endDate(LocalDate.of(2026, 10, 14))
                .flexibleDates(false)
                .budgetInr(BigDecimal.valueOf(8000.0))
                .travelStyle("Cultural Explorer")
                .interests(List.of("Heritage", "Culture", "Photography"))
                .languages(List.of("English", "Hindi"))
                .demoData(false)
                .active(true)
                .build());

        // Traveler B: Varanasi, Oct 12 - Oct 16, 2026 (Overlaps with A!)
        buddyB = travelBuddyRepository.save(TravelBuddy.builder()
                .id("tb-test-b")
                .user(travelerB)
                .destination(testDest)
                .destinationCity("Varanasi")
                .state(testState)
                .travelDate(LocalDate.of(2026, 10, 12))
                .endDate(LocalDate.of(2026, 10, 16))
                .flexibleDates(true)
                .budgetInr(BigDecimal.valueOf(10000.0))
                .travelStyle("Cultural Explorer")
                .interests(List.of("Heritage", "Food"))
                .languages(List.of("English", "Hindi"))
                .demoData(false)
                .active(true)
                .build());

        // Traveler C: Jaipur, Dec 1 - Dec 5, 2026 (Disabled connect)
        buddyC = travelBuddyRepository.save(TravelBuddy.builder()
                .id("tb-test-c")
                .user(travelerC)
                .destination(otherDest)
                .destinationCity("Jaipur")
                .state(testState)
                .travelDate(LocalDate.of(2026, 12, 1))
                .endDate(LocalDate.of(2026, 12, 5))
                .flexibleDates(false)
                .budgetInr(BigDecimal.valueOf(5000.0))
                .travelStyle("Budget")
                .interests(List.of("Adventure"))
                .languages(List.of("English"))
                .demoData(false)
                .active(true)
                .build());
    }

    // =========================================================================
    // 1. Discovery & Deterministic Compatibility Engine Tests
    // =========================================================================

    @Test
    void testDiscoverTravelersPublicEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/travel-connect"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    void testVisibilityFilteringHidesDisabledTraveler() throws Exception {
        mockMvc.perform(get("/api/v1/travel-connect"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[?(@.travelerId == 'usr-c')]").doesNotExist());
    }

    @Test
    void testSameDestinationAndOverlappingDatesYieldsHighMatchScore() throws Exception {
        // Authenticated as Traveler A searching travelers in Varanasi
        mockMvc.perform(get("/api/v1/travel-connect?destinationId=dest-4")
                .header("X-Test-User-Email", travelerA.getEmail()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].travelerId").value("usr-b"))
                .andExpect(jsonPath("$.data.content[0].matchScore").value(org.hamcrest.Matchers.greaterThanOrEqualTo(85)))
                .andExpect(jsonPath("$.data.content[0].matchReasons").isArray());
    }

    @Test
    void testDestinationTravelersIntegrationEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/travel-connect/destination/{destinationId}", testDest.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].destinationName").value("Varanasi (Kashi)"));
    }

    @Test
    void testGetTravelerPublicProfileDoesNotLeakPrivateData() throws Exception {
        mockMvc.perform(get("/api/v1/travel-connect/{travelerId}", travelerB.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.displayName").value("Bhavna Culture"))
                .andExpect(jsonPath("$.data.email").doesNotExist())
                .andExpect(jsonPath("$.data.phone").doesNotExist());
    }

    // =========================================================================
    // 2. Connection Request Lifecycle & Security Tests
    // =========================================================================

    @Test
    void testUnauthenticatedSendRequestReturns401() throws Exception {
        CreateConnectionRequest req = CreateConnectionRequest.builder()
                .recipientTravelerId(travelerB.getId())
                .message("Hello!")
                .build();

        mockMvc.perform(post("/api/v1/travel-connect/requests")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testSelfRequestPreventionReturns400() throws Exception {
        CreateConnectionRequest req = CreateConnectionRequest.builder()
                .recipientTravelerId(travelerA.getId())
                .message("Connecting with myself")
                .build();

        mockMvc.perform(post("/api/v1/travel-connect/requests")
                .header("X-Test-User-Email", travelerA.getEmail())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testSendConnectionRequestSuccessAndNotificationCreated() throws Exception {
        CreateConnectionRequest req = CreateConnectionRequest.builder()
                .recipientTravelerId(travelerB.getId())
                .destinationId(testDest.getId())
                .message("Hi Bhavna, also visiting Varanasi!")
                .build();

        mockMvc.perform(post("/api/v1/travel-connect/requests")
                .header("X-Test-User-Email", travelerA.getEmail())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.senderName").value("Aarav Explorer"));

        // Verify recipient received notification
        List<Notification> notifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(travelerB.getId());
        org.junit.jupiter.api.Assertions.assertFalse(notifs.isEmpty());
        org.junit.jupiter.api.Assertions.assertEquals("BUDDY_REQUEST", notifs.get(0).getCategory());
    }

    @Test
    void testPreventDuplicatePendingRequest() throws Exception {
        CreateConnectionRequest req = CreateConnectionRequest.builder()
                .recipientTravelerId(travelerB.getId())
                .message("First request")
                .build();

        mockMvc.perform(post("/api/v1/travel-connect/requests")
                .header("X-Test-User-Email", travelerA.getEmail())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        // Duplicate attempt
        mockMvc.perform(post("/api/v1/travel-connect/requests")
                .header("X-Test-User-Email", travelerA.getEmail())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testAcceptRequestByRecipientSuccessAndOwnershipEnforcement() throws Exception {
        // Traveler A sends request to Traveler B
        TravelBuddyRequest req = travelBuddyRequestRepository.save(TravelBuddyRequest.builder()
                .id("tbr-test-1")
                .sender(travelerA)
                .receiver(travelerB)
                .destination(testDest)
                .status("PENDING")
                .message("Connect request")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build());

        // Unauthorized user (Traveler C) tries to accept Traveler B's request -> 403 Forbidden
        mockMvc.perform(post("/api/v1/travel-connect/requests/{id}/accept", req.getId())
                .header("X-Test-User-Email", travelerC.getEmail()))
                .andExpect(status().isForbidden());

        // Authorized recipient (Traveler B) accepts -> 200 OK
        mockMvc.perform(post("/api/v1/travel-connect/requests/{id}/accept", req.getId())
                .header("X-Test-User-Email", travelerB.getEmail()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("ACCEPTED"));

        // Now appears in /connections for both users
        mockMvc.perform(get("/api/v1/travel-connect/connections")
                .header("X-Test-User-Email", travelerA.getEmail()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].partnerName").value("Bhavna Culture"));
    }

    @Test
    void testCancelRequestOnlyBySender() throws Exception {
        TravelBuddyRequest req = travelBuddyRequestRepository.save(TravelBuddyRequest.builder()
                .id("tbr-test-cancel")
                .sender(travelerA)
                .receiver(travelerB)
                .status("PENDING")
                .build());

        // Receiver cannot cancel -> 403 Forbidden
        mockMvc.perform(post("/api/v1/travel-connect/requests/{id}/cancel", req.getId())
                .header("X-Test-User-Email", travelerB.getEmail()))
                .andExpect(status().isForbidden());

        // Sender cancels -> 200 OK
        mockMvc.perform(post("/api/v1/travel-connect/requests/{id}/cancel", req.getId())
                .header("X-Test-User-Email", travelerA.getEmail()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));
    }

    // =========================================================================
    // 3. Internal Messaging & Authorization Tests
    // =========================================================================

    @Test
    void testUnconnectedUsersCannotMessageEachOther() throws Exception {
        SendMessageRequest msg = SendMessageRequest.builder()
                .message("Are you there?")
                .build();

        mockMvc.perform(post("/api/v1/travel-connect/connections/fake-conn/messages")
                .header("X-Test-User-Email", travelerA.getEmail())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(msg)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testConnectedUsersCanSendAndReadMessages() throws Exception {
        // Create an ACCEPTED connection
        TravelBuddyRequest conn = travelBuddyRequestRepository.save(TravelBuddyRequest.builder()
                .id("tbr-conn-1")
                .sender(travelerA)
                .receiver(travelerB)
                .destination(testDest)
                .status("ACCEPTED")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build());

        SendMessageRequest msg = SendMessageRequest.builder()
                .message("Hi Bhavna! Looking forward to exploring the ghats together.")
                .build();

        // Traveler A sends message to Traveler B
        mockMvc.perform(post("/api/v1/travel-connect/connections/{connectionId}/messages", conn.getId())
                .header("X-Test-User-Email", travelerA.getEmail())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(msg)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.message").value("Hi Bhavna! Looking forward to exploring the ghats together."));

        // Traveler B reads messages
        mockMvc.perform(get("/api/v1/travel-connect/connections/{connectionId}/messages", conn.getId())
                .header("X-Test-User-Email", travelerB.getEmail()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].message").value("Hi Bhavna! Looking forward to exploring the ghats together."));
    }

    // =========================================================================
    // 4. Settings & Visibility Toggle Tests
    // =========================================================================

    @Test
    void testGetAndUpdateTravelConnectSettings() throws Exception {
        mockMvc.perform(get("/api/v1/travel-connect/settings")
                .header("X-Test-User-Email", travelerA.getEmail()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.travelConnectEnabled").value(true));

        UpdateTravelConnectSettingsRequest update = UpdateTravelConnectSettingsRequest.builder()
                .travelConnectEnabled(false)
                .build();

        mockMvc.perform(put("/api/v1/travel-connect/settings")
                .header("X-Test-User-Email", travelerA.getEmail())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.travelConnectEnabled").value(false));
    }
}
