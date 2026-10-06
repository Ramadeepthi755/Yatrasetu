package com.yatrasetu.web.rest;

import com.yatrasetu.service.CityService;
import com.yatrasetu.service.DestinationService;
import com.yatrasetu.service.StateService;
import com.yatrasetu.web.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/states")
@RequiredArgsConstructor
public class StateController {

    private final StateService stateService;
    private final CityService cityService;
    private final DestinationService destinationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StateDto>>> getAllStates(
            @RequestParam(name = "region", required = false) String region) {

        List<StateDto> states = stateService.getAllStates(region);
        return ResponseEntity.ok(ApiResponse.<List<StateDto>>builder()
                .success(true)
                .message("Retrieved states successfully")
                .data(states)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StateDetailDto>> getStateDetail(@PathVariable("id") String id) {
        return stateService.getStateDetail(id)
                .map(state -> ResponseEntity.ok(ApiResponse.<StateDetailDto>builder()
                        .success(true)
                        .message("Retrieved state details successfully")
                        .data(state)
                        .timestamp(Instant.now())
                        .build()))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.<StateDetailDto>builder()
                                .success(false)
                                .message("State not found with identifier: " + id)
                                .data(null)
                                .timestamp(Instant.now())
                                .build()));
    }

    @GetMapping("/{id}/cities")
    public ResponseEntity<ApiResponse<List<CityDto>>> getCitiesByState(@PathVariable("id") String id) {
        List<CityDto> cities = cityService.getCitiesByState(id);
        return ResponseEntity.ok(ApiResponse.<List<CityDto>>builder()
                .success(true)
                .message("Retrieved cities for state successfully")
                .data(cities)
                .timestamp(Instant.now())
                .build());
    }
}
