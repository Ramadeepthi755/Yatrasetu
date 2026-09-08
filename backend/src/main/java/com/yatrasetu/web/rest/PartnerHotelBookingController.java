package com.yatrasetu.web.rest;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.service.HotelBookingService;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.HotelBookingDto;
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
     * Retrieve bookings for a specific hotel owned by the authenticated partner.
     * Sensitive traveler PII (phone/email) is masked.
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
}
