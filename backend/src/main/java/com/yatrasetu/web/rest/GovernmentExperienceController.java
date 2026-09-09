package com.yatrasetu.web.rest;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.service.ExperienceService;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.ExperienceDto;
import com.yatrasetu.web.dto.ExperienceVerificationRequest;
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
@RequestMapping("/api/v1/government/experiences")
@RequiredArgsConstructor
@PreAuthorize("hasRole('GOVERNMENT')")
public class GovernmentExperienceController {

    private final ExperienceService experienceService;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<ExperienceDto>>> getPendingReviewExperiences(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<List<ExperienceDto>>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        List<ExperienceDto> pending = experienceService.getPendingReviewExperiences();
        return ResponseEntity.ok(ApiResponse.<List<ExperienceDto>>builder()
                .success(true)
                .message("Retrieved pending verification experiences successfully")
                .data(pending)
                .timestamp(Instant.now())
                .build());
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<ApiResponse<ExperienceDto>> reviewExperience(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") String id,
            @Valid @RequestBody ExperienceVerificationRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<ExperienceDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        ExperienceDto verified = experienceService.verifyExperience(principal.getUserId(), id, request);
        return ResponseEntity.ok(ApiResponse.<ExperienceDto>builder()
                .success(true)
                .message("Experience verification processed successfully")
                .data(verified)
                .timestamp(Instant.now())
                .build());
    }
}
