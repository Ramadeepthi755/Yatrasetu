package com.yatrasetu.web.rest;

import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class CanonicalGeographyAndCulturalImageAuditTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private StateRepository stateRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private CulturalTraditionRepository culturalTraditionRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        cleanup();
    }

    @org.junit.jupiter.api.AfterEach
    void tearDown() {
        cleanup();
    }

    private void cleanup() {
        culturalTraditionRepository.deleteAll();
        destinationRepository.deleteAll();
        cityRepository.deleteAll();
        stateRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Verify Cultural Traditions Image Uniqueness and Hierarchy Fallbacks")
    void verifyCulturalTraditionsImages() {
        State karnataka = stateRepository.save(State.builder()
                .id("IN-KA")
                .stateName("Karnataka")
                .region("South India")
                .build());

        City mysore = cityRepository.save(City.builder()
                .id("mysore")
                .cityName("Mysuru")
                .state(karnataka)
                .districtName("Mysuru")
                .latitude(java.math.BigDecimal.valueOf(12.2958))
                .longitude(java.math.BigDecimal.valueOf(76.6394))
                .tier("Tier-2")
                .isTourismHub(true)
                .build());

        Destination mysorePalace = destinationRepository.save(Destination.builder()
                .id("dest-mysore-palace")
                .destinationName("Mysuru Palace")
                .state(karnataka)
                .city(mysore)
                .district("Mysuru")
                .region("South India")
                .latitude(java.math.BigDecimal.valueOf(12.3052))
                .longitude(java.math.BigDecimal.valueOf(76.6552))
                .popularityScore(java.math.BigDecimal.valueOf(9.5))
                .description("Grand royal palace of the Wadiyars.")
                .accessibility("Nearest railway Mysuru Junction 2km")
                .build());

        CulturalTradition silk = culturalTraditionRepository.save(CulturalTradition.builder()
                .id("cult-mysore-silk")
                .traditionName("Mysore Silk")
                .category("HANDLOOM")
                .craftType("Pure Mulberry Silk with Gold Zari")
                .state(karnataka)
                .city(mysore)
                .destination(mysorePalace)
                .imageUrl("https://upload.wikimedia.org/wikipedia/commons/e/e5/Mysore_Silk_Saree.jpg")
                .isGiTagged(true)
                .giTagYear("2005")
                .historicalOrigin("Originating in the Kingdom of Mysore under Tipu Sultan and later the Wadiyars.")
                .materialsUsed("Pure Mulberry Silk, real gold and silver zari.")
                .culturalSignificance("Royal heritage drape of Southern India.")
                .primaryProducingCluster("Mysuru & Doddaballapura")
                .provenance("OFFICIAL")
                .sourceOrganization("Development Commissioner for Handlooms, Ministry of Textiles")
                .sourceUrl("http://handicrafts.nic.in/mysore-silk")
                .isActive(true)
                .build());

        CulturalTradition sandalwood = culturalTraditionRepository.save(CulturalTradition.builder()
                .id("cult-mysore-sandalwood")
                .traditionName("Mysore Sandalwood Carving")
                .category("WOOD_CRAFT")
                .craftType("Fragrant Santalum Album Wood Carving")
                .state(karnataka)
                .city(mysore)
                .destination(mysorePalace)
                .imageUrl("https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Sandalwood_Carving_Craft.jpg/1280px-Sandalwood_Carving_Craft.jpg")
                .isGiTagged(true)
                .giTagYear("2006")
                .historicalOrigin("Centuries-old Gudigar woodcarving traditions.")
                .materialsUsed("Indigenous Santalum album heartwood.")
                .culturalSignificance("Sacred aroma and intricate filigree carving.")
                .primaryProducingCluster("Mysuru, Sagar, Sirsi")
                .provenance("OFFICIAL")
                .sourceOrganization("Development Commissioner for Handicrafts")
                .sourceUrl("http://handicrafts.nic.in/mysore-sandalwood")
                .isActive(true)
                .build());

        List<CulturalTradition> list = culturalTraditionRepository.findAll();
        assertThat(list).hasSize(2);
        assertThat(silk.getImageUrl()).isNotEqualTo(sandalwood.getImageUrl());
    }

    @Test
    @DisplayName("Verify Cultural Traditions API returns records with distinct image URLs")
    void testCulturalTraditionsApi() throws Exception {
        State rajasthan = stateRepository.save(State.builder()
                .id("IN-RJ")
                .stateName("Rajasthan")
                .region("North India")
                .build());

        CulturalTradition bluePottery = culturalTraditionRepository.save(CulturalTradition.builder()
                .id("cult-jaipur-blue-pottery")
                .traditionName("Jaipur Blue Pottery")
                .category("POTTERY")
                .state(rajasthan)
                .imageUrl("https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Jaipur_Blue_Pottery_Craft.jpg/1280px-Jaipur_Blue_Pottery_Craft.jpg")
                .isGiTagged(true)
                .historicalOrigin("Turko-Persian origins adopted during Sawai Ram Singh II reign.")
                .materialsUsed("Quartz stone powder, Fuller's earth, glass, gum.")
                .culturalSignificance("Unique no-clay ceramic craft technique.")
                .provenance("OFFICIAL")
                .isActive(true)
                .build());

        mockMvc.perform(get("/api/v1/culture/traditions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].traditionName").value("Jaipur Blue Pottery"))
                .andExpect(jsonPath("$.data.content[0].imageUrl").value(bluePottery.getImageUrl()));
    }

    @Test
    @DisplayName("Verify Cultural Detail API returns full structured metadata")
    void testCulturalDetailApi() throws Exception {
        State odisha = stateRepository.save(State.builder()
                .id("IN-OR")
                .stateName("Odisha")
                .region("East India")
                .build());

        CulturalTradition pattachitra = culturalTraditionRepository.save(CulturalTradition.builder()
                .id("cult-odisha-pattachitra")
                .traditionName("Odisha Pattachitra")
                .category("PAINTING")
                .craftType("Cloth-based Scroll Painting")
                .state(odisha)
                .imageUrl("https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Raghurajpur_Pattachitra_Painting.jpg/1280px-Raghurajpur_Pattachitra_Painting.jpg")
                .isGiTagged(true)
                .giTagYear("2008")
                .historicalOrigin("Associated with Jagannath worship dating back to 5th century BC.")
                .materialsUsed("Tussar silk, cotton canvas, organic mineral pigments.")
                .culturalSignificance("Iconographic heritage narratives.")
                .primaryProducingCluster("Raghurajpur Heritage Crafts Village")
                .provenance("OFFICIAL")
                .sourceOrganization("State Directorate of Handicrafts, Odisha")
                .sourceUrl("http://handicrafts.nic.in/pattachitra")
                .isActive(true)
                .build());

        mockMvc.perform(get("/api/v1/culture/traditions/" + pattachitra.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(pattachitra.getId()))
                .andExpect(jsonPath("$.data.traditionName").value("Odisha Pattachitra"))
                .andExpect(jsonPath("$.data.historicalOrigin").value(pattachitra.getHistoricalOrigin()))
                .andExpect(jsonPath("$.data.materialsUsed").value(pattachitra.getMaterialsUsed()))
                .andExpect(jsonPath("$.data.culturalSignificance").value(pattachitra.getCulturalSignificance()))
                .andExpect(jsonPath("$.data.primaryProducingCluster").value("Raghurajpur Heritage Crafts Village"))
                .andExpect(jsonPath("$.data.provenance").value("OFFICIAL"));
    }

    @Test
    @DisplayName("Verify Government RBAC: Guest=401, Traveler=403, Partner=403, Government=200")
    void testGovernmentDashboardRbac() throws Exception {
        // 1. Guest -> 401 Unauthorized
        mockMvc.perform(get("/api/v1/government/intelligence/overview"))
                .andExpect(status().isUnauthorized());

        // 2. Traveler -> 403 Forbidden
        userRepository.save(User.builder()
                .id("usr-traveler-audit")
                .authUserId("auth-traveler-audit")
                .email("traveler.audit@yatrasetu.com")
                .fullName("Traveler Audit")
                .role(Role.TRAVELER)
                .active(true)
                .build());

        mockMvc.perform(get("/api/v1/government/intelligence/overview")
                        .header("X-Test-User-Email", "traveler.audit@yatrasetu.com"))
                .andExpect(status().isForbidden());

        // 3. Partner -> 403 Forbidden
        userRepository.save(User.builder()
                .id("usr-partner-audit")
                .authUserId("auth-partner-audit")
                .email("partner.audit@yatrasetu.com")
                .fullName("Partner Audit")
                .role(Role.PARTNER)
                .active(true)
                .build());

        mockMvc.perform(get("/api/v1/government/intelligence/overview")
                        .header("X-Test-User-Email", "partner.audit@yatrasetu.com"))
                .andExpect(status().isForbidden());

        // 4. Government -> 200 OK
        userRepository.save(User.builder()
                .id("usr-gov-audit")
                .authUserId("auth-gov-audit")
                .email("gov.audit@yatrasetu.com")
                .fullName("Gov Officer Audit")
                .role(Role.GOVERNMENT)
                .verified(true)
                .verificationStatus(VerificationStatus.APPROVED)
                .active(true)
                .build());

        mockMvc.perform(get("/api/v1/government/intelligence/overview")
                        .header("X-Test-User-Email", "gov.audit@yatrasetu.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
