package com.yatrasetu.service;

import com.yatrasetu.domain.Hotel;
import com.yatrasetu.domain.SourceType;
import com.yatrasetu.repository.DestinationRepository;
import com.yatrasetu.repository.HotelRepository;
import com.yatrasetu.web.dto.HotelDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class HotelNearbyTest {

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private DestinationRepository destinationRepository;

    @Mock
    private GooglePlacesService googlePlacesService;

    @InjectMocks
    private HotelService hotelService;

    private Hotel sampleHotel;

    @BeforeEach
    void setUp() {
        sampleHotel = Hotel.builder()
                .id("htl-test-1")
                .hotelName("Fortune Select Grand Ridge")
                .latitude(BigDecimal.valueOf(13.6288))
                .longitude(BigDecimal.valueOf(79.4192))
                .pricePerNight(BigDecimal.valueOf(4500))
                .sourceType(SourceType.DATASET)
                .isPartnerProperty(false)
                .isActive(true)
                .build();
    }

    @Test
    void testGetHotelsNearLocation_PrefersDatabaseHotelsFirst() {
        when(hotelRepository.findNearestHotels(anyDouble(), anyDouble(), anyDouble(), anyInt()))
                .thenReturn(List.of(sampleHotel));

        List<HotelDto> nearby = hotelService.getHotelsNearLocation(
                13.6288, 79.4192, 30.0, 5, "dest-tirupati", "Tirumala Temple"
        );

        assertThat(nearby).hasSize(1);
        assertThat(nearby.get(0).getHotelName()).isEqualTo("Fortune Select Grand Ridge");
        assertThat(nearby.get(0).getDistanceKm()).isNotNull();
        assertThat(nearby.get(0).getDistanceText()).contains("Tirumala Temple");
        verifyNoInteractions(googlePlacesService);
    }

    @Test
    void testGetHotelsNearLocation_GooglePlacesFallbackWhenDbInsufficient() {
        when(hotelRepository.findNearestHotels(anyDouble(), anyDouble(), anyDouble(), anyInt()))
                .thenReturn(Collections.emptyList());
        when(googlePlacesService.isConfigured()).thenReturn(true);

        HotelDto extHotel = HotelDto.builder()
                .id("google-place-1")
                .hotelName("Google Lodging Hotel")
                .latitude(BigDecimal.valueOf(13.6300))
                .longitude(BigDecimal.valueOf(79.4200))
                .sourceType("GOOGLE_PLACES")
                .bookabilityStatus("EXTERNAL_DISCOVERY_ONLY")
                .build();

        when(googlePlacesService.searchNearbyHotels(anyDouble(), anyDouble(), anyInt(), any(), any()))
                .thenReturn(List.of(extHotel));

        List<HotelDto> nearby = hotelService.getHotelsNearLocation(
                13.6288, 79.4192, 30.0, 5, "dest-tirupati", "Tirumala Temple"
        );

        assertThat(nearby).hasSize(1);
        assertThat(nearby.get(0).getHotelName()).isEqualTo("Google Lodging Hotel");
        assertThat(nearby.get(0).getSourceType()).isEqualTo("GOOGLE_PLACES");
        assertThat(nearby.get(0).getBookabilityStatus()).isEqualTo("EXTERNAL_DISCOVERY_ONLY");
    }

    @Test
    void testCalculateHaversineDistanceKm() {
        double dist = HotelService.calculateHaversineDistanceKm(13.6288, 79.4192, 13.6388, 79.4292);
        assertThat(dist).isGreaterThan(0.0);
        assertThat(dist).isLessThan(5.0);
    }
}
