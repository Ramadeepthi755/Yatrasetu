package com.yatrasetu.service;

import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.web.dto.DestinationDetailDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class DestinationDetailRealTest {

    @Autowired
    private DestinationService destinationService;

    @Autowired
    private StateRepository stateRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    @Transactional
    void testGetDestinationDetail_WithUnresolvedLazyProxies() {
        State up = stateRepository.save(State.builder()
                .id("IN-UP")
                .stateName("Uttar Pradesh")
                .region("North India")
                .build());

        City varanasi = cityRepository.save(City.builder()
                .id("varanasi")
                .cityName("Varanasi")
                .state(up)
                .latitude(BigDecimal.valueOf(25.3176))
                .longitude(BigDecimal.valueOf(82.9739))
                .build());

        Destination d92 = destinationRepository.save(Destination.builder()
                .id("dest-92")
                .destinationName("Varanasi Ganga Ghats Pilgrimage")
                .state(up)
                .city(varanasi)
                .district("Varanasi")
                .region("North India")
                .latitude(BigDecimal.valueOf(25.31))
                .longitude(BigDecimal.valueOf(83.01))
                .popularityScore(BigDecimal.valueOf(10.0))
                .tripTypes(List.of("Spiritual", "Heritage", "Ganga_ghats"))
                .primaryAttractions(List.of("Ganga ghats including Dashashwamedh and Assi", "Kashi Vishwanath Temple corridor"))
                .activitiesAvailable(List.of("Sunrise and sunset boat rides", "Walking tours"))
                .idealFor(List.of("Spiritual_travellers", "Photographers", "Culture_seekers"))
                .budgetRangeJson("{\"accommodation_range\": [700, 1800], \"food_range\": [200, 450], \"total_daily_range\": [1300, 3350]}")
                .midRangeJson("{\"accommodation_range\": [1800, 4000], \"food_range\": [300, 700], \"total_daily_range\": [2700, 6200]}")
                .luxuryRangeJson("{\"accommodation_range\": [4000, 18000], \"food_range\": [600, 1200], \"total_daily_range\": [5500, 21300]}")
                .build());

        // Hotel with unseeded/null owner
        hotelRepository.save(Hotel.builder()
                .id("htl-884")
                .hotelName("Hotel TRIDEV")
                .city(varanasi)
                .destination(d92)
                .hotelRating(BigDecimal.valueOf(4.0))
                .pricePerNight(BigDecimal.valueOf(3808.0))
                .category("Mid-Range")
                .latitude(BigDecimal.valueOf(25.31))
                .longitude(BigDecimal.valueOf(83.01))
                .isActive(true)
                .build());

        // Review with non-existent user
        reviewRepository.save(Review.builder()
                .id("rev-dest92-1")
                .entityType("DESTINATION")
                .entityId("dest-92")
                .rating(5)
                .reviewText("A sublime spiritual experience on the ghats.")
                .build());

        Optional<DestinationDetailDto> res = destinationService.getDestinationDetail("dest-92");
        assertTrue(res.isPresent());
        assertEquals("Varanasi Ganga Ghats Pilgrimage", res.get().getDestinationName());
        assertEquals("IN-UP", res.get().getStateId());
        assertEquals("varanasi", res.get().getCityId());
    }

    @Test
    @Transactional
    void testMultipleDestinationsAndCategoryFilters() {
        State rj = stateRepository.save(State.builder().id("IN-RJ").stateName("Rajasthan").region("North India").build());
        State ap = stateRepository.save(State.builder().id("IN-AP").stateName("Andhra Pradesh").region("South India").build());
        State ka = stateRepository.save(State.builder().id("IN-KA").stateName("Karnataka").region("South India").build());

        City jaipur = cityRepository.save(City.builder().id("jaipur").cityName("Jaipur").state(rj).latitude(BigDecimal.valueOf(26.9124)).longitude(BigDecimal.valueOf(75.7873)).build());
        City tirupati = cityRepository.save(City.builder().id("tirupati").cityName("Tirupati").state(ap).latitude(BigDecimal.valueOf(13.6288)).longitude(BigDecimal.valueOf(79.4192)).build());
        City hampi = cityRepository.save(City.builder().id("hampi").cityName("Hampi").state(ka).latitude(BigDecimal.valueOf(15.3350)).longitude(BigDecimal.valueOf(76.4600)).build());

        Destination dJaipur = destinationRepository.save(Destination.builder()
                .id("dest-3").destinationName("Jaipur").state(rj).city(jaipur)
                .latitude(BigDecimal.valueOf(26.9124)).longitude(BigDecimal.valueOf(75.7873))
                .tripTypes(List.of("Heritage", "Palaces", "Culture"))
                .primaryAttractions(List.of("Amber Fort", "Hawa Mahal", "City Palace"))
                .build());

        Destination dTirupati = destinationRepository.save(Destination.builder()
                .id("dest-136").destinationName("Tirupati").state(ap).city(tirupati)
                .latitude(BigDecimal.valueOf(13.6288)).longitude(BigDecimal.valueOf(79.4192))
                .tripTypes(List.of("Spiritual", "Temples", "Pilgrimage"))
                .primaryAttractions(List.of("Sri Venkateswara Swamy Temple", "Kapila Theertham"))
                .build());

        Destination dHampi = destinationRepository.save(Destination.builder()
                .id("dest-15").destinationName("Hampi").state(ka).city(hampi)
                .latitude(BigDecimal.valueOf(15.3350)).longitude(BigDecimal.valueOf(76.4600))
                .tripTypes(List.of("Heritage", "UNESCO", "Ruins"))
                .primaryAttractions(List.of("Virupaksha Temple", "Vijayanagara Ruins"))
                .build());

        // Test detail resolution for all destinations
        assertTrue(destinationService.getDestinationDetail("dest-3").isPresent());
        assertTrue(destinationService.getDestinationDetail("dest-136").isPresent());
        assertTrue(destinationService.getDestinationDetail("dest-15").isPresent());

        // Test category filter matching
        assertTrue(destinationService.matchesCategory(dJaipur, "Heritage"));
        assertTrue(destinationService.matchesCategory(dJaipur, "Culture"));
        assertTrue(destinationService.matchesCategory(dTirupati, "Temples"));
        assertTrue(destinationService.matchesCategory(dTirupati, "Spiritual"));
        assertTrue(destinationService.matchesCategory(dHampi, "Heritage"));
    }
}

