package com.yatrasetu.service;

import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.web.dto.CreateExperienceRequest;
import com.yatrasetu.web.dto.ExperienceDto;
import com.yatrasetu.web.dto.ExperienceVerificationRequest;
import com.yatrasetu.web.dto.UpdateExperienceRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test")
public class Phase21ArtisanEcosystemTest {

    @Autowired
    private ExperienceService experienceService;

    @Autowired
    private ExperienceRepository experienceRepository;

    @Autowired
    private CulturalTraditionRepository culturalTraditionRepository;

    @Autowired
    private StateRepository stateRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private LocalHostRepository localHostRepository;

    @Autowired
    private UserRepository userRepository;

    private State apState;
    private State rjState;
    private City tirupatiCity;
    private City jaipurCity;
    private Destination srikalahastiDest;
    private Destination jaipurDest;
    private User artisanUser1;
    private User artisanUser2;
    private User govUser;
    private LocalHost artisanHost1;
    private LocalHost artisanHost2;
    private CulturalTradition kalamkariTradition;

    @BeforeEach
    void setUp() {
        // 1. States
        apState = stateRepository.findById("IN-AP").orElseGet(() -> {
            State s = State.builder()
                    .id("IN-AP")
                    .stateName("Andhra Pradesh")
                    .region("South India")
                    .build();
            return stateRepository.save(s);
        });

        rjState = stateRepository.findById("IN-RJ").orElseGet(() -> {
            State s = State.builder()
                    .id("IN-RJ")
                    .stateName("Rajasthan")
                    .region("North India")
                    .build();
            return stateRepository.save(s);
        });

        // 2. Cities
        tirupatiCity = cityRepository.findById("city-tirupati-phase21").orElseGet(() -> {
            City c = City.builder()
                    .id("city-tirupati-phase21")
                    .cityName("Tirupati")
                    .state(apState)
                    .latitude(BigDecimal.valueOf(13.6288))
                    .longitude(BigDecimal.valueOf(79.4192))
                    .tier("Tier 2")
                    .build();
            return cityRepository.save(c);
        });

        jaipurCity = cityRepository.findById("city-jaipur-phase21").orElseGet(() -> {
            City c = City.builder()
                    .id("city-jaipur-phase21")
                    .cityName("Jaipur")
                    .state(rjState)
                    .latitude(BigDecimal.valueOf(26.9124))
                    .longitude(BigDecimal.valueOf(75.7873))
                    .tier("Tier 1")
                    .build();
            return cityRepository.save(c);
        });

        // 3. Destinations
        srikalahastiDest = destinationRepository.findById("dest-srikalahasti-phase21").orElseGet(() -> {
            Destination d = Destination.builder()
                    .id("dest-srikalahasti-phase21")
                    .destinationName("Srikalahasti Heritage Cluster")
                    .state(apState)
                    .city(tirupatiCity)
                    .latitude(BigDecimal.valueOf(13.7498))
                    .longitude(BigDecimal.valueOf(79.6984))
                    .popularityScore(BigDecimal.valueOf(80.0))
                    .isActive(true)
                    .build();
            return destinationRepository.save(d);
        });

        jaipurDest = destinationRepository.findById("dest-jaipur-phase21").orElseGet(() -> {
            Destination d = Destination.builder()
                    .id("dest-jaipur-phase21")
                    .destinationName("Jaipur Old City")
                    .state(rjState)
                    .city(jaipurCity)
                    .latitude(BigDecimal.valueOf(26.9200))
                    .longitude(BigDecimal.valueOf(75.8200))
                    .popularityScore(BigDecimal.valueOf(95.0))
                    .isActive(true)
                    .build();
            return destinationRepository.save(d);
        });

        // 4. Users
        artisanUser1 = userRepository.findById("usr-artisan-1").orElseGet(() -> {
            User u = User.builder()
                    .id("usr-artisan-1")
                    .authUserId("auth-artisan-1")
                    .email("kalamkari.artisan@yatrasetu.in")
                    .fullName("Ramaniah Master Weaver")
                    .role(Role.PARTNER)
                    .partnerSubtype(PartnerSubtype.ARTISAN)
                    .verified(true)
                    .active(true)
                    .build();
            return userRepository.save(u);
        });

        artisanUser2 = userRepository.findById("usr-artisan-2").orElseGet(() -> {
            User u = User.builder()
                    .id("usr-artisan-2")
                    .authUserId("auth-artisan-2")
                    .email("other.partner@yatrasetu.in")
                    .fullName("Other Partner Host")
                    .role(Role.PARTNER)
                    .partnerSubtype(PartnerSubtype.ARTISAN)
                    .verified(true)
                    .active(true)
                    .build();
            return userRepository.save(u);
        });

        govUser = userRepository.findById("usr-gov-officer-21").orElseGet(() -> {
            User u = User.builder()
                    .id("usr-gov-officer-21")
                    .authUserId("auth-gov-officer-21")
                    .email("culture.officer@tourism.gov.in")
                    .fullName("Regional Cultural Tourism Officer")
                    .role(Role.GOVERNMENT)
                    .verified(true)
                    .active(true)
                    .build();
            return userRepository.save(u);
        });

        // 5. Local Hosts
        artisanHost1 = localHostRepository.findById("host-artisan-1").orElseGet(() -> {
            LocalHost h = LocalHost.builder()
                    .id("host-artisan-1")
                    .user(artisanUser1)
                    .name("Ramaniah Master Weaver")
                    .state(apState)
                    .city(tirupatiCity)
                    .destination(srikalahastiDest)
                    .roleTitle("Master Kalamkari Artisan")
                    .pricePerHour(BigDecimal.valueOf(600.0))
                    .rating(BigDecimal.valueOf(4.9))
                    .experienceCount(2)
                    .isVerified(true)
                    .isDemoData(false)
                    .build();
            return localHostRepository.save(h);
        });

        artisanHost2 = localHostRepository.findById("host-artisan-2").orElseGet(() -> {
            LocalHost h = LocalHost.builder()
                    .id("host-artisan-2")
                    .user(artisanUser2)
                    .name("Other Partner Host")
                    .state(rjState)
                    .city(jaipurCity)
                    .destination(jaipurDest)
                    .roleTitle("Heritage Guide")
                    .pricePerHour(BigDecimal.valueOf(500.0))
                    .rating(BigDecimal.valueOf(4.8))
                    .isVerified(true)
                    .isDemoData(false)
                    .build();
            return localHostRepository.save(h);
        });

        // 6. Cultural Tradition
        kalamkariTradition = culturalTraditionRepository.findById("cult-ap-kalamkari-test").orElseGet(() -> {
            CulturalTradition ct = CulturalTradition.builder()
                    .id("cult-ap-kalamkari-test")
                    .state(apState)
                    .city(tirupatiCity)
                    .destination(srikalahastiDest)
                    .traditionName("Srikalahasti Kalamkari")
                    .category("HANDICRAFT")
                    .craftType("Hand-painted Kalamkari with Bamboo Pen")
                    .historicalOrigin("Practiced around Srikalahasti temples using vegetable dyes")
                    .materialsUsed("Tamarind pen, myrobalan mordant, natural mineral pigments")
                    .culturalSignificance("Sacred mythological wall hangings and temple canopies")
                    .isGiTagged(true)
                    .giTagYear("2006")
                    .primaryProducingCluster("Srikalahasti, Tirupati District")
                    .sourceOrganization("Development Commissioner (Handicrafts)")
                    .sourceType(SourceType.OFFICIAL)
                    .sourceUrl("https://handicrafts.nic.in")
                    .isActive(true)
                    .build();
            return culturalTraditionRepository.save(ct);
        });
    }

    @Test
    @Transactional
    @DisplayName("1. Artisan partner creates cultural experience linked to authentic CulturalTradition")
    void testArtisanCreatesCulturalExperience() {
        CreateExperienceRequest request = CreateExperienceRequest.builder()
                .title("Traditional Kalamkari Natural Dye Painting Workshop")
                .description("Hands-on 4-hour workshop learning bamboo pen sketching and vegetable dye application.")
                .category("Craft Workshop")
                .culturalTraditionId(kalamkariTradition.getId())
                .destinationId(srikalahastiDest.getId())
                .cityId(tirupatiCity.getId())
                .durationHours(BigDecimal.valueOf(4.0))
                .pricePerPerson(BigDecimal.valueOf(1200.0))
                .maxGroupSize(6)
                .includedItems(List.of("Natural pigments", "Tamarind pen", "Finished cotton scroll", "Chai"))
                .requirements("No prior painting experience required")
                .languages(List.of("Telugu", "English", "Hindi"))
                .build();

        ExperienceDto created = experienceService.createExperience(artisanUser1.getId(), request);

        assertThat(created).isNotNull();
        assertThat(created.getId()).startsWith("exp-");
        assertThat(created.getCulturalTraditionId()).isEqualTo(kalamkariTradition.getId());
        assertThat(created.getCulturalTraditionName()).isEqualTo("Srikalahasti Kalamkari");
        assertThat(created.getStatus()).isEqualTo(ExperienceStatus.DRAFT.name());
        assertThat(created.getVerificationStatus()).isEqualTo(ExperienceVerificationStatus.UNVERIFIED.name());
        assertThat(created.getIsApproved()).isFalse();
    }

    @Test
    @Transactional
    @DisplayName("2. Linking non-existent CulturalTradition throws IllegalArgumentException")
    void testNonExistentTraditionLinkingFails() {
        CreateExperienceRequest request = CreateExperienceRequest.builder()
                .title("Invalid Tradition Workshop")
                .description("Trying to link to an unknown tradition ID")
                .category("Craft Workshop")
                .culturalTraditionId("cult-fake-non-existent-999")
                .destinationId(srikalahastiDest.getId())
                .durationHours(BigDecimal.valueOf(3.0))
                .pricePerPerson(BigDecimal.valueOf(800.0))
                .build();

        assertThrows(IllegalArgumentException.class, () ->
                experienceService.createExperience(artisanUser1.getId(), request));
    }

    @Test
    @Transactional
    @DisplayName("3. Geographic validation: Rejects mismatched geography (e.g. AP tradition placed in Jaipur, RJ)")
    void testGeographicMismatchRejected() {
        CreateExperienceRequest request = CreateExperienceRequest.builder()
                .title("Mismatched Kalamkari in Jaipur")
                .description("Trying to place Srikalahasti Kalamkari in Jaipur Rajasthan")
                .category("Craft Workshop")
                .culturalTraditionId(kalamkariTradition.getId())
                .destinationId(jaipurDest.getId()) // Mismatched destination in Rajasthan
                .cityId(jaipurCity.getId())
                .durationHours(BigDecimal.valueOf(3.0))
                .pricePerPerson(BigDecimal.valueOf(900.0))
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                experienceService.createExperience(artisanUser1.getId(), request));

        assertThat(ex.getMessage()).contains("Geographic mismatch");
        assertThat(ex.getMessage()).contains("Srikalahasti Kalamkari");
    }

    @Test
    @Transactional
    @DisplayName("4. Geographic validation: Accepts valid matching geography in the tradition's state")
    void testValidGeographyAccepted() {
        CreateExperienceRequest request = CreateExperienceRequest.builder()
                .title("Authentic Kalamkari in Tirupati")
                .description("Artisan workshop located in Tirupati AP")
                .category("Craft Workshop")
                .culturalTraditionId(kalamkariTradition.getId())
                .cityId(tirupatiCity.getId())
                .destinationId(srikalahastiDest.getId())
                .durationHours(BigDecimal.valueOf(3.0))
                .pricePerPerson(BigDecimal.valueOf(950.0))
                .build();

        ExperienceDto dto = experienceService.createExperience(artisanUser1.getId(), request);
        assertThat(dto.getCulturalTraditionId()).isEqualTo(kalamkariTradition.getId());
    }

    @Test
    @Transactional
    @DisplayName("5. Partner can update their own DRAFT experience")
    void testPartnerUpdatesDraftExperience() {
        CreateExperienceRequest createReq = CreateExperienceRequest.builder()
                .title("Initial Draft Title")
                .description("Initial description")
                .category("Craft Workshop")
                .culturalTraditionId(kalamkariTradition.getId())
                .destinationId(srikalahastiDest.getId())
                .cityId(tirupatiCity.getId())
                .durationHours(BigDecimal.valueOf(3.0))
                .pricePerPerson(BigDecimal.valueOf(800.0))
                .build();

        ExperienceDto created = experienceService.createExperience(artisanUser1.getId(), createReq);

        UpdateExperienceRequest updateReq = UpdateExperienceRequest.builder()
                .title("Updated Kalamkari Masterclass Title")
                .pricePerPerson(BigDecimal.valueOf(1100.0))
                .durationHours(BigDecimal.valueOf(4.5))
                .build();

        ExperienceDto updated = experienceService.updateExperience(artisanUser1.getId(), created.getId(), updateReq);

        assertThat(updated.getTitle()).isEqualTo("Updated Kalamkari Masterclass Title");
        assertThat(updated.getPricePerPerson()).isEqualByComparingTo(BigDecimal.valueOf(1100.0));
        assertThat(updated.getDurationHours()).isEqualByComparingTo(BigDecimal.valueOf(4.5));
    }

    @Test
    @Transactional
    @DisplayName("6. Cross-partner modification is strictly blocked with AccessDeniedException")
    void testCrossPartnerModificationForbidden() {
        CreateExperienceRequest createReq = CreateExperienceRequest.builder()
                .title("Artisan 1 Private Listing")
                .description("Created by artisan 1")
                .category("Craft Workshop")
                .durationHours(BigDecimal.valueOf(2.0))
                .pricePerPerson(BigDecimal.valueOf(500.0))
                .build();

        ExperienceDto exp = experienceService.createExperience(artisanUser1.getId(), createReq);

        UpdateExperienceRequest updateReq = UpdateExperienceRequest.builder()
                .title("Malicious modification by partner 2")
                .build();

        // Partner 2 attempts to edit partner 1's experience
        assertThrows(AccessDeniedException.class, () ->
                experienceService.updateExperience(artisanUser2.getId(), exp.getId(), updateReq));

        // Partner 2 attempts to delete partner 1's experience
        assertThrows(AccessDeniedException.class, () ->
                experienceService.deleteExperience(artisanUser2.getId(), exp.getId()));
    }

    @Test
    @Transactional
    @DisplayName("7. Partner submits experience for verification: DRAFT -> SUBMITTED, UNVERIFIED -> PENDING_REVIEW")
    void testPartnerSubmitsExperienceForReview() {
        CreateExperienceRequest createReq = CreateExperienceRequest.builder()
                .title("Kalamkari Pen Workshop")
                .description("Workshop ready for review")
                .category("Craft Workshop")
                .culturalTraditionId(kalamkariTradition.getId())
                .destinationId(srikalahastiDest.getId())
                .cityId(tirupatiCity.getId())
                .durationHours(BigDecimal.valueOf(3.0))
                .pricePerPerson(BigDecimal.valueOf(750.0))
                .build();

        ExperienceDto created = experienceService.createExperience(artisanUser1.getId(), createReq);
        assertThat(created.getStatus()).isEqualTo(ExperienceStatus.DRAFT.name());
        assertThat(created.getVerificationStatus()).isEqualTo(ExperienceVerificationStatus.UNVERIFIED.name());

        ExperienceDto submitted = experienceService.submitExperience(artisanUser1.getId(), created.getId());
        assertThat(submitted.getStatus()).isEqualTo(ExperienceStatus.SUBMITTED.name());
        assertThat(submitted.getVerificationStatus()).isEqualTo(ExperienceVerificationStatus.PENDING_REVIEW.name());
    }

    @Test
    @Transactional
    @DisplayName("8. Government official approves experience: VERIFIED, PUBLISHED, isApproved=true with audit trail")
    void testGovernmentApprovesExperience() {
        CreateExperienceRequest createReq = CreateExperienceRequest.builder()
                .title("Master Kalamkari Studio Immersion")
                .description("Official artisan studio immersion program")
                .category("Craft Workshop")
                .culturalTraditionId(kalamkariTradition.getId())
                .destinationId(srikalahastiDest.getId())
                .cityId(tirupatiCity.getId())
                .durationHours(BigDecimal.valueOf(5.0))
                .pricePerPerson(BigDecimal.valueOf(1500.0))
                .build();

        ExperienceDto created = experienceService.createExperience(artisanUser1.getId(), createReq);
        experienceService.submitExperience(artisanUser1.getId(), created.getId());

        // Government reviews and approves
        ExperienceVerificationRequest verifReq = ExperienceVerificationRequest.builder()
                .decision("APPROVED")
                .verificationNotes("Authentic master artisan pedigree verified via State Handicrafts Board registry.")
                .build();

        ExperienceDto verified = experienceService.verifyExperience(govUser.getId(), created.getId(), verifReq);

        assertThat(verified.getVerificationStatus()).isEqualTo(ExperienceVerificationStatus.VERIFIED.name());
        assertThat(verified.getStatus()).isEqualTo(ExperienceStatus.PUBLISHED.name());
        assertThat(verified.getIsApproved()).isTrue();
        assertThat(verified.getVerifiedBy()).isEqualTo(govUser.getId());
        assertThat(verified.getVerifiedAt()).isNotNull();
        assertThat(verified.getVerificationNotes()).contains("State Handicrafts Board registry");
    }

    @Test
    @Transactional
    @DisplayName("9. Government official rejects experience with reason: REJECTED, isApproved=false")
    void testGovernmentRejectsExperience() {
        CreateExperienceRequest createReq = CreateExperienceRequest.builder()
                .title("Unverified Workshop Claim")
                .description("Incomplete documentation provided")
                .category("Craft Workshop")
                .culturalTraditionId(kalamkariTradition.getId())
                .destinationId(srikalahastiDest.getId())
                .cityId(tirupatiCity.getId())
                .durationHours(BigDecimal.valueOf(2.0))
                .pricePerPerson(BigDecimal.valueOf(500.0))
                .build();

        ExperienceDto created = experienceService.createExperience(artisanUser1.getId(), createReq);
        experienceService.submitExperience(artisanUser1.getId(), created.getId());

        // Government reviews and rejects
        ExperienceVerificationRequest verifReq = ExperienceVerificationRequest.builder()
                .decision("REJECTED")
                .verificationNotes("Insufficient artisan credentials and missing studio safety compliance.")
                .build();

        ExperienceDto rejected = experienceService.verifyExperience(govUser.getId(), created.getId(), verifReq);

        assertThat(rejected.getVerificationStatus()).isEqualTo(ExperienceVerificationStatus.REJECTED.name());
        assertThat(rejected.getStatus()).isEqualTo(ExperienceStatus.REJECTED.name());
        assertThat(rejected.getIsApproved()).isFalse();
        assertThat(rejected.getVerifiedBy()).isEqualTo(govUser.getId());
        assertThat(rejected.getVerificationNotes()).contains("missing studio safety");
    }

    @Test
    @Transactional
    @DisplayName("10. Traveler culture page only exposes VERIFIED experiences, never pending or unverified drafts")
    void testTravelerCulturePageExposesOnlyVerifiedExperiences() {
        // Experience 1: UNVERIFIED Draft
        CreateExperienceRequest draftReq = CreateExperienceRequest.builder()
                .title("Unverified Draft Experience")
                .description("Should not be shown to travelers")
                .category("Craft Workshop")
                .culturalTraditionId(kalamkariTradition.getId())
                .destinationId(srikalahastiDest.getId())
                .cityId(tirupatiCity.getId())
                .durationHours(BigDecimal.valueOf(2.0))
                .pricePerPerson(BigDecimal.valueOf(400.0))
                .build();
        ExperienceDto exp1 = experienceService.createExperience(artisanUser1.getId(), draftReq);

        // Experience 2: SUBMITTED (Pending review)
        CreateExperienceRequest pendingReq = CreateExperienceRequest.builder()
                .title("Pending Review Experience")
                .description("Should not be shown to travelers")
                .category("Craft Workshop")
                .culturalTraditionId(kalamkariTradition.getId())
                .destinationId(srikalahastiDest.getId())
                .cityId(tirupatiCity.getId())
                .durationHours(BigDecimal.valueOf(2.0))
                .pricePerPerson(BigDecimal.valueOf(450.0))
                .build();
        ExperienceDto exp2 = experienceService.createExperience(artisanUser1.getId(), pendingReq);
        experienceService.submitExperience(artisanUser1.getId(), exp2.getId());

        // Experience 3: VERIFIED
        CreateExperienceRequest verifiedReq = CreateExperienceRequest.builder()
                .title("Verified Masterclass Experience")
                .description("Should be shown to travelers")
                .category("Craft Workshop")
                .culturalTraditionId(kalamkariTradition.getId())
                .destinationId(srikalahastiDest.getId())
                .cityId(tirupatiCity.getId())
                .durationHours(BigDecimal.valueOf(3.0))
                .pricePerPerson(BigDecimal.valueOf(850.0))
                .build();
        ExperienceDto exp3 = experienceService.createExperience(artisanUser1.getId(), verifiedReq);
        experienceService.submitExperience(artisanUser1.getId(), exp3.getId());
        experienceService.verifyExperience(govUser.getId(), exp3.getId(),
                ExperienceVerificationRequest.builder().decision("APPROVED").verificationNotes("Verified").build());

        // Query public tradition experiences
        List<ExperienceDto> publicTraditionExps = experienceService.getExperiencesByCulturalTradition(kalamkariTradition.getId());

        assertThat(publicTraditionExps).anyMatch(e -> e.getId().equals(exp3.getId()));
        assertThat(publicTraditionExps).noneMatch(e -> e.getId().equals(exp1.getId()));
        assertThat(publicTraditionExps).noneMatch(e -> e.getId().equals(exp2.getId()));
    }

    @Test
    @Transactional
    @DisplayName("11. Editing a VERIFIED experience resets verification status to UNVERIFIED/DRAFT for security")
    void testEditingVerifiedExperienceResetsVerification() {
        CreateExperienceRequest req = CreateExperienceRequest.builder()
                .title("Original Verified Title")
                .description("Original description")
                .category("Craft Workshop")
                .culturalTraditionId(kalamkariTradition.getId())
                .destinationId(srikalahastiDest.getId())
                .cityId(tirupatiCity.getId())
                .durationHours(BigDecimal.valueOf(3.0))
                .pricePerPerson(BigDecimal.valueOf(900.0))
                .build();

        ExperienceDto created = experienceService.createExperience(artisanUser1.getId(), req);
        experienceService.submitExperience(artisanUser1.getId(), created.getId());
        experienceService.verifyExperience(govUser.getId(), created.getId(),
                ExperienceVerificationRequest.builder().decision("APPROVED").build());

        // Partner modifies title and content
        UpdateExperienceRequest updateReq = UpdateExperienceRequest.builder()
                .title("Substantially Altered Content After Approval")
                .build();

        ExperienceDto updated = experienceService.updateExperience(artisanUser1.getId(), created.getId(), updateReq);

        assertThat(updated.getVerificationStatus()).isEqualTo(ExperienceVerificationStatus.UNVERIFIED.name());
        assertThat(updated.getStatus()).isEqualTo(ExperienceStatus.DRAFT.name());
        assertThat(updated.getIsApproved()).isFalse();
    }

    @Test
    @Transactional
    @DisplayName("12. Backward Compatibility: Standard non-cultural experiences continue working without culturalTraditionId")
    void testStandardNonCulturalExperienceWorks() {
        CreateExperienceRequest standardReq = CreateExperienceRequest.builder()
                .title("Sunset Photography Walk")
                .description("A standard walking and photography tour.")
                .category("Photography")
                .destinationId(srikalahastiDest.getId())
                .cityId(tirupatiCity.getId())
                .durationHours(BigDecimal.valueOf(2.0))
                .pricePerPerson(BigDecimal.valueOf(400.0))
                .culturalTraditionId(null) // Non-cultural
                .build();

        ExperienceDto created = experienceService.createExperience(artisanUser1.getId(), standardReq);

        assertThat(created.getCulturalTraditionId()).isNull();
        assertThat(created.getCulturalTraditionName()).isNull();
        assertThat(created.getCategory()).isEqualTo("Photography");
        assertThat(created.getStatus()).isEqualTo(ExperienceStatus.PUBLISHED.name());
    }
}
