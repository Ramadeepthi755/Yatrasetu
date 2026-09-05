package com.yatrasetu.web.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yatrasetu.domain.PartnerSubtype;
import com.yatrasetu.domain.Role;
import com.yatrasetu.domain.User;
import com.yatrasetu.domain.VerificationStatus;
import com.yatrasetu.repository.UserRepository;
import com.yatrasetu.service.UserService;
import com.yatrasetu.web.dto.UpdatePartnerProfileRequest;
import com.yatrasetu.web.dto.UpdateProfileRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthenticationAndRbacTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setup() {
        userRepository.deleteAll();

        // Seed Traveler
        userService.syncUser("auth-traveler-1", "traveler@yatrasetu.in", "Aditi Sharma", Role.TRAVELER, null);

        // Seed Partner
        userService.syncUser("auth-partner-1", "partner@yatrasetu.in", "Rajesh Guide", Role.PARTNER, PartnerSubtype.GUIDE);

        // Seed Government Official (Directly in DB since public signup is blocked)
        User govUser = User.builder()
                .id("auth-gov-1")
                .authUserId("auth-gov-1")
                .email("official@tourism.gov.in")
                .fullName("Director General of Tourism")
                .role(Role.GOVERNMENT)
                .verified(true)
                .verificationStatus(VerificationStatus.APPROVED)
                .active(true)
                .build();
        userRepository.save(govUser);
    }

    @Test
    void testUnauthenticatedProfileAccessReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/profile/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void testUnauthenticatedPartnerAccessReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/partner/profile/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void testUnauthenticatedGovernmentAccessReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/government/overview"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void testAuthenticatedTravelerCanAccessAndEditOwnProfile() throws Exception {
        mockMvc.perform(get("/api/v1/profile/me")
                .header("X-Test-User-Email", "traveler@yatrasetu.in"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("traveler@yatrasetu.in"))
                .andExpect(jsonPath("$.data.role").value("TRAVELER"));

        UpdateProfileRequest updateReq = UpdateProfileRequest.builder()
                .displayName("Aditi S.")
                .city("Bengaluru")
                .interests(List.of("Nature", "Heritage"))
                .travelStyle("Backpacker")
                .build();

        mockMvc.perform(put("/api/v1/profile/me")
                .header("X-Test-User-Email", "traveler@yatrasetu.in")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.displayName").value("Aditi S."))
                .andExpect(jsonPath("$.data.city").value("Bengaluru"))
                .andExpect(jsonPath("$.data.travelStyle").value("Backpacker"));
    }

    @Test
    void testTravelerCannotAccessPartnerRoutesReturns403() throws Exception {
        mockMvc.perform(get("/api/v1/partner/profile/me")
                .header("X-Test-User-Email", "traveler@yatrasetu.in"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Access denied"));
    }

    @Test
    void testTravelerCannotAccessGovernmentRoutesReturns403() throws Exception {
        mockMvc.perform(get("/api/v1/government/overview")
                .header("X-Test-User-Email", "traveler@yatrasetu.in"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void testPartnerCanAccessPartnerRoutes() throws Exception {
        mockMvc.perform(get("/api/v1/partner/profile/me")
                .header("X-Test-User-Email", "partner@yatrasetu.in"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("partner@yatrasetu.in"))
                .andExpect(jsonPath("$.data.role").value("PARTNER"))
                .andExpect(jsonPath("$.data.partnerSubtype").value("GUIDE"))
                .andExpect(jsonPath("$.data.verificationStatus").value("PENDING"));

        UpdatePartnerProfileRequest updatePartner = UpdatePartnerProfileRequest.builder()
                .businessName("Rajesh Heritage Walks")
                .bio("15+ years showing travelers the ancient temples of Hampi.")
                .city("Hampi")
                .languages(List.of("Kannada", "English", "Hindi"))
                .partnerSkills(List.of("Storytelling", "History"))
                .build();

        mockMvc.perform(put("/api/v1/partner/profile/me")
                .header("X-Test-User-Email", "partner@yatrasetu.in")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatePartner)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.businessName").value("Rajesh Heritage Walks"))
                .andExpect(jsonPath("$.data.city").value("Hampi"));
    }

    @Test
    void testPartnerCannotAccessGovernmentRoutesReturns403() throws Exception {
        mockMvc.perform(get("/api/v1/government/overview")
                .header("X-Test-User-Email", "partner@yatrasetu.in"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGovernmentUserCanAccessGovernmentOverview() throws Exception {
        mockMvc.perform(get("/api/v1/government/overview")
                .header("X-Test-User-Email", "official@tourism.gov.in"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.authority").exists())
                .andExpect(jsonPath("$.data.availableDestinations").value(93));
    }

    @Test
    void testPublicSignupRejectsGovernmentRole() throws Exception {
        AuthController.SyncUserRequest req = new AuthController.SyncUserRequest();
        req.setEmail("fakegov@test.com");
        req.setFullName("Unauthorized Official");
        req.setRole(Role.GOVERNMENT);

        mockMvc.perform(post("/api/v1/auth/sync")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void testMockTokenAuthenticationAcrossRoles() throws Exception {
        // 1. Traveler Mock Token with dot in domain
        mockMvc.perform(get("/api/v1/trips")
                .header("Authorization", "Bearer mock-traveler-traveler@yatrasetu.in"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // 2. Partner Mock Token with dot in domain
        mockMvc.perform(get("/api/v1/partner/profile/me")
                .header("Authorization", "Bearer mock-partner-partner@yatrasetu.in"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // 3. Government Mock Token with dot in domain
        mockMvc.perform(get("/api/v1/government/overview")
                .header("Authorization", "Bearer mock-government-official@tourism.gov.in"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testGovernmentIntelligenceGuestAccessReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/government/intelligence/overview"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));

        mockMvc.perform(get("/api/v1/government/intelligence/demand"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/government/intelligence/destinations"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/government/intelligence/redistribution"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGovernmentIntelligenceTravelerAccessReturns403() throws Exception {
        mockMvc.perform(get("/api/v1/government/intelligence/overview")
                .header("Authorization", "Bearer mock-traveler-traveler@yatrasetu.in"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));

        mockMvc.perform(get("/api/v1/government/intelligence/demand")
                .header("X-Test-User-Email", "traveler@yatrasetu.in"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGovernmentIntelligencePartnerAccessReturns403() throws Exception {
        mockMvc.perform(get("/api/v1/government/intelligence/overview")
                .header("Authorization", "Bearer mock-partner-partner@yatrasetu.in"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));

        mockMvc.perform(get("/api/v1/government/intelligence/redistribution")
                .header("X-Test-User-Email", "partner@yatrasetu.in"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGovernmentIntelligenceGovernmentAccessReturns200() throws Exception {
        mockMvc.perform(get("/api/v1/government/intelligence/overview")
                .header("Authorization", "Bearer mock-government-official@tourism.gov.in"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalDestinationsMonitored").exists())
                .andExpect(jsonPath("$.data.dataDisclaimer").exists());

        mockMvc.perform(get("/api/v1/government/intelligence/demand")
                .header("Authorization", "Bearer mock-government-official@tourism.gov.in"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/api/v1/government/intelligence/redistribution")
                .header("Authorization", "Bearer mock-government-official@tourism.gov.in"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Phase 15 Endpoints
        mockMvc.perform(get("/api/v1/government/intelligence/ecosystem-gaps")
                .header("Authorization", "Bearer mock-government-official@tourism.gov.in"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/api/v1/government/intelligence/hidden-gems")
                .header("Authorization", "Bearer mock-government-official@tourism.gov.in"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/api/v1/government/intelligence/redistribution/dynamic")
                .header("Authorization", "Bearer mock-government-official@tourism.gov.in"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/api/v1/government/intelligence/alerts")
                .header("Authorization", "Bearer mock-government-official@tourism.gov.in"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/api/v1/government/intelligence/actions/history")
                .header("Authorization", "Bearer mock-government-official@tourism.gov.in"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testPhase15EndpointsBlockedForTravelerAndGuest() throws Exception {
        mockMvc.perform(get("/api/v1/government/intelligence/ecosystem-gaps"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/government/intelligence/ecosystem-gaps")
                .header("Authorization", "Bearer mock-traveler-traveler@yatrasetu.in"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/government/intelligence/hidden-gems"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/government/intelligence/hidden-gems")
                .header("Authorization", "Bearer mock-partner-partner@yatrasetu.in"))
                .andExpect(status().isForbidden());
    }
}
