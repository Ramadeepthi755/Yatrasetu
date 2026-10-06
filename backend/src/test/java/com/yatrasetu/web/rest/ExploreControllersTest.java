package com.yatrasetu.web.rest;

import com.yatrasetu.domain.City;
import com.yatrasetu.domain.Destination;
import com.yatrasetu.domain.DestinationPoi;
import com.yatrasetu.domain.Hotel;
import com.yatrasetu.domain.State;
import com.yatrasetu.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ExploreControllersTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private StateRepository stateRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private DestinationPoiRepository poiRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private TravelBuddyRepository travelBuddyRepository;

    @Autowired
    private TravelBuddyRequestRepository travelBuddyRequestRepository;

    private State kerala;
    private City munnarCity;
    private Destination munnarDest;

    @BeforeEach
    void setUp() {
        travelBuddyRequestRepository.deleteAll();
        travelBuddyRepository.deleteAll();
        poiRepository.deleteAll();
        hotelRepository.deleteAll();
        destinationRepository.deleteAll();
        cityRepository.deleteAll();
        stateRepository.deleteAll();

        kerala = stateRepository.save(State.builder()
                .id("IN-KL")
                .stateName("Kerala")
                .region("South India")
                .capitalCity("Thiruvananthapuram")
                .description("God's Own Country")
                .bannerImageUrl("https://images.unsplash.com/photo-kerala")
                .build());

        munnarCity = cityRepository.save(City.builder()
                .id("munnar")
                .cityName("Munnar")
                .state(kerala)
                .districtName("Idukki")
                .latitude(BigDecimal.valueOf(10.0889))
                .longitude(BigDecimal.valueOf(77.0595))
                .tier("Tier-2")
                .isTourismHub(true)
                .build());

        munnarDest = destinationRepository.save(Destination.builder()
                .id("dest-munnar")
                .destinationName("Munnar Hills")
                .state(kerala)
                .city(munnarCity)
                .district("Idukki")
                .region("South India")
                .latitude(BigDecimal.valueOf(10.0889))
                .longitude(BigDecimal.valueOf(77.0595))
                .popularityScore(BigDecimal.valueOf(9.2))
                .tripTypes(List.of("Nature", "Tea Gardens", "Trekking"))
                .bestSeasons("Winter | Post-Monsoon")
                .description("Scenic rolling hills and misty tea plantations.")
                .budgetRangeJson("{\"total_daily_range\": [1500, 3000]}")
                .hiddenGems("Kolukkumalai Sunrise Point")
                .build());

        poiRepository.save(DestinationPoi.builder()
                .id("poi-1")
                .poiName("Munnar Tea Museum")
                .destination(munnarDest)
                .city(munnarCity)
                .category("Museum")
                .latitude(BigDecimal.valueOf(10.0942))
                .longitude(BigDecimal.valueOf(77.0504))
                .tags(List.of("tea", "heritage"))
                .build());

        hotelRepository.save(Hotel.builder()
                .id("hotel-1")
                .hotelName("Munnar Tea Valley Resort")
                .destination(munnarDest)
                .city(munnarCity)
                .hotelRating(BigDecimal.valueOf(4.5))
                .pricePerNight(BigDecimal.valueOf(3500.0))
                .amenities(List.of("Free Wi-Fi", "Mountain View", "Restaurant"))
                .category("Mid-Range")
                .latitude(BigDecimal.valueOf(10.0800))
                .longitude(BigDecimal.valueOf(77.0500))
                .build());
        Destination kovalamDest = destinationRepository.save(Destination.builder()
                .id("dest-kovalam")
                .destinationName("Kovalam Beach")
                .state(kerala)
                .city(munnarCity)
                .district("Thiruvananthapuram")
                .region("South India")
                .latitude(BigDecimal.valueOf(8.4020))
                .longitude(BigDecimal.valueOf(76.9787))
                .popularityScore(BigDecimal.valueOf(8.8))
                .tripTypes(List.of("Beach", "Coastal", "Relaxation"))
                .primaryAttractions(List.of("Lighthouse Beach", "Hawah Beach", "Samudra Beach"))
                .activitiesAvailable(List.of("Beach walking", "Surfing", "Catamaran cruising"))
                .description("Iconic crescent beaches with scenic lighthouse views.")
                .build());

        Destination tirupatiDest = destinationRepository.save(Destination.builder()
                .id("dest-tirupati")
                .destinationName("Tirupati")
                .state(kerala)
                .city(munnarCity)
                .district("Tirupati")
                .region("South India")
                .latitude(BigDecimal.valueOf(13.6288))
                .longitude(BigDecimal.valueOf(79.4192))
                .popularityScore(BigDecimal.valueOf(9.5))
                .tripTypes(List.of("Pilgrimage", "Spiritual", "Heritage", "Family"))
                .primaryAttractions(List.of("Sri Venkateswara Swamy Temple (Tirumala)", "Chandragiri Fort"))
                .activitiesAvailable(List.of("Temple darshan", "Exploring fort ramparts"))
                .localCuisineMustTry("Tirupati Laddu, Temple Pulihora")
                .description("Venerated pilgrimage destination situated in the holy Seshachalam hills.")
                .build());

        Destination hampiDest = destinationRepository.save(Destination.builder()
                .id("dest-hampi")
                .destinationName("Hampi")
                .state(kerala)
                .city(munnarCity)
                .district("Vijayanagara")
                .region("South India")
                .latitude(BigDecimal.valueOf(15.3350))
                .longitude(BigDecimal.valueOf(76.4600))
                .popularityScore(BigDecimal.valueOf(9.4))
                .tripTypes(List.of("UNESCO", "Heritage", "Architecture", "Cultural"))
                .primaryAttractions(List.of("Virupaksha Temple", "Vijaya Vittala Temple", "Lotus Mahal"))
                .activitiesAvailable(List.of("Heritage walking", "Bouldering", "Coracle ride"))
                .localCulture("Rich Vijayanagara classical heritage and local artisan crafts.")
                .description("UNESCO World Heritage site with magnificent open-air ruins of the Vijayanagara Empire.")
                .build());

        Destination rishikeshDest = destinationRepository.save(Destination.builder()
                .id("dest-rishikesh")
                .destinationName("Rishikesh")
                .state(kerala)
                .city(munnarCity)
                .district("Dehradun")
                .region("North India")
                .latitude(BigDecimal.valueOf(30.0869))
                .longitude(BigDecimal.valueOf(78.2676))
                .popularityScore(BigDecimal.valueOf(9.1))
                .tripTypes(List.of("Adventure", "Spiritual", "River_rafting"))
                .primaryAttractions(List.of("Triveni Ghat", "Laxman Jhula", "White Water Rafting Rapids"))
                .activitiesAvailable(List.of("White water river rafting", "Bungee jumping", "Ganga aarti"))
                .description("Adventure and spiritual hub nestled in the foothills of the Himalayas.")
                .build());

        Destination chettinadDest = destinationRepository.save(Destination.builder()
                .id("dest-chettinad")
                .destinationName("Chettinad")
                .state(kerala)
                .city(munnarCity)
                .district("Sivaganga")
                .region("South India")
                .latitude(BigDecimal.valueOf(10.1700))
                .longitude(BigDecimal.valueOf(78.7800))
                .popularityScore(BigDecimal.valueOf(8.5))
                .tripTypes(List.of("Heritage", "Culinary", "Cultural"))
                .primaryAttractions(List.of("Chettinad Mansions", "Athangudi Tile Factories", "Heritage Food Walk"))
                .activitiesAvailable(List.of("Chettinad culinary workshop", "Mansion tours", "Tile crafting"))
                .foodScene("World-famous spicy Chettinad non-vegetarian and vegetarian culinary heritage.")
                .localCuisineMustTry("Chettinad Chicken, Kuzhi Paniyaram, Vellai Paniyaram")
                .description("Historic region famed for lavish 19th-century mansions and legendary spicy cuisine.")
                .build());
    }

    @Test
    void testGetAllStates_PublicAccess() throws Exception {
        mockMvc.perform(get("/api/v1/states")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].stateName").value("Kerala"))
                .andExpect(jsonPath("$.data[0].destinationCount").value(6));
    }

    @Test
    void testGetDestinations_CategoryBeaches_FiltersCorrectly() throws Exception {
        mockMvc.perform(get("/api/v1/destinations")
                        .param("category", "Beaches")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].destinationName").value("Kovalam Beach"));
    }

    @Test
    void testGetDestinations_CategoryHeritage_FiltersCorrectly() throws Exception {
        mockMvc.perform(get("/api/v1/destinations")
                        .param("category", "Heritage")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[*].destinationName", hasItems("Tirupati", "Hampi", "Chettinad")))
                .andExpect(jsonPath("$.data.content[*].destinationName", not(hasItem("Kovalam Beach"))));
    }

    @Test
    void testGetDestinations_CategoryTemples_FiltersCorrectly() throws Exception {
        mockMvc.perform(get("/api/v1/destinations")
                        .param("category", "Temples")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[*].destinationName", hasItems("Tirupati", "Rishikesh", "Hampi")))
                .andExpect(jsonPath("$.data.content[*].destinationName", not(hasItem("Kovalam Beach"))));
    }

    @Test
    void testGetDestinations_CategoryCulture_FiltersCorrectly() throws Exception {
        mockMvc.perform(get("/api/v1/destinations")
                        .param("category", "Culture")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[*].destinationName", hasItems("Hampi", "Chettinad")))
                .andExpect(jsonPath("$.data.content[*].destinationName", not(hasItem("Kovalam Beach"))));
    }

    @Test
    void testGetDestinations_CategoryAdventure_FiltersCorrectly() throws Exception {
        mockMvc.perform(get("/api/v1/destinations")
                        .param("category", "Adventure")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[*].destinationName", hasItem("Rishikesh")))
                .andExpect(jsonPath("$.data.content[*].destinationName", not(hasItem("Tirupati"))));
    }

    @Test
    void testGetDestinations_CategoryFood_FiltersCorrectly() throws Exception {
        mockMvc.perform(get("/api/v1/destinations")
                        .param("category", "Food")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[*].destinationName", hasItem("Chettinad")))
                .andExpect(jsonPath("$.data.content[*].destinationName", not(hasItem("Kovalam Beach"))));
    }

    @Test
    void testGetDestinations_DestinationPlusCategory_TirupatiHeritage() throws Exception {
        mockMvc.perform(get("/api/v1/destinations")
                        .param("search", "Tirupati")
                        .param("category", "Heritage")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].destinationName").value("Tirupati"));
    }

    @Test
    void testGetDestinations_DestinationPlusCategory_TirupatiBeaches_EmptyResult() throws Exception {
        mockMvc.perform(get("/api/v1/destinations")
                        .param("search", "Tirupati")
                        .param("category", "Beaches")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(0)))
                .andExpect(jsonPath("$.data.totalElements").value(0));
    }

    @Test
    void testGetDestinations_ClearFilter_ReturnsAll() throws Exception {
        mockMvc.perform(get("/api/v1/destinations")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(6)))
                .andExpect(jsonPath("$.data.totalElements").value(6));
    }

    @Test
    void testGetDestinations_WithFilters() throws Exception {
        mockMvc.perform(get("/api/v1/destinations")
                        .param("stateId", "IN-KL")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(6)));
    }

    @Test
    void testGetDestinationDetail_Success() throws Exception {
        mockMvc.perform(get("/api/v1/destinations/dest-munnar")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.destinationName").value("Munnar Hills"))
                .andExpect(jsonPath("$.data.topPois", hasSize(1)))
                .andExpect(jsonPath("$.data.nearbyHotels", hasSize(1)));
    }

    @Test
    void testSearch_PublicAccess() throws Exception {
        mockMvc.perform(get("/api/v1/search")
                        .param("q", "munnar")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.destinations", hasSize(1)))
                .andExpect(jsonPath("$.data.cities", hasSize(1)));
    }

    @Test
    void testDiscoveryNearby() throws Exception {
        mockMvc.perform(get("/api/v1/discovery/nearby")
                        .param("lat", "10.0889")
                        .param("lng", "77.0595")
                        .param("radiusKm", "50")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.nearbyDestinations", hasSize(1)))
                .andExpect(jsonPath("$.data.nearbyCities", hasSize(1)));
    }
}
