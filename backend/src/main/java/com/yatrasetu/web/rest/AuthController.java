package com.yatrasetu.web.rest;

import com.yatrasetu.domain.PartnerSubtype;
import com.yatrasetu.domain.Role;
import com.yatrasetu.domain.User;
import com.yatrasetu.service.UserService;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.UserProfileDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @Data
    public static class SyncUserRequest {
        private String authUserId;
        @NotBlank(message = "Email is required")
        @Email(message = "Valid email is required")
        private String email;
        private String fullName;
        private Role role;
        private PartnerSubtype partnerSubtype;
        private Boolean createIfNotFound;
    }

    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<UserProfileDto>> syncUser(@Valid @RequestBody SyncUserRequest request) {
        boolean createIfNotFound = Boolean.TRUE.equals(request.getCreateIfNotFound());
        try {
            User user = userService.syncUser(
                    request.getAuthUserId(),
                    request.getEmail(),
                    request.getFullName(),
                    request.getRole(),
                    request.getPartnerSubtype(),
                    createIfNotFound
            );
            UserProfileDto dto = userService.getUserProfile(user.getId());
            return ResponseEntity.ok(ApiResponse.ok("User session synchronized successfully", dto));
        } catch (IllegalArgumentException e) {
            if (e.getMessage() != null && e.getMessage().contains("NO_YATRASETU_PROFILE")) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("NO_YATRASETU_PROFILE: No YatraSetu account found for this identity."));
            }
            throw e;
        }
    }
}
