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
    }

    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<UserProfileDto>> syncUser(@Valid @RequestBody SyncUserRequest request) {
        User user = userService.syncUser(
                request.getAuthUserId(),
                request.getEmail(),
                request.getFullName(),
                request.getRole(),
                request.getPartnerSubtype()
        );
        UserProfileDto dto = userService.getUserProfile(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("User session synchronized successfully", dto));
    }
}
