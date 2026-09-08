package com.yatrasetu.web.rest;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.service.TravelConnectService;
import com.yatrasetu.web.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/travel-connect")
@RequiredArgsConstructor
@Slf4j
public class TravelConnectController {

    private final TravelConnectService travelConnectService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TravelerDiscoveryDto>>> discoverTravelers(
            @RequestParam(required = false) String destinationId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String travelStyle,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 12, sort = "travelDate", direction = Sort.Direction.ASC) Pageable pageable) {

        String currentUserId = principal != null ? principal.getUserId() : null;
        Page<TravelerDiscoveryDto> result = travelConnectService.discoverTravelers(
                destinationId, city, travelStyle, fromDate, toDate, currentUserId, pageable);

        return ResponseEntity.ok(ApiResponse.<Page<TravelerDiscoveryDto>>builder()
                .success(true)
                .message("Discovered travelers successfully")
                .data(result)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/destination/{destinationId}")
    public ResponseEntity<ApiResponse<List<TravelerDiscoveryDto>>> getDestinationTravelers(
            @PathVariable String destinationId,
            @RequestParam(defaultValue = "4") int limit,
            @AuthenticationPrincipal UserPrincipal principal) {

        String currentUserId = principal != null ? principal.getUserId() : null;
        List<TravelerDiscoveryDto> travelers = travelConnectService.getDestinationTravelers(destinationId, limit, currentUserId);

        return ResponseEntity.ok(ApiResponse.<List<TravelerDiscoveryDto>>builder()
                .success(true)
                .message("Retrieved travelers for destination successfully")
                .data(travelers)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/{travelerId}")
    public ResponseEntity<ApiResponse<TravelerProfileDto>> getTravelerProfile(
            @PathVariable String travelerId,
            @AuthenticationPrincipal UserPrincipal principal) {

        String currentUserId = principal != null ? principal.getUserId() : null;
        TravelerProfileDto profile = travelConnectService.getTravelerProfile(travelerId, currentUserId);

        return ResponseEntity.ok(ApiResponse.<TravelerProfileDto>builder()
                .success(true)
                .message("Retrieved public travel profile successfully")
                .data(profile)
                .timestamp(Instant.now())
                .build());
    }

    @PostMapping("/requests")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ConnectionRequestDto>> sendConnectionRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateConnectionRequest request) {

        ConnectionRequestDto created = travelConnectService.sendConnectionRequest(principal.getUserId(), request);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<ConnectionRequestDto>builder()
                .success(true)
                .message("Connection request sent successfully")
                .data(created)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/requests/received")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ConnectionRequestDto>>> getReceivedRequests(
            @AuthenticationPrincipal UserPrincipal principal) {

        List<ConnectionRequestDto> requests = travelConnectService.getReceivedRequests(principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<List<ConnectionRequestDto>>builder()
                .success(true)
                .message("Retrieved received connection requests")
                .data(requests)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/requests/sent")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ConnectionRequestDto>>> getSentRequests(
            @AuthenticationPrincipal UserPrincipal principal) {

        List<ConnectionRequestDto> requests = travelConnectService.getSentRequests(principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<List<ConnectionRequestDto>>builder()
                .success(true)
                .message("Retrieved sent connection requests")
                .data(requests)
                .timestamp(Instant.now())
                .build());
    }

    @PostMapping("/requests/{id}/accept")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ConnectionRequestDto>> acceptRequest(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {

        ConnectionRequestDto accepted = travelConnectService.acceptRequest(id, principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<ConnectionRequestDto>builder()
                .success(true)
                .message("Connection request accepted")
                .data(accepted)
                .timestamp(Instant.now())
                .build());
    }

    @PostMapping("/requests/{id}/reject")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ConnectionRequestDto>> rejectRequest(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {

        ConnectionRequestDto rejected = travelConnectService.rejectRequest(id, principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<ConnectionRequestDto>builder()
                .success(true)
                .message("Connection request rejected")
                .data(rejected)
                .timestamp(Instant.now())
                .build());
    }

    @PostMapping("/requests/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ConnectionRequestDto>> cancelRequest(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {

        ConnectionRequestDto cancelled = travelConnectService.cancelRequest(id, principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<ConnectionRequestDto>builder()
                .success(true)
                .message("Connection request cancelled")
                .data(cancelled)
                .timestamp(Instant.now())
                .build());
    }

    @PostMapping("/requests/{id}/block")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ConnectionRequestDto>> blockUser(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {

        ConnectionRequestDto blocked = travelConnectService.blockUser(id, principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<ConnectionRequestDto>builder()
                .success(true)
                .message("User blocked successfully")
                .data(blocked)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/connections")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ConnectionDto>>> getConnections(
            @AuthenticationPrincipal UserPrincipal principal) {

        List<ConnectionDto> connections = travelConnectService.getConnections(principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<List<ConnectionDto>>builder()
                .success(true)
                .message("Retrieved connections successfully")
                .data(connections)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/connections/{connectionId}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<MessageDto>>> getMessages(
            @PathVariable String connectionId,
            @AuthenticationPrincipal UserPrincipal principal) {

        List<MessageDto> messages = travelConnectService.getMessages(connectionId, principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<List<MessageDto>>builder()
                .success(true)
                .message("Retrieved conversation messages")
                .data(messages)
                .timestamp(Instant.now())
                .build());
    }

    @PostMapping("/connections/{connectionId}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MessageDto>> sendMessage(
            @PathVariable String connectionId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SendMessageRequest request) {

        MessageDto sent = travelConnectService.sendMessage(connectionId, principal.getUserId(), request.getMessage());

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<MessageDto>builder()
                .success(true)
                .message("Message sent successfully")
                .data(sent)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/settings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<TravelConnectSettingsDto>> getSettings(
            @AuthenticationPrincipal UserPrincipal principal) {

        TravelConnectSettingsDto settings = travelConnectService.getSettings(principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<TravelConnectSettingsDto>builder()
                .success(true)
                .message("Retrieved Travel Connect settings")
                .data(settings)
                .timestamp(Instant.now())
                .build());
    }

    @PutMapping("/settings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<TravelConnectSettingsDto>> updateSettings(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody UpdateTravelConnectSettingsRequest request) {

        TravelConnectSettingsDto updated = travelConnectService.updateSettings(
                principal.getUserId(), request.isTravelConnectEnabled());

        return ResponseEntity.ok(ApiResponse.<TravelConnectSettingsDto>builder()
                .success(true)
                .message("Updated Travel Connect settings")
                .data(updated)
                .timestamp(Instant.now())
                .build());
    }
}
