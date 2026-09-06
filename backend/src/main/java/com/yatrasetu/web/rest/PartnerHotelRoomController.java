package com.yatrasetu.web.rest;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.service.HotelRoomService;
import com.yatrasetu.web.dto.*;
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
@RequestMapping("/api/v1/partner/hotels/{hotelId}/rooms")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PARTNER')")
public class PartnerHotelRoomController {

    private final HotelRoomService hotelRoomService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<HotelRoomTypeDto>>> getRooms(
            @PathVariable("hotelId") String hotelId,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<List<HotelRoomTypeDto>>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        List<HotelRoomTypeDto> rooms = hotelRoomService.getPartnerRoomTypes(hotelId, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<List<HotelRoomTypeDto>>builder()
                .success(true)
                .message("Retrieved room types successfully")
                .data(rooms)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<ApiResponse<HotelRoomTypeDto>> getRoomById(
            @PathVariable("hotelId") String hotelId,
            @PathVariable("roomId") String roomId,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<HotelRoomTypeDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        HotelRoomTypeDto room = hotelRoomService.getPartnerRoomTypeById(hotelId, roomId, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<HotelRoomTypeDto>builder()
                .success(true)
                .message("Retrieved room type details successfully")
                .data(room)
                .timestamp(Instant.now())
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HotelRoomTypeDto>> createRoom(
            @PathVariable("hotelId") String hotelId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateRoomTypeRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<HotelRoomTypeDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        HotelRoomTypeDto created = hotelRoomService.createRoomType(hotelId, request, principal.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<HotelRoomTypeDto>builder()
                        .success(true)
                        .message("Room type created successfully")
                        .data(created)
                        .timestamp(Instant.now())
                        .build());
    }

    @PutMapping("/{roomId}")
    public ResponseEntity<ApiResponse<HotelRoomTypeDto>> updateRoom(
            @PathVariable("hotelId") String hotelId,
            @PathVariable("roomId") String roomId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateRoomTypeRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<HotelRoomTypeDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        HotelRoomTypeDto updated = hotelRoomService.updateRoomType(hotelId, roomId, request, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<HotelRoomTypeDto>builder()
                .success(true)
                .message("Room type updated successfully")
                .data(updated)
                .timestamp(Instant.now())
                .build());
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(
            @PathVariable("hotelId") String hotelId,
            @PathVariable("roomId") String roomId,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<Void>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        hotelRoomService.deleteRoomType(hotelId, roomId, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Room type deleted successfully")
                .data(null)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/{roomId}/inventory")
    public ResponseEntity<ApiResponse<List<HotelInventoryDto>>> getInventory(
            @PathVariable("hotelId") String hotelId,
            @PathVariable("roomId") String roomId,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<List<HotelInventoryDto>>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        List<HotelInventoryDto> inventory = hotelRoomService.getRoomInventory(hotelId, roomId, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<List<HotelInventoryDto>>builder()
                .success(true)
                .message("Retrieved room inventory successfully")
                .data(inventory)
                .timestamp(Instant.now())
                .build());
    }

    @PostMapping("/{roomId}/inventory")
    public ResponseEntity<ApiResponse<HotelInventoryDto>> updateInventory(
            @PathVariable("hotelId") String hotelId,
            @PathVariable("roomId") String roomId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateInventoryRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<HotelInventoryDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        HotelInventoryDto updated = hotelRoomService.updateRoomInventory(hotelId, roomId, request, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<HotelInventoryDto>builder()
                .success(true)
                .message("Room inventory updated successfully")
                .data(updated)
                .timestamp(Instant.now())
                .build());
    }
}
