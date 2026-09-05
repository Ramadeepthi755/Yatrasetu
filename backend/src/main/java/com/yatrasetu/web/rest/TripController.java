package com.yatrasetu.web.rest;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.service.TripService;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.TripDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @PostMapping
    public ResponseEntity<ApiResponse<TripDto>> saveTrip(
            @RequestBody TripDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required to save trip"));
        }

        TripDto savedTrip = tripService.saveTrip(dto, principal);
        return ResponseEntity.ok(ApiResponse.ok("Trip saved successfully", savedTrip));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TripDto>>> getMyTrips(
            @AuthenticationPrincipal UserPrincipal principal) {
        
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required to view trips"));
        }

        List<TripDto> trips = tripService.getMyTrips(principal);
        return ResponseEntity.ok(ApiResponse.ok(trips));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TripDto>> getTripById(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required to view trip"));
        }

        TripDto trip = tripService.getTripById(id, principal);
        return ResponseEntity.ok(ApiResponse.ok(trip));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTrip(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required to delete trip"));
        }

        tripService.deleteTrip(id, principal);
        return ResponseEntity.ok(ApiResponse.ok("Trip deleted successfully", null));
    }
}
