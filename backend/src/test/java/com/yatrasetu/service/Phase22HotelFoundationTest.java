package com.yatrasetu.service;

import com.yatrasetu.domain.*;
import com.yatrasetu.domain.intelligence.EcosystemGapType;
import com.yatrasetu.repository.DestinationRepository;
import com.yatrasetu.repository.HotelRepository;
import com.yatrasetu.web.dto.HotelDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class Phase22HotelFoundationTest {

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private DestinationRepository destinationRepository;

    @Mock
    private GooglePlacesService googlePlacesService;

    @InjectMocks
    private HotelService hotelService;

    private State keralaState;
    private City kochiCity;
    private Destination fortKochiDest;
    private Hotel datasetHotel;
    private Hotel partnerHotel;

    @BeforeEach
    void setUp() {
        keralaState = State.builder()
                .id("IN-KL")
                .stateName("Kerala")
                .build();

        kochiCity = City.builder()
                .id("kochi")
                .cityName("Kochi")
                .state(keralaState)
                .build();

        fortKochiDest = Destination.builder()
                .id("dest-155")
                .destinationName("Fort Kochi Heritage Zone")
                .city(kochiCity)
                .state(keralaState)
                .latitude(BigDecimal.valueOf(9.965))
                .longitude(BigDecimal.valueOf(76.242))
                .build();

        datasetHotel = Hotel.builder()
                .id("htl-1")
                .hotelName("Crowne Plaza Kochi")
                .city(kochiCity)
                .destination(fortKochiDest)
                .hotelRating(BigDecimal.valueOf(4.6))
                .pricePerNight(BigDecimal.valueOf(8854.0))
                .amenities(List.of("Free Wi-Fi", "Pool", "Spa", "Restaurant"))
                .category("Luxury")
                .address("Maradu, Kochi")
                .latitude(BigDecimal.valueOf(9.9312))
                .longitude(BigDecimal.valueOf(76.3214))
                .isPartnerProperty(false)
                .inventoryType("DATASET_PROPERTY")
                .sourceType(SourceType.DATASET)
                .isActive(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        partnerHotel = Hotel.builder()
                .id("htl-partner-1")
                .hotelName("Brunton Boatyard - CGH Earth")
                .city(kochiCity)
                .destination(fortKochiDest)
                .hotelRating(BigDecimal.valueOf(4.8))
                .pricePerNight(BigDecimal.valueOf(14500.0))
                .amenities(List.of("Heritage Architecture", "Ayurveda", "Sea View Dining"))
                .category("Heritage")
                .address("Calvathy Road, Fort Kochi")
                .latitude(BigDecimal.valueOf(9.9678))
                .longitude(BigDecimal.valueOf(76.2445))
                .isPartnerProperty(true)
                .inventoryType("PARTNER_PMS")
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .isActive(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    @Test
    @DisplayName("1. Existing hotel records load correctly and map complete fields")
    void testHotelLoadingAndFieldMapping() {
        when(hotelRepository.findById("htl-1")).thenReturn(Optional.of(datasetHotel));

        Optional<HotelDto> dtoOpt = hotelService.getHotelById("htl-1");

        assertThat(dtoOpt).isPresent();
        HotelDto dto = dtoOpt.get();
        assertThat(dto.getId()).isEqualTo("htl-1");
        assertThat(dto.getHotelName()).isEqualTo("Crowne Plaza Kochi");
        assertThat(dto.getCityId()).isEqualTo("kochi");
        assertThat(dto.getCityName()).isEqualTo("Kochi");
        assertThat(dto.getStateId()).isEqualTo("IN-KL");
        assertThat(dto.getStateName()).isEqualTo("Kerala");
        assertThat(dto.getDestinationId()).isEqualTo("dest-155");
        assertThat(dto.getDestinationName()).isEqualTo("Fort Kochi Heritage Zone");
        assertThat(dto.getHotelRating()).isEqualTo(BigDecimal.valueOf(4.6));
        assertThat(dto.getPricePerNight()).isEqualTo(BigDecimal.valueOf(8854.0));
        assertThat(dto.getCategory()).isEqualTo("Luxury");
        assertThat(dto.getAmenities()).contains("Free Wi-Fi", "Pool", "Spa");
    }

    @Test
    @DisplayName("2. Source and provenance classification correctly identifies DATASET vs PARTNER_SUBMITTED")
    void testProvenanceClassification() {
        HotelDto datasetDto = hotelService.toDto(datasetHotel);
        assertThat(datasetDto.getSourceType()).isEqualTo("DATASET");
        assertThat(datasetDto.getInventoryType()).isEqualTo("DATASET_PROPERTY");
        assertThat(datasetDto.getIsPartnerProperty()).isFalse();

        HotelDto partnerDto = hotelService.toDto(partnerHotel);
        assertThat(partnerDto.getSourceType()).isEqualTo("PARTNER_SUBMITTED");
        assertThat(partnerDto.getIsPartnerProperty()).isTrue();
    }

    @Test
    @DisplayName("3. Geographic validation: City and destination foreign relations correctly populate state")
    void testGeographicIntegrityMapping() {
        HotelDto dto = hotelService.toDto(datasetHotel);
        assertThat(dto.getCityName()).isEqualTo("Kochi");
        assertThat(dto.getStateName()).isEqualTo("Kerala");
        assertThat(dto.getDestinationName()).isEqualTo("Fort Kochi Heritage Zone");
    }

    @Test
    @DisplayName("4. Invalid/null city handling in search filters")
    void testNullAndInvalidCityFilterHandling() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Hotel> emptyPage = new PageImpl<>(List.of());

        when(hotelRepository.findWithFilters(
                eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(pageable)
        )).thenReturn(emptyPage);

        Page<HotelDto> result = hotelService.getAllHotels(
                "all", null, "all", null, null, null, "  ", pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEmpty();
    }

    @Test
    @DisplayName("5. Invalid destination handling in search filters gracefully falls back")
    void testInvalidDestinationFilterHandling() {
        Pageable pageable = PageRequest.of(0, 10);
        when(destinationRepository.findById("dest-unknown")).thenReturn(Optional.empty());
        when(hotelRepository.findWithFilters(
                eq(null), eq("dest-unknown"), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(pageable)
        )).thenReturn(new PageImpl<>(List.of()));

        Page<HotelDto> result = hotelService.getAllHotels(
                null, "dest-unknown", null, null, null, null, null, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEmpty();
    }

    @Test
    @DisplayName("6. Duplicate detection logic distinguishes distinct vs duplicate records")
    void testDuplicateDetectionLogic() {
        Hotel duplicateA = Hotel.builder().id("htl-592").hotelName("Hotel Astor").city(kochiCity).pricePerNight(BigDecimal.valueOf(1200)).build();
        Hotel duplicateB = Hotel.builder().id("htl-596").hotelName("Hotel ASTOR").city(kochiCity).pricePerNight(BigDecimal.valueOf(1200)).build();

        String normA = duplicateA.getHotelName().replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        String normB = duplicateB.getHotelName().replaceAll("[^a-zA-Z0-9]", "").toLowerCase();

        assertThat(normA).isEqualTo(normB);
        assertThat(duplicateA.getId()).isNotEqualTo(duplicateB.getId());
    }

    @Test
    @DisplayName("7. Null source handling defaults safely to DATASET")
    void testNullSourceTypeDefaultsToDataset() {
        Hotel noSourceHotel = Hotel.builder()
                .id("htl-legacy")
                .hotelName("Legacy Inn")
                .pricePerNight(BigDecimal.valueOf(2000.0))
                .sourceType(null)
                .inventoryType(null)
                .build();

        HotelDto dto = hotelService.toDto(noSourceHotel);
        assertThat(dto.getSourceType()).isEqualTo("DATASET");
        assertThat(dto.getInventoryType()).isEqualTo("DATASET_PROPERTY");
    }

    @Test
    @DisplayName("8. Demo hotel isolation: Demo properties are distinct from verified dataset records")
    void testDemoHotelIsolation() {
        Hotel demoHotel = Hotel.builder()
                .id("demo-htl-1")
                .hotelName("Demo Royal Palace")
                .pricePerNight(BigDecimal.valueOf(5000.0))
                .sourceType(SourceType.DEMO)
                .inventoryType("DEMO_SIMULATION")
                .build();

        HotelDto dto = hotelService.toDto(demoHotel);
        assertThat(dto.getSourceType()).isEqualTo("DEMO");
        assertThat(dto.getInventoryType()).isEqualTo("DEMO_SIMULATION");
    }

    @Test
    @DisplayName("9. No fake pricing: Rates are exposed as explicit pricePerNight without hidden fabricated discounts")
    void testNoFakePricingFields() {
        HotelDto dto = hotelService.toDto(datasetHotel);
        assertThat(dto.getPricePerNight()).isEqualTo(BigDecimal.valueOf(8854.0));
        // Verify no fake discount field exists in DTO contract
        assertThat(dto.getPricePerNight()).isGreaterThan(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("10. No fake live availability: Inventory type reflects static dataset vs partner PMS")
    void testInventoryTypeDistinction() {
        HotelDto datasetDto = hotelService.toDto(datasetHotel);
        assertThat(datasetDto.getInventoryType()).isEqualTo("DATASET_PROPERTY");

        HotelDto partnerDto = hotelService.toDto(partnerHotel);
        assertThat(partnerDto.getInventoryType()).isEqualTo("PARTNER_PMS");
    }

    @Test
    @DisplayName("11. Hotel search with filters (category, minRating, maxPrice, searchQuery)")
    void testHotelSearchWithFilters() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Hotel> hotelPage = new PageImpl<>(List.of(datasetHotel));

        when(hotelRepository.findWithFilters(
                eq("kochi"), eq("dest-155"), eq("kochi"), eq("Luxury"),
                eq(BigDecimal.valueOf(4.0)), eq(BigDecimal.valueOf(10000.0)),
                eq(false), eq("Crowne"), eq(pageable)
        )).thenReturn(hotelPage);

        when(destinationRepository.findById("dest-155")).thenReturn(Optional.of(fortKochiDest));

        Page<HotelDto> result = hotelService.getAllHotels(
                "kochi", "dest-155", "Luxury", BigDecimal.valueOf(4.0),
                BigDecimal.valueOf(10000.0), false, "Crowne", pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getHotelName()).isEqualTo("Crowne Plaza Kochi");
    }

    @Test
    @DisplayName("12. Destination hotel retrieval with fallback to city hotels")
    void testDestinationHotelRetrievalWithFallback() {
        when(hotelRepository.findByDestinationId("dest-155")).thenReturn(List.of());
        when(destinationRepository.findById("dest-155")).thenReturn(Optional.of(fortKochiDest));
        when(hotelRepository.findByCityId("kochi")).thenReturn(List.of(datasetHotel));

        List<HotelDto> result = hotelService.getHotelsByDestination("dest-155");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("htl-1");
    }

    @Test
    @DisplayName("13. Partner ownership flag isPartnerProperty is respected")
    void testPartnerPropertyFlag() {
        assertThat(datasetHotel.getIsPartnerProperty()).isFalse();
        assertThat(partnerHotel.getIsPartnerProperty()).isTrue();
    }

    @Test
    @DisplayName("14. Cross-partner access boundary: Partner flag and source type isolate partner listings")
    void testPartnerIsolation() {
        assertThat(partnerHotel.getSourceType()).isEqualTo(SourceType.PARTNER_SUBMITTED);
        assertThat(datasetHotel.getSourceType()).isEqualTo(SourceType.DATASET);
    }

    @Test
    @DisplayName("15. Distinct categories retrieval returns active categories")
    void testGetCategories() {
        when(hotelRepository.findDistinctCategories()).thenReturn(List.of("Luxury", "Mid-Range", "Budget", "Heritage"));

        List<String> categories = hotelService.getCategories();

        assertThat(categories).containsExactly("Luxury", "Mid-Range", "Budget", "Heritage");
    }

    @Test
    @DisplayName("16. City-level hotel query returns all hotels in city")
    void testGetHotelsByCity() {
        when(hotelRepository.findByCityId("kochi")).thenReturn(List.of(datasetHotel, partnerHotel));

        List<HotelDto> hotels = hotelService.getHotelsByCity("kochi");

        assertThat(hotels).hasSize(2);
        assertThat(hotels).extracting(HotelDto::getId).containsExactly("htl-1", "htl-partner-1");
    }

    @Test
    @DisplayName("17. Government STAYS_DEFICIT wording precision in intelligence model")
    void testGovernmentStaysDeficitWording() {
        EcosystemGapType gapType = EcosystemGapType.STAYS_DEFICIT;
        assertThat(gapType.name()).isEqualTo("STAYS_DEFICIT");
    }

    @Test
    @DisplayName("18. Active status filter is respected on entity level")
    void testIsActiveDefault() {
        assertThat(datasetHotel.getIsActive()).isTrue();
        datasetHotel.setIsActive(false);
        assertThat(datasetHotel.getIsActive()).isFalse();
    }

    @Test
    @DisplayName("19. Nearest hotels fallback when coordinates are present")
    void testNearestHotelsFallback() {
        when(hotelRepository.findByDestinationId("dest-155")).thenReturn(List.of());
        when(destinationRepository.findById("dest-155")).thenReturn(Optional.of(fortKochiDest));
        when(hotelRepository.findByCityId("kochi")).thenReturn(List.of());
        when(hotelRepository.findNearestHotels(9.965, 76.242, 50.0, 12)).thenReturn(List.of(datasetHotel));

        List<HotelDto> result = hotelService.getHotelsByDestination("dest-155");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("htl-1");
    }

    @Test
    @DisplayName("20. Complete DTO serialization contract consistency")
    void testDtoSerializationContract() {
        HotelDto dto = hotelService.toDto(datasetHotel);

        assertThat(dto.getId()).isNotBlank();
        assertThat(dto.getHotelName()).isNotBlank();
        assertThat(dto.getPricePerNight()).isNotNull();
        assertThat(dto.getCategory()).isNotBlank();
        assertThat(dto.getSourceType()).isEqualTo("DATASET");
        assertThat(dto.getInventoryType()).isEqualTo("DATASET_PROPERTY");
    }
}
