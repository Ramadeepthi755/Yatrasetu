package com.yatrasetu.web.rest;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.service.ExperienceBookingService;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.ExperienceBookingDto;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/partner/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PARTNER')")
public class PartnerBookingController {

    private final ExperienceBookingService bookingService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExperienceBookingDto>>> getPartnerBookings(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<List<ExperienceBookingDto>>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        List<ExperienceBookingDto> bookings = bookingService.getPartnerBookings(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.ok("Retrieved partner bookings and customized requests", bookings));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<ExperienceBookingDto>> acceptBooking(
            @PathVariable("id") String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<ExperienceBookingDto>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        ExperienceBookingDto accepted = bookingService.acceptBooking(id, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.ok("Booking request accepted", accepted));
    }

    @Data
    public static class RejectBookingRequest {
        private String reason;
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<ExperienceBookingDto>> rejectBooking(
            @PathVariable("id") String id,
            @RequestBody(required = false) RejectBookingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<ExperienceBookingDto>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        ExperienceBookingDto rejected = bookingService.rejectBooking(id, principal.getUserId(), request != null ? request.getReason() : null);
        return ResponseEntity.ok(ApiResponse.ok("Booking request rejected", rejected));
    }

    @Data
    public static class CustomizeBookingRequest {
        private String itinerary;
        private BigDecimal customPrice;
    }

    @PostMapping("/{id}/customize")
    public ResponseEntity<ApiResponse<ExperienceBookingDto>> customizeBooking(
            @PathVariable("id") String id,
            @RequestBody CustomizeBookingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<ExperienceBookingDto>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        ExperienceBookingDto customized = bookingService.customizeBooking(
                id, principal.getUserId(), request.getItinerary(), request.getCustomPrice());
        return ResponseEntity.ok(ApiResponse.ok("Customized itinerary and quote submitted to tourist", customized));
    }

    @PostMapping("/{id}/start-trip")
    public ResponseEntity<ApiResponse<ExperienceBookingDto>> startTrip(
            @PathVariable("id") String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<ExperienceBookingDto>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        ExperienceBookingDto started = bookingService.startTrip(id, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.ok("Trip marked as started and in-progress", started));
    }

    @PostMapping("/{id}/complete-trip")
    public ResponseEntity<ApiResponse<ExperienceBookingDto>> completeTrip(
            @PathVariable("id") String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<ExperienceBookingDto>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        ExperienceBookingDto completed = bookingService.markTripCompletionByPartner(id, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.ok("Trip marked completed by partner, awaiting tourist confirmation", completed));
    }

    @Data
    public static class PartnerCheckinRequest {
        private String checkpointId;
        private String notes;
    }

    @PostMapping("/{id}/checkin")
    public ResponseEntity<ApiResponse<com.yatrasetu.web.dto.TripCheckinDto>> partnerCheckin(
            @PathVariable("id") String id,
            @RequestBody PartnerCheckinRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<com.yatrasetu.web.dto.TripCheckinDto>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        com.yatrasetu.web.dto.TripCheckinDto result = bookingService.completeCheckinByPartner(
                id, request.getCheckpointId(), request.getNotes(), principal.getUserId());
        return ResponseEntity.ok(ApiResponse.ok("Trip safety checkpoint verified and checked in", result));
    }

    @PostMapping("/{id}/cash-milestone/{milestoneNumber}")
    public ResponseEntity<ApiResponse<ExperienceBookingDto>> recordCashMilestone(
            @PathVariable("id") String id,
            @PathVariable("milestoneNumber") int milestoneNumber,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<ExperienceBookingDto>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        ExperienceBookingDto updated = bookingService.recordCashMilestone(id, milestoneNumber, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.ok("Cash milestone " + milestoneNumber + " recorded successfully", updated));
    }

    @GetMapping("/reviews")
    public ResponseEntity<ApiResponse<List<com.yatrasetu.web.dto.ExperienceReviewDto>>> getPartnerReviews(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<List<com.yatrasetu.web.dto.ExperienceReviewDto>>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        List<com.yatrasetu.web.dto.ExperienceReviewDto> reviews = bookingService.getPartnerReviews(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.ok("Partner reviews retrieved successfully", reviews));
    }
}
