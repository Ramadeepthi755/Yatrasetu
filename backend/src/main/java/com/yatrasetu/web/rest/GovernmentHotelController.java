package com.yatrasetu.web.rest;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.service.HotelService;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.HotelDto;
import com.yatrasetu.web.dto.HotelVerificationRequest;
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
@RequestMapping("/api/v1/government/hotels")
@RequiredArgsConstructor
@PreAuthorize("hasRole('GOVERNMENT')")
public class GovernmentHotelController {

    private final HotelService hotelService;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<HotelDto>>> getPendingVerificationHotels(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<List<HotelDto>>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        List<HotelDto> pending = hotelService.getPendingVerificationHotels();
        return ResponseEntity.ok(ApiResponse.<List<HotelDto>>builder()
                .success(true)
                .message("Retrieved pending hotel verification properties successfully")
                .data(pending)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HotelDto>> getHotelForGovernmentReview(
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

        HotelDto hotel = hotelService.getHotelForGovernmentReview(id);
        return ResponseEntity.ok(ApiResponse.<HotelDto>builder()
                .success(true)
                .message("Retrieved hotel property for verification review successfully")
                .data(hotel)
                .timestamp(Instant.now())
                .build());
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<ApiResponse<HotelDto>> reviewHotel(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") String id,
            @Valid @RequestBody HotelVerificationRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<HotelDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        HotelDto verified = hotelService.verifyHotel(principal.getUserId(), id, request);
        return ResponseEntity.ok(ApiResponse.<HotelDto>builder()
                .success(true)
                .message("Hotel verification processed successfully")
                .data(verified)
                .timestamp(Instant.now())
                .build());
    }
}
