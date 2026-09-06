package com.yatrasetu.web.rest;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.service.HotelService;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.CreateHotelRequest;
import com.yatrasetu.web.dto.HotelDto;
import com.yatrasetu.web.dto.UpdateHotelRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/partner/hotels")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PARTNER')")
public class PartnerHotelController {

    private final HotelService hotelService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<HotelDto>>> getMyHotels(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<List<HotelDto>>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        List<HotelDto> hotels = hotelService.getMyHotels(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<List<HotelDto>>builder()
                .success(true)
                .message("Retrieved partner hotel properties successfully")
                .data(hotels)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HotelDto>> getMyHotelById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") String id) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<HotelDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        HotelDto hotel = hotelService.getMyHotelById(principal.getUserId(), id);
        return ResponseEntity.ok(ApiResponse.<HotelDto>builder()
                .success(true)
                .message("Retrieved hotel property successfully")
                .data(hotel)
                .timestamp(Instant.now())
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HotelDto>> createHotel(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateHotelRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<HotelDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        HotelDto created = hotelService.createPartnerHotel(principal.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<HotelDto>builder()
                        .success(true)
                        .message("Hotel property registered successfully in draft status")
                        .data(created)
                        .timestamp(Instant.now())
                        .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HotelDto>> updateHotel(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") String id,
            @Valid @RequestBody UpdateHotelRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<HotelDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        HotelDto updated = hotelService.updatePartnerHotel(principal.getUserId(), id, request);
        return ResponseEntity.ok(ApiResponse.<HotelDto>builder()
                .success(true)
                .message("Hotel property updated successfully")
                .data(updated)
                .timestamp(Instant.now())
                .build());
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<HotelDto>> submitHotelForVerification(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") String id) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<HotelDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        HotelDto submitted = hotelService.submitHotelForVerification(principal.getUserId(), id);
        return ResponseEntity.ok(ApiResponse.<HotelDto>builder()
                .success(true)
                .message("Hotel property submitted for verification successfully")
                .data(submitted)
                .timestamp(Instant.now())
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHotel(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") String id) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<Void>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        hotelService.deletePartnerHotel(principal.getUserId(), id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Hotel property deleted successfully")
                .data(null)
                .timestamp(Instant.now())
                .build());
    }
}
