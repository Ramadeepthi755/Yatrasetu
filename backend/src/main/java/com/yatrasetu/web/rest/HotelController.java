package com.yatrasetu.web.rest;

import com.yatrasetu.service.HotelService;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.HotelDto;
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
@RequestMapping("/api/v1/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;
    private final com.yatrasetu.service.HotelRoomService hotelRoomService;
    private final com.yatrasetu.service.HotelRatePlanService hotelRatePlanService;
    private final com.yatrasetu.service.HotelAvailabilityService hotelAvailabilityService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<HotelDto>>> getAllHotels(
            @RequestParam(name = "cityId", required = false) String cityId,
            @RequestParam(name = "destinationId", required = false) String destinationId,
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "minRating", required = false) BigDecimal minRating,
            @RequestParam(name = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(name = "isPartnerProperty", required = false) Boolean isPartnerProperty,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "12") int size,
            @RequestParam(name = "sort", defaultValue = "hotelRating") String sortBy,
            @RequestParam(name = "direction", defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<HotelDto> result = hotelService.getAllHotels(
                cityId, destinationId, category, minRating, maxPrice, isPartnerProperty, search, pageable);

        return ResponseEntity.ok(ApiResponse.<Page<HotelDto>>builder()
                .success(true)
                .message("Retrieved hotels successfully")
                .data(result)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HotelDto>> getHotelById(@PathVariable("id") String id) {
        return hotelService.getHotelById(id)
                .map(hotel -> ResponseEntity.ok(ApiResponse.<HotelDto>builder()
                        .success(true)
                        .message("Retrieved hotel details successfully")
                        .data(hotel)
                        .timestamp(Instant.now())
                        .build()))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.<HotelDto>builder()
                                .success(false)
                                .message("Hotel not found with id: " + id)
                                .data(null)
                                .timestamp(Instant.now())
                                .build()));
    }

    @GetMapping("/{id}/rooms")
    public ResponseEntity<ApiResponse<List<com.yatrasetu.web.dto.HotelRoomTypeDto>>> getHotelRooms(@PathVariable("id") String id) {
        List<com.yatrasetu.web.dto.HotelRoomTypeDto> rooms = hotelRoomService.getPublicRoomTypes(id);
        return ResponseEntity.ok(ApiResponse.<List<com.yatrasetu.web.dto.HotelRoomTypeDto>>builder()
                .success(true)
                .message("Retrieved hotel room types successfully")
                .data(rooms)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/{id}/rate-plans")
    public ResponseEntity<ApiResponse<List<com.yatrasetu.web.dto.HotelRatePlanDto>>> getHotelRatePlans(@PathVariable("id") String id) {
        List<com.yatrasetu.web.dto.HotelRatePlanDto> ratePlans = hotelRatePlanService.getPublicRatePlansForHotel(id);
        return ResponseEntity.ok(ApiResponse.<List<com.yatrasetu.web.dto.HotelRatePlanDto>>builder()
                .success(true)
                .message("Retrieved hotel rate plans successfully")
                .data(ratePlans)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/{id}/rooms/{roomId}/rate-plans")
    public ResponseEntity<ApiResponse<List<com.yatrasetu.web.dto.HotelRatePlanDto>>> getRoomRatePlans(
            @PathVariable("id") String id,
            @PathVariable("roomId") String roomId) {
        List<com.yatrasetu.web.dto.HotelRatePlanDto> ratePlans = hotelRatePlanService.getPublicRatePlansForRoomType(id, roomId);
        return ResponseEntity.ok(ApiResponse.<List<com.yatrasetu.web.dto.HotelRatePlanDto>>builder()
                .success(true)
                .message("Retrieved room rate plans successfully")
                .data(ratePlans)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<com.yatrasetu.web.dto.HotelAvailabilityDto>> getHotelAvailability(
            @PathVariable("id") String id,
            @RequestParam(name = "roomTypeId", required = false) String roomTypeId,
            @RequestParam(name = "checkIn") @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate checkIn,
            @RequestParam(name = "checkOut") @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate checkOut,
            @RequestParam(name = "guests", required = false) Integer guests) {

        com.yatrasetu.web.dto.HotelAvailabilityDto availability = hotelAvailabilityService.getHotelAvailability(id, roomTypeId, checkIn, checkOut, guests);
        return ResponseEntity.ok(ApiResponse.<com.yatrasetu.web.dto.HotelAvailabilityDto>builder()
                .success(true)
                .message("Retrieved hotel availability successfully")
                .data(availability)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        List<String> categories = hotelService.getCategories();
        return ResponseEntity.ok(ApiResponse.<List<String>>builder()
                .success(true)
                .message("Retrieved hotel categories successfully")
                .data(categories)
                .timestamp(Instant.now())
                .build());
    }
}
