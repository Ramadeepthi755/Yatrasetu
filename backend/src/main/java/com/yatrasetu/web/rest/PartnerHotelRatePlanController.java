package com.yatrasetu.web.rest;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.service.HotelRatePlanService;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.CreateRatePlanRequest;
import com.yatrasetu.web.dto.HotelRatePlanDto;
import com.yatrasetu.web.dto.UpdateRatePlanRequest;
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
@RequestMapping("/api/v1/partner/hotels/{hotelId}/rooms/{roomId}/rate-plans")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PARTNER')")
public class PartnerHotelRatePlanController {

    private final HotelRatePlanService ratePlanService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<HotelRatePlanDto>>> getRatePlans(
            @PathVariable("hotelId") String hotelId,
            @PathVariable("roomId") String roomId,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<List<HotelRatePlanDto>>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        List<HotelRatePlanDto> ratePlans = ratePlanService.getPartnerRatePlans(hotelId, roomId, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<List<HotelRatePlanDto>>builder()
                .success(true)
                .message("Retrieved rate plans successfully")
                .data(ratePlans)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/{ratePlanId}")
    public ResponseEntity<ApiResponse<HotelRatePlanDto>> getRatePlanById(
            @PathVariable("hotelId") String hotelId,
            @PathVariable("roomId") String roomId,
            @PathVariable("ratePlanId") String ratePlanId,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<HotelRatePlanDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        HotelRatePlanDto ratePlan = ratePlanService.getPartnerRatePlanById(hotelId, roomId, ratePlanId, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<HotelRatePlanDto>builder()
                .success(true)
                .message("Retrieved rate plan details successfully")
                .data(ratePlan)
                .timestamp(Instant.now())
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HotelRatePlanDto>> createRatePlan(
            @PathVariable("hotelId") String hotelId,
            @PathVariable("roomId") String roomId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateRatePlanRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<HotelRatePlanDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        HotelRatePlanDto created = ratePlanService.createRatePlan(hotelId, roomId, request, principal.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<HotelRatePlanDto>builder()
                        .success(true)
                        .message("Rate plan created successfully")
                        .data(created)
                        .timestamp(Instant.now())
                        .build());
    }

    @PutMapping("/{ratePlanId}")
    public ResponseEntity<ApiResponse<HotelRatePlanDto>> updateRatePlan(
            @PathVariable("hotelId") String hotelId,
            @PathVariable("roomId") String roomId,
            @PathVariable("ratePlanId") String ratePlanId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateRatePlanRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<HotelRatePlanDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        HotelRatePlanDto updated = ratePlanService.updateRatePlan(hotelId, roomId, ratePlanId, request, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<HotelRatePlanDto>builder()
                .success(true)
                .message("Rate plan updated successfully")
                .data(updated)
                .timestamp(Instant.now())
                .build());
    }

    @PostMapping("/{ratePlanId}/activate")
    public ResponseEntity<ApiResponse<HotelRatePlanDto>> activateRatePlan(
            @PathVariable("hotelId") String hotelId,
            @PathVariable("roomId") String roomId,
            @PathVariable("ratePlanId") String ratePlanId,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<HotelRatePlanDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        HotelRatePlanDto updated = ratePlanService.activateRatePlan(hotelId, roomId, ratePlanId, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<HotelRatePlanDto>builder()
                .success(true)
                .message("Rate plan activated successfully")
                .data(updated)
                .timestamp(Instant.now())
                .build());
    }

    @PostMapping("/{ratePlanId}/deactivate")
    public ResponseEntity<ApiResponse<HotelRatePlanDto>> deactivateRatePlan(
            @PathVariable("hotelId") String hotelId,
            @PathVariable("roomId") String roomId,
            @PathVariable("ratePlanId") String ratePlanId,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<HotelRatePlanDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        HotelRatePlanDto updated = ratePlanService.deactivateRatePlan(hotelId, roomId, ratePlanId, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<HotelRatePlanDto>builder()
                .success(true)
                .message("Rate plan deactivated successfully")
                .data(updated)
                .timestamp(Instant.now())
                .build());
    }

    @DeleteMapping("/{ratePlanId}")
    public ResponseEntity<ApiResponse<Void>> deleteRatePlan(
            @PathVariable("hotelId") String hotelId,
            @PathVariable("roomId") String roomId,
            @PathVariable("ratePlanId") String ratePlanId,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<Void>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        ratePlanService.deleteRatePlan(hotelId, roomId, ratePlanId, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Rate plan deleted successfully")
                .data(null)
                .timestamp(Instant.now())
                .build());
    }
}
