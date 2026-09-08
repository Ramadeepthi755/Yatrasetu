package com.yatrasetu.web.rest;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.domain.Role;
import com.yatrasetu.service.HotelBookingService;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.CancelHotelBookingRequest;
import com.yatrasetu.web.dto.CreateHotelBookingRequest;
import com.yatrasetu.web.dto.HotelBookingDto;
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
@RequiredArgsConstructor
@Slf4j
public class HotelBookingController {

    private final HotelBookingService bookingService;

    /**
     * Create a new hotel reservation (Traveler only).
     * Returns PENDING_PAYMENT / UNPAID booking with immutable price snapshot and active allocations.
     */
    @PostMapping("/api/v1/hotels/{hotelId}/bookings")
    @PreAuthorize("hasRole('TRAVELER')")
    public ResponseEntity<ApiResponse<HotelBookingDto>> createBooking(
            @PathVariable("hotelId") String hotelId,
            @Valid @RequestBody CreateHotelBookingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<HotelBookingDto>builder()
                            .success(false)
                            .message("Authentication required to create a booking")
                            .timestamp(Instant.now())
                            .build());
        }

        if (principal.getRole() != Role.TRAVELER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.<HotelBookingDto>builder()
                            .success(false)
                            .message("Only authenticated travelers can create hotel bookings")
                            .timestamp(Instant.now())
                            .build());
        }

        HotelBookingDto booking = bookingService.createBooking(hotelId, request, principal.getUserId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<HotelBookingDto>builder()
                        .success(true)
                        .message("Booking reservation created successfully. Status: PENDING_PAYMENT")
                        .data(booking)
                        .timestamp(Instant.now())
                        .build());
    }

    /**
     * Retrieve all bookings for the authenticated traveler (My Trips integration).
     */
    @GetMapping("/api/v1/bookings/my-bookings")
    @PreAuthorize("hasRole('TRAVELER')")
    public ResponseEntity<ApiResponse<List<HotelBookingDto>>> getMyBookings(
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<List<HotelBookingDto>>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        List<HotelBookingDto> bookings = bookingService.getMyBookings(principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<List<HotelBookingDto>>builder()
                .success(true)
                .message("Retrieved traveler bookings successfully")
                .data(bookings)
                .timestamp(Instant.now())
                .build());
    }

    /**
     * Get booking details by booking reference.
     * Enforces RBAC: traveler owner, partner hotel owner, or admin.
     */
    @GetMapping("/api/v1/bookings/{bookingReference}")
    public ResponseEntity<ApiResponse<HotelBookingDto>> getBookingByReference(
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

        HotelBookingDto booking = bookingService.getBookingByReference(
                bookingReference, principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<HotelBookingDto>builder()
                .success(true)
                .message("Retrieved booking details successfully")
                .data(booking)
                .timestamp(Instant.now())
                .build());
    }

    /**
     * Cancel an active or pending reservation (Traveler owner only).
     */
    @PostMapping("/api/v1/bookings/{bookingReference}/cancel")
    @PreAuthorize("hasRole('TRAVELER')")
    public ResponseEntity<ApiResponse<HotelBookingDto>> cancelBooking(
            @PathVariable("bookingReference") String bookingReference,
            @RequestBody(required = false) CancelHotelBookingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<HotelBookingDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        HotelBookingDto cancelled = bookingService.cancelBooking(
                bookingReference, request, principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<HotelBookingDto>builder()
                .success(true)
                .message("Booking cancelled successfully and inventory allocations released")
                .data(cancelled)
                .timestamp(Instant.now())
                .build());
    }

    /**
     * Get booking confirmation snapshot and timeline.
     * Enforces RBAC: traveler owner, partner owner, or authorized admin/gov.
     */
    @GetMapping("/api/v1/bookings/{bookingReference}/confirmation")
    public ResponseEntity<ApiResponse<com.yatrasetu.web.dto.BookingConfirmationDto>> getBookingConfirmation(
            @PathVariable("bookingReference") String bookingReference,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<com.yatrasetu.web.dto.BookingConfirmationDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        com.yatrasetu.web.dto.BookingConfirmationDto confirmation = bookingService.getBookingConfirmation(
                bookingReference, principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<com.yatrasetu.web.dto.BookingConfirmationDto>builder()
                .success(true)
                .message("Booking confirmation retrieved successfully")
                .data(confirmation)
                .timestamp(Instant.now())
                .build());
    }

    /**
     * Download authoritative PDF booking voucher.
     * Enforces RBAC: strictly traveler owner and partner hotel owner.
     */
    @GetMapping("/api/v1/bookings/{bookingReference}/voucher")
    public ResponseEntity<byte[]> downloadBookingVoucher(
            @PathVariable("bookingReference") String bookingReference,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        byte[] pdfBytes = bookingService.generateBookingVoucher(bookingReference, principal.getUserId());

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"YatraSetu-Voucher-" + bookingReference + ".pdf\"")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
