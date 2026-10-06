package com.yatrasetu.web.rest;

import com.yatrasetu.service.CityService;
import com.yatrasetu.service.HotelService;
import com.yatrasetu.service.PoiService;
import com.yatrasetu.web.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/cities")
@RequiredArgsConstructor
public class CityController {

    private final CityService cityService;
    private final PoiService poiService;
    private final HotelService hotelService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CityDto>>> getAllCities(
            @RequestParam(name = "stateId", required = false) String stateId) {

        List<CityDto> cities;
        if (stateId != null && !stateId.trim().isEmpty()) {
            cities = cityService.getCitiesByState(stateId);
        } else {
            cities = cityService.getAllTourismHubCities();
        }

        return ResponseEntity.ok(ApiResponse.<List<CityDto>>builder()
                .success(true)
                .message("Retrieved cities successfully")
                .data(cities)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CityDetailDto>> getCityDetail(@PathVariable("id") String id) {
        return cityService.getCityDetail(id)
                .map(city -> ResponseEntity.ok(ApiResponse.<CityDetailDto>builder()
                        .success(true)
                        .message("Retrieved city details successfully")
                        .data(city)
                        .timestamp(Instant.now())
                        .build()))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.<CityDetailDto>builder()
                                .success(false)
                                .message("City not found with identifier: " + id)
                                .data(null)
                                .timestamp(Instant.now())
                                .build()));
    }

    @GetMapping("/{id}/pois")
    public ResponseEntity<ApiResponse<List<PoiDto>>> getCityPois(@PathVariable("id") String id) {
        List<PoiDto> pois = poiService.getPoisByCity(id);
        return ResponseEntity.ok(ApiResponse.<List<PoiDto>>builder()
                .success(true)
                .message("Retrieved POIs for city successfully")
                .data(pois)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/{id}/hotels")
    public ResponseEntity<ApiResponse<List<HotelDto>>> getCityHotels(@PathVariable("id") String id) {
        List<HotelDto> hotels = hotelService.getHotelsByCity(id);
        return ResponseEntity.ok(ApiResponse.<List<HotelDto>>builder()
                .success(true)
                .message("Retrieved hotels for city successfully")
                .data(hotels)
                .timestamp(Instant.now())
                .build());
    }
}
