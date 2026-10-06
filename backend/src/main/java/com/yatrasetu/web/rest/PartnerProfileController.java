package com.yatrasetu.web.rest;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.service.UserService;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.PartnerProfileDto;
import com.yatrasetu.web.dto.UpdatePartnerProfileRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/partner/profile")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PARTNER')")
public class PartnerProfileController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<PartnerProfileDto>> getCurrentPartnerProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required"));
        }

        PartnerProfileDto profile = userService.getPartnerProfile(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<PartnerProfileDto>> updateCurrentPartnerProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdatePartnerProfileRequest request) {
        
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required"));
        }

        PartnerProfileDto updatedProfile = userService.updatePartnerProfile(principal.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Partner profile updated successfully", updatedProfile));
    }
}
