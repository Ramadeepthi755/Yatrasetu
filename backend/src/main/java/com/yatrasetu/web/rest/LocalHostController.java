package com.yatrasetu.web.rest;

import com.yatrasetu.service.ExperienceBookingService;
import com.yatrasetu.service.LocalHostService;
import com.yatrasetu.web.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/local")
@RequiredArgsConstructor
public class LocalHostController {

    private final LocalHostService localHostService;
    private final ExperienceBookingService bookingService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<LocalHostDto>>> getAllHosts(
            @RequestParam(name = "cityId", required = false) String cityId,
            @RequestParam(name = "destinationId", required = false) String destinationId,
            @RequestParam(name = "stateId", required = false) String stateId,
            @RequestParam(name = "isVerified", required = false) Boolean isVerified,
            @RequestParam(name = "minRating", required = false) BigDecimal minRating,
            @RequestParam(name = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(name = "skill", required = false) String skill,
            @RequestParam(name = "language", required = false) String language,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "12") int size,
            @RequestParam(name = "sort", defaultValue = "rating") String sortBy,
            @RequestParam(name = "direction", defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<LocalHostDto> result = localHostService.getAllHosts(
                cityId, destinationId, stateId, isVerified, minRating, maxPrice, skill, language, search, pageable);

        return ResponseEntity.ok(ApiResponse.<Page<LocalHostDto>>builder()
                .success(true)
                .message("Retrieved local hosts successfully")
                .data(result)
                .timestamp(Instant.now())
                .build());
    }

    @PostMapping("/match")
    public ResponseEntity<ApiResponse<GuideMatchResponseDto>> matchGuides(
            @RequestBody GuideMatchFilterRequest request) {
        GuideMatchResponseDto matchResult = bookingService.matchGuides(request);
        return ResponseEntity.ok(ApiResponse.ok("Guide matching performed with explainable reasoning", matchResult));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LocalHostDetailDto>> getHostById(@PathVariable("id") String id) {
        return localHostService.getHostById(id)
                .map(host -> ResponseEntity.ok(ApiResponse.<LocalHostDetailDto>builder()
                        .success(true)
                        .message("Retrieved local host profile successfully")
                        .data(host)
                        .timestamp(Instant.now())
                        .build()))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.<LocalHostDetailDto>builder()
                                .success(false)
                                .message("Local host not found with id: " + id)
                                .data(null)
                                .timestamp(Instant.now())
                                .build()));
    }

    @GetMapping("/destination/{destinationId}")
    public ResponseEntity<ApiResponse<List<LocalHostDto>>> getHostsByDestination(
            @PathVariable("destinationId") String destinationId) {
        List<LocalHostDto> hosts = localHostService.getHostsByDestination(destinationId);
        return ResponseEntity.ok(ApiResponse.<List<LocalHostDto>>builder()
                .success(true)
                .message("Retrieved local hosts for destination successfully")
                .data(hosts)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/city/{cityId}")
    public ResponseEntity<ApiResponse<List<LocalHostDto>>> getHostsByCity(
            @PathVariable("cityId") String cityId) {
        List<LocalHostDto> hosts = localHostService.getHostsByCity(cityId);
        return ResponseEntity.ok(ApiResponse.<List<LocalHostDto>>builder()
                .success(true)
                .message("Retrieved local hosts for city successfully")
                .data(hosts)
                .timestamp(Instant.now())
                .build());
    }
}
