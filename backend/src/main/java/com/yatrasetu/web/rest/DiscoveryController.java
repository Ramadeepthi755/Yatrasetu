package com.yatrasetu.web.rest;

import com.yatrasetu.service.DiscoveryService;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.NearbyResultDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/v1/discovery")
@RequiredArgsConstructor
public class DiscoveryController {

    private final DiscoveryService discoveryService;

    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<NearbyResultDto>> getNearby(
            @RequestParam("lat") double lat,
            @RequestParam("lng") double lng,
            @RequestParam(name = "radiusKm", defaultValue = "300") double radiusKm,
            @RequestParam(name = "limit", defaultValue = "12") int limit) {

        NearbyResultDto nearby = discoveryService.getNearbyPlaces(lat, lng, radiusKm, limit);
        return ResponseEntity.ok(ApiResponse.<NearbyResultDto>builder()
                .success(true)
                .message("Retrieved nearby places successfully")
                .data(nearby)
                .timestamp(Instant.now())
                .build());
    }
}
