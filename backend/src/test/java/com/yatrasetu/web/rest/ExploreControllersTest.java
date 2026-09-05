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
    }

    @Test
    void testGetAllStates_PublicAccess() throws Exception {
        mockMvc.perform(get("/api/v1/states")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].stateName").value("Kerala"))
                .andExpect(jsonPath("$.data[0].destinationCount").value(1));
    }

    @Test
    void testGetStateDetail_Success() throws Exception {
        mockMvc.perform(get("/api/v1/states/IN-KL")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.stateName").value("Kerala"))
                .andExpect(jsonPath("$.data.featuredDestinations", hasSize(1)))
                .andExpect(jsonPath("$.data.popularCities", hasSize(1)));
    }

    @Test
    void testGetStateDetail_NotFound() throws Exception {
        mockMvc.perform(get("/api/v1/states/UNKNOWN-STATE")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void testGetCityDetail_Success() throws Exception {
        mockMvc.perform(get("/api/v1/cities/munnar")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.cityName").value("Munnar"))
                .andExpect(jsonPath("$.data.destinations", hasSize(1)))
                .andExpect(jsonPath("$.data.pois", hasSize(1)))
                .andExpect(jsonPath("$.data.hotels", hasSize(1)));
    }

    @Test
    void testGetDestinations_WithFilters() throws Exception {
        mockMvc.perform(get("/api/v1/destinations")
                        .param("stateId", "IN-KL")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].destinationName").value("Munnar Hills"));
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
