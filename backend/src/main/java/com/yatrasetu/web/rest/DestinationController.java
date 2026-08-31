package com.yatrasetu.web.rest;

import com.yatrasetu.service.DestinationService;
import com.yatrasetu.service.HotelService;
import com.yatrasetu.service.PoiService;
import com.yatrasetu.web.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/destinations")
@RequiredArgsConstructor
public class DestinationController {

    private final DestinationService destinationService;
    private final PoiService poiService;
    private final HotelService hotelService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<DestinationSummaryDto>>> getDestinations(
            @RequestParam(name = "stateId", required = false) String stateId,
            @RequestParam(name = "region", required = false) String region,
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "minPopularity", required = false) BigDecimal minPopularity,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "24") int size) {

        Page<DestinationSummaryDto> result = destinationService.getDestinations(
                stateId, region, category, minPopularity, search, page, size);

        return ResponseEntity.ok(ApiResponse.<Page<DestinationSummaryDto>>builder()
                .success(true)
                .message("Retrieved destinations successfully")
                .data(result)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<DestinationSummaryDto>>> getFeaturedDestinations(
            @RequestParam(name = "limit", defaultValue = "8") int limit) {

        List<DestinationSummaryDto> featured = destinationService.getFeaturedDestinations(limit);
        return ResponseEntity.ok(ApiResponse.<List<DestinationSummaryDto>>builder()
                .success(true)
                .message("Retrieved featured destinations successfully")
                .data(featured)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<DestinationSummaryDto>>> getTrendingDestinations(
            @RequestParam(name = "limit", defaultValue = "8") int limit) {

        List<DestinationSummaryDto> trending = destinationService.getTrendingDestinations(limit);
        return ResponseEntity.ok(ApiResponse.<List<DestinationSummaryDto>>builder()
                .success(true)
                .message("Retrieved trending destinations successfully")
                .data(trending)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/hidden-gems")
    public ResponseEntity<ApiResponse<List<DestinationSummaryDto>>> getHiddenGems(
            @RequestParam(name = "limit", defaultValue = "8") int limit) {

        List<DestinationSummaryDto> gems = destinationService.getHiddenGems(limit);
        return ResponseEntity.ok(ApiResponse.<List<DestinationSummaryDto>>builder()
                .success(true)
                .message("Retrieved hidden gems successfully")
                .data(gems)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DestinationDetailDto>> getDestinationDetail(@PathVariable("id") String id) {
        return destinationService.getDestinationDetail(id)
                .map(dest -> ResponseEntity.ok(ApiResponse.<DestinationDetailDto>builder()
                        .success(true)
                        .message("Retrieved destination details successfully")
                        .data(dest)
                        .timestamp(Instant.now())
                        .build()))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.<DestinationDetailDto>builder()
                                .success(false)
                                .message("Destination not found with identifier: " + id)
                                .data(null)
                                .timestamp(Instant.now())
                                .build()));
    }

    @GetMapping("/{id}/pois")
    public ResponseEntity<ApiResponse<List<PoiDto>>> getDestinationPois(@PathVariable("id") String id) {
        List<PoiDto> pois = poiService.getPoisByDestination(id);
        return ResponseEntity.ok(ApiResponse.<List<PoiDto>>builder()
                .success(true)
                .message("Retrieved destination POIs successfully")
                .data(pois)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/{id}/hotels")
    public ResponseEntity<ApiResponse<List<HotelDto>>> getDestinationHotels(@PathVariable("id") String id) {
        List<HotelDto> hotels = hotelService.getHotelsByDestination(id);
        return ResponseEntity.ok(ApiResponse.<List<HotelDto>>builder()
                .success(true)
                .message("Retrieved destination hotels successfully")
                .data(hotels)
                .timestamp(Instant.now())
                .build());
    }
}
