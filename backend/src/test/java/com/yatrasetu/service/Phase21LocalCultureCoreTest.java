package com.yatrasetu.service;

import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.CulturalTraditionDto;
import com.yatrasetu.web.dto.ExperienceDto;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class Phase21LocalCultureCoreTest {

    @Autowired
    private CulturalTraditionRepository culturalTraditionRepository;

    @Autowired
    private CulturalTraditionService culturalTraditionService;

    @Autowired
    private StateRepository stateRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private ExperienceRepository experienceRepository;

    @Autowired
    private LocalHostRepository localHostRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestRestTemplate restTemplate;

    private State testState;
    private City testCity;
    private Destination testDest;
    private LocalHost testHost;

    @BeforeEach
    void setUp() {
        culturalTraditionRepository.deleteAll();

        testState = stateRepository.findById("state-ap-test").orElseGet(() -> {
            State s = State.builder()
                    .id("state-ap-test")
                    .stateName("Andhra Pradesh Test")
                    .region("South India")
                    .build();
            return stateRepository.save(s);
        });

        testCity = cityRepository.findById("city-tirupati-test").orElseGet(() -> {
            City c = City.builder()
                    .id("city-tirupati-test")
                    .cityName("Tirupati Test")
                    .state(testState)
                    .latitude(BigDecimal.valueOf(13.6288))
                    .longitude(BigDecimal.valueOf(79.4192))
                    .tier("Tier 2")
                    .build();
            return cityRepository.save(c);
        });

        testDest = destinationRepository.findById("dest-srikalahasti-test").orElseGet(() -> {
            Destination d = Destination.builder()
                    .id("dest-srikalahasti-test")
                    .destinationName("Srikalahasti Heritage Cluster")
                    .state(testState)
                    .city(testCity)
                    .latitude(BigDecimal.valueOf(13.7498))
                    .longitude(BigDecimal.valueOf(79.6984))
                    .popularityScore(BigDecimal.valueOf(75.0))
                    .isActive(true)
                    .build();
            return destinationRepository.save(d);
        });

        testHost = localHostRepository.findById("host-artisan-test").orElseGet(() -> {
            User user = userRepository.findById("user-artisan-test").orElseGet(() -> {
                User u = User.builder()
                        .id("user-artisan-test")
                        .authUserId("auth-artisan-test")
                        .email("artisan@yatrasetu.in")
                        .fullName("Master Craftsman")
                        .role(Role.PARTNER)
                        .partnerSubtype(PartnerSubtype.ARTISAN)
                        .verified(true)
                        .active(true)
                        .build();
                return userRepository.save(u);
            });

            LocalHost h = LocalHost.builder()
                    .id("host-artisan-test")
                    .user(user)
                    .name("Master Craftsman")
                    .state(testState)
                    .city(testCity)
                    .destination(testDest)
                    .roleTitle("Master Artisan")
                    .pricePerHour(BigDecimal.valueOf(400.0))
                    .isVerified(true)
                    .build();
            return localHostRepository.save(h);
        });
    }

    @AfterEach
    void tearDown() {
        culturalTraditionRepository.deleteAll();
        localHostRepository.deleteAll();
        userRepository.findById("user-artisan-test").ifPresent(userRepository::delete);
    }

    @Test
    @Transactional
    @DisplayName("1. CulturalTradition entity persistence and null city/destination support")
    void testCulturalTraditionEntityPersistence() {
        CulturalTradition tradition = CulturalTradition.builder()
                .id("cult-test-state-level")
                .state(testState)
                .city(null) // State-level craft without single city
                .destination(null) // No single tourist destination
                .traditionName("Test State Heritage Craft")
                .category("HANDICRAFT")
                .craftType("Wood Carving")
                .historicalOrigin("Practiced for centuries across the region")
                .materialsUsed("Indigenous timber, organic polish")
                .culturalSignificance("Sacred motifs and festive ornamentation")
                .isGiTagged(true)
                .giTagYear("2010")
                .primaryProducingCluster("Regional Artisan Cluster")
                .sourceOrganization("DC (Handicrafts)")
                .sourceType(SourceType.OFFICIAL)
                .sourceUrl("https://handicrafts.nic.in")
                .isActive(true)
                .build();

        CulturalTradition saved = culturalTraditionRepository.save(tradition);
        assertThat(saved.getId()).isEqualTo("cult-test-state-level");
        assertThat(saved.getCity()).isNull();
        assertThat(saved.getDestination()).isNull();
        assertThat(saved.getIsGiTagged()).isTrue();
        assertThat(saved.getGiTagYear()).isEqualTo("2010");
        assertThat(saved.getSourceType()).isEqualTo(SourceType.OFFICIAL);

        // Fetch back
        Optional<CulturalTradition> fetched = culturalTraditionRepository.findById("cult-test-state-level");
        assertThat(fetched).isPresent();
        assertThat(fetched.get().getTraditionName()).isEqualTo("Test State Heritage Craft");
    }

    @Test
    @Transactional
    @DisplayName("2. Destination-level CulturalTradition persistence and repository queries")
    void testDestinationLevelCulturalTraditionQueries() {
        CulturalTradition tradition = CulturalTradition.builder()
                .id("cult-test-dest-level")
                .state(testState)
                .city(testCity)
                .destination(testDest)
                .traditionName("Destination Specific Art")
                .category("FOLK_ART")
                .craftType("Mineral Pigment Painting")
                .isGiTagged(false)
                .sourceType(SourceType.DATASET)
                .isActive(true)
                .build();

        culturalTraditionRepository.save(tradition);

        // Query by destination
        List<CulturalTradition> destTraditions = culturalTraditionRepository.findByDestinationIdAndIsActiveTrue(testDest.getId());
        assertThat(destTraditions).anyMatch(t -> t.getId().equals("cult-test-dest-level"));

        // Query by state
        List<CulturalTradition> stateTraditions = culturalTraditionRepository.findByStateIdAndIsActiveTrue(testState.getId());
        assertThat(stateTraditions).anyMatch(t -> t.getId().equals("cult-test-dest-level"));

        // Query with filters
        Page<CulturalTradition> filtered = culturalTraditionRepository.findWithFilters(
                testState.getId(),
                null,
                testDest.getId(),
                "FOLK_ART",
                "Mineral",
                PageRequest.of(0, 10)
        );
        assertThat(filtered.getTotalElements()).isGreaterThanOrEqualTo(1);

        // Service layer DTO conversion
        CulturalTraditionDto dto = culturalTraditionService.getTraditionById("cult-test-dest-level");
        assertThat(dto.getDestinationId()).isEqualTo(testDest.getId());
        assertThat(dto.getStateId()).isEqualTo(testState.getId());
        assertThat(dto.getCategory()).isEqualTo("FOLK_ART");
    }

    @Test
    @Transactional
    @DisplayName("3. Experience with optional culturalTradition relationship and backward compatibility")
    void testExperienceWithNullAndLinkedCulturalTradition() {
        // 3a. Experience with NULL culturalTradition (Backward Compatibility)
        Experience standardExp = Experience.builder()
                .id("exp-test-non-cultural")
                .host(testHost)
                .title("Standard Heritage Walking Tour")
                .description("A standard historical walking tour")
                .category("Heritage Tour")
                .durationHours(BigDecimal.valueOf(2.5))
                .pricePerPerson(BigDecimal.valueOf(500.0))
                .culturalTradition(null) // Strictly null
                .build();

        Experience savedStandard = experienceRepository.save(standardExp);
        assertThat(savedStandard.getCulturalTradition()).isNull();

        Optional<Experience> fetchedStandard = experienceRepository.findById("exp-test-non-cultural");
        assertThat(fetchedStandard).isPresent();
        assertThat(fetchedStandard.get().getCulturalTradition()).isNull();

        // 3b. Experience linked to a CulturalTradition
        CulturalTradition tradition = CulturalTradition.builder()
                .id("cult-test-for-exp")
                .state(testState)
                .traditionName("Master Pottery Workshop Tradition")
                .category("POTTERY")
                .sourceType(SourceType.OFFICIAL)
                .build();
        culturalTraditionRepository.save(tradition);

        Experience culturalExp = Experience.builder()
                .id("exp-test-cultural-workshop")
                .host(testHost)
                .title("Traditional Clay Wheel Masterclass")
                .description("Learn wheel spinning and terracotta pottery from master craftsman")
                .category("Craft Workshop")
                .durationHours(BigDecimal.valueOf(3.0))
                .pricePerPerson(BigDecimal.valueOf(900.0))
                .culturalTradition(tradition)
                .build();

        Experience savedCultural = experienceRepository.save(culturalExp);
        assertThat(savedCultural.getCulturalTradition()).isNotNull();
        assertThat(savedCultural.getCulturalTradition().getId()).isEqualTo("cult-test-for-exp");

        // Cleanup
        experienceRepository.delete(savedCultural);
        experienceRepository.delete(savedStandard);
    }

    @Test
    @DisplayName("4. Public REST API endpoint GET /api/v1/culture/traditions is publicly accessible")
    void testPublicCultureApiEndpoints() {
        // Public call without Auth token (Guest / Traveler / Partner / Government)
        ResponseEntity<ApiResponse<PageResponseWrapper<CulturalTraditionDto>>> response = restTemplate.exchange(
                "/api/v1/culture/traditions?page=0&size=10",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {}
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();

        // GET categories endpoint
        ResponseEntity<ApiResponse<List<String>>> catResponse = restTemplate.exchange(
                "/api/v1/culture/categories",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {}
        );
        assertThat(catResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(catResponse.getBody()).isNotNull();
        assertThat(catResponse.getBody().isSuccess()).isTrue();

        // GET tradition experiences endpoint
        ResponseEntity<ApiResponse<List<ExperienceDto>>> expResponse = restTemplate.exchange(
                "/api/v1/culture/traditions/cult-test-dest-level/experiences",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {}
        );
        assertThat(expResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(expResponse.getBody()).isNotNull();
        assertThat(expResponse.getBody().isSuccess()).isTrue();
    }

    @Test
    @DisplayName("5. Non-existent cultural tradition ID returns 404 Not Found")
    void testNonExistentTraditionReturns404() {
        ResponseEntity<ApiResponse<CulturalTraditionDto>> response = restTemplate.exchange(
                "/api/v1/culture/traditions/cult-non-existent-9999",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {}
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
    }

    @Test
    @Transactional
    @DisplayName("6. State, category, search, and pagination filtering")
    void testFilteringAndSearch() {
        CulturalTradition t1 = CulturalTradition.builder()
                .id("cult-filter-1")
                .state(testState)
                .traditionName("Kalamkari Textile Painting")
                .category("HANDICRAFT")
                .craftType("Pen Painting")
                .isGiTagged(true)
                .giTagYear("2006")
                .sourceType(SourceType.OFFICIAL)
                .sourceOrganization("DC (Handicrafts)")
                .sourceUrl("https://handicrafts.nic.in")
                .isActive(true)
                .build();

        CulturalTradition t2 = CulturalTradition.builder()
                .id("cult-filter-2")
                .state(testState)
                .traditionName("Kondapalli Softwood Toys")
                .category("WOOD_CRAFT")
                .craftType("Tella Poniki Carving")
                .isGiTagged(true)
                .giTagYear("2006")
                .sourceType(SourceType.OFFICIAL)
                .sourceOrganization("DC (Handicrafts)")
                .sourceUrl("https://handicrafts.nic.in")
                .isActive(true)
                .build();

        culturalTraditionRepository.save(t1);
        culturalTraditionRepository.save(t2);

        // Search by category
        Page<CulturalTraditionDto> handicrafts = culturalTraditionService.getAllTraditions(
                testState.getId(), null, null, "HANDICRAFT", null, PageRequest.of(0, 10)
        );
        assertThat(handicrafts.getContent()).hasSize(1);
        assertThat(handicrafts.getContent().get(0).getId()).isEqualTo("cult-filter-1");

        // Search by keyword
        Page<CulturalTraditionDto> searched = culturalTraditionService.getAllTraditions(
                null, null, null, null, "Softwood", PageRequest.of(0, 10)
        );
        assertThat(searched.getContent()).hasSize(1);
        assertThat(searched.getContent().get(0).getId()).isEqualTo("cult-filter-2");
    }

    @Test
    @Transactional
    @DisplayName("7. Inactive records are excluded from active state queries")
    void testInactiveRecordsExcluded() {
        CulturalTradition inactive = CulturalTradition.builder()
                .id("cult-inactive-test")
                .state(testState)
                .traditionName("Obsolete Craft")
                .category("OTHER")
                .sourceType(SourceType.OFFICIAL)
                .isActive(false) // Inactive
                .build();
        culturalTraditionRepository.save(inactive);

        List<CulturalTraditionDto> byState = culturalTraditionService.getTraditionsByState(testState.getId());
        assertThat(byState).noneMatch(t -> t.getId().equals("cult-inactive-test"));

        // Direct fetch on non-existent throws ResourceNotFoundException
        org.junit.jupiter.api.Assertions.assertThrows(
                com.yatrasetu.config.ResourceNotFoundException.class,
                () -> culturalTraditionService.getTraditionById("cult-non-existent-id")
        );
    }

    @Test
    @DisplayName("8. V17 migration SQL data integrity verification")
    void testV17MigrationSqlDataIntegrity() throws Exception {
        java.nio.file.Path v17Path = java.nio.file.Paths.get("src/main/resources/db/migration/V17__seed_verified_cultural_traditions.sql");
        assertThat(java.nio.file.Files.exists(v17Path)).isTrue();

        String content = java.nio.file.Files.readString(v17Path);
        assertThat(content).contains("INSERT INTO cultural_traditions");
        
        // Count records inserted
        int insertCount = 0;
        int index = 0;
        while ((index = content.indexOf("INSERT INTO cultural_traditions", index)) != -1) {
            insertCount++;
            index += "INSERT INTO cultural_traditions".length();
        }
        assertThat(insertCount).isGreaterThanOrEqualTo(75);

        // Verify official provenance
        assertThat(content).contains("'OFFICIAL'");
        assertThat(content).doesNotContain("'SCRAPED'");
        assertThat(content).doesNotContain("'UNVERIFIED'");

        // Verify key states present
        assertThat(content).contains("'IN-AP'");
        assertThat(content).contains("'IN-TG'");
        assertThat(content).contains("'IN-KA'");
        assertThat(content).contains("'IN-TN'");
        assertThat(content).contains("'IN-KL'");
        assertThat(content).contains("'IN-RJ'");
        assertThat(content).contains("'IN-WB'");
        assertThat(content).contains("'IN-OD'");
        assertThat(content).contains("'IN-MP'");
        assertThat(content).contains("'IN-UP'");
        assertThat(content).contains("'IN-GJ'");
        assertThat(content).contains("'IN-BR'");
        assertThat(content).contains("'IN-JK'");
        assertThat(content).contains("'IN-LA'");
        assertThat(content).contains("'IN-AS'");
    }

    // Static helper wrapper for Spring Data Page deserialization in TestRestTemplate
    public static class PageResponseWrapper<T> {
        private List<T> content;
        private int number;
        private int size;
        private long totalElements;
        private int totalPages;

        public List<T> getContent() { return content; }
        public void setContent(List<T> content) { this.content = content; }
        public int getNumber() { return number; }
        public void setNumber(int number) { this.number = number; }
        public int getSize() { return size; }
        public void setSize(int size) { this.size = size; }
        public long getTotalElements() { return totalElements; }
        public void setTotalElements(long totalElements) { this.totalElements = totalElements; }
        public int getTotalPages() { return totalPages; }
        public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
    }
}
