package com.yatrasetu.web.rest;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.service.HotelBookingService;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.HotelBookingDto;
import com.yatrasetu.web.dto.RejectBookingRequest;
import com.yatrasetu.web.dto.VerifyQrRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
@PreAuthorize("hasRole('PARTNER')")
public class PartnerHotelBookingController {

    private final HotelBookingService bookingService;

    /**
     * Retrieve all bookings across all properties owned by the authenticated partner.
     */
    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<HotelBookingDto>>> getAllPartnerBookings(
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<List<HotelBookingDto>>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        List<HotelBookingDto> bookings = bookingService.getAllPartnerHotelBookings(principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<List<HotelBookingDto>>builder()
                .success(true)
                .message("Retrieved all partner hotel bookings successfully")
                .data(bookings)
                .timestamp(Instant.now())
                .build());
    }

    /**
     * Retrieve bookings for a specific hotel owned by the authenticated partner.
     */
    @GetMapping("/{hotelId}/bookings")
    public ResponseEntity<ApiResponse<List<HotelBookingDto>>> getHotelBookings(
            @PathVariable("hotelId") String hotelId,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<List<HotelBookingDto>>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        List<HotelBookingDto> bookings = bookingService.getPartnerHotelBookings(hotelId, principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<List<HotelBookingDto>>builder()
                .success(true)
                .message("Retrieved partner hotel bookings successfully")
                .data(bookings)
                .timestamp(Instant.now())
                .build());
    }

    /**
     * Partner accepts a hotel booking request.
     */
    @PostMapping("/bookings/{bookingReference}/accept")
    public ResponseEntity<ApiResponse<HotelBookingDto>> acceptBooking(
            @PathVariable("bookingReference") String bookingReference,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<HotelBookingDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        HotelBookingDto accepted = bookingService.acceptHotelBooking(bookingReference, principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<HotelBookingDto>builder()
                .success(true)
                .message("Booking request accepted successfully")
                .data(accepted)
                .timestamp(Instant.now())
                .build());
    }

    /**
     * Partner declines/rejects a hotel booking request.
     */
    @PostMapping("/bookings/{bookingReference}/reject")
    public ResponseEntity<ApiResponse<HotelBookingDto>> rejectBooking(
            @PathVariable("bookingReference") String bookingReference,
            @RequestBody(required = false) RejectBookingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<HotelBookingDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        String reason = request != null ? request.getReason() : null;
        HotelBookingDto rejected = bookingService.rejectHotelBooking(bookingReference, reason, principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<HotelBookingDto>builder()
                .success(true)
                .message("Booking request rejected")
                .data(rejected)
                .timestamp(Instant.now())
                .build());
    }

    /**
     * Partner verifies check-in QR token / booking reference for arrival at property.
     */
    @PostMapping("/verify-qr")
    public ResponseEntity<ApiResponse<HotelBookingDto>> verifyQr(
            @Valid @RequestBody VerifyQrRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<HotelBookingDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        HotelBookingDto verified = bookingService.verifyQrAndGetBooking(request.getToken(), principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<HotelBookingDto>builder()
                .success(true)
                .message("QR token verified successfully. Reservation details matched.")
                .data(verified)
                .timestamp(Instant.now())
                .build());
    }

    /**
     * Partner executes guest check-in at reception.
     */
    @PostMapping("/bookings/{bookingReference}/checkin")
    public ResponseEntity<ApiResponse<HotelBookingDto>> checkinGuest(
            @PathVariable("bookingReference") String bookingReference,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<HotelBookingDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        HotelBookingDto checkedIn = bookingService.checkinGuest(bookingReference, principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<HotelBookingDto>builder()
                .success(true)
                .message("Guest successfully checked in at hotel reception")
                .data(checkedIn)
                .timestamp(Instant.now())
                .build());
    }

    /**
     * Partner executes guest check-out at departure.
     */
    @PostMapping("/bookings/{bookingReference}/checkout")
    public ResponseEntity<ApiResponse<HotelBookingDto>> checkoutGuest(
            @PathVariable("bookingReference") String bookingReference,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<HotelBookingDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        HotelBookingDto checkedOut = bookingService.checkoutGuest(bookingReference, principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<HotelBookingDto>builder()
                .success(true)
                .message("Guest successfully checked out. Stay marked as completed.")
                .data(checkedOut)
                .timestamp(Instant.now())
                .build());
    }
}
