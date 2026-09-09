package com.yatrasetu.web.rest;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.service.NotificationService;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.NotificationDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Retrieve notifications for the authenticated user.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getMyNotifications(
            @RequestParam(value = "unreadOnly", defaultValue = "false") boolean unreadOnly,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<List<NotificationDto>>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        List<NotificationDto> notifications = notificationService.getUserNotifications(
                principal.getUserId(), unreadOnly);

        return ResponseEntity.ok(ApiResponse.<List<NotificationDto>>builder()
                .success(true)
                .message("Retrieved notifications successfully")
                .data(notifications)
                .timestamp(Instant.now())
                .build());
    }

    /**
     * Get count of unread notifications for the authenticated user.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<Map<String, Object>>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        long count = notificationService.getUnreadCount(principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .message("Retrieved unread count successfully")
                .data(Map.of("unreadCount", count))
                .timestamp(Instant.now())
                .build());
    }

    /**
     * Mark a specific notification as read.
     */
    @PostMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationDto>> markAsRead(
            @PathVariable("id") String notificationId,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<NotificationDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        NotificationDto dto = notificationService.markAsRead(notificationId, principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<NotificationDto>builder()
                .success(true)
                .message("Notification marked as read")
                .data(dto)
                .timestamp(Instant.now())
                .build());
    }

    /**
     * Mark all notifications for the authenticated user as read.
     */
    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<Map<String, Object>>> markAllAsRead(
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<Map<String, Object>>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        int count = notificationService.markAllAsRead(principal.getUserId());

        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .message("All notifications marked as read")
                .data(Map.of("updatedCount", count))
                .timestamp(Instant.now())
                .build());
    }
}
