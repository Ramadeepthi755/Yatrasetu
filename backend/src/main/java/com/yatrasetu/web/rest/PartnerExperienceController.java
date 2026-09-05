package com.yatrasetu.web.rest;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.service.ExperienceService;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.CreateExperienceRequest;
import com.yatrasetu.web.dto.ExperienceDto;
import com.yatrasetu.web.dto.UpdateExperienceRequest;
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
@RequestMapping("/api/v1/partner/experiences")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PARTNER')")
public class PartnerExperienceController {

    private final ExperienceService experienceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExperienceDto>>> getMyExperiences(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<List<ExperienceDto>>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        List<ExperienceDto> experiences = experienceService.getMyExperiences(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<List<ExperienceDto>>builder()
                .success(true)
                .message("Retrieved partner experiences successfully")
                .data(experiences)
                .timestamp(Instant.now())
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ExperienceDto>> createExperience(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateExperienceRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<ExperienceDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        ExperienceDto created = experienceService.createExperience(principal.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<ExperienceDto>builder()
                        .success(true)
                        .message("Experience created successfully")
                        .data(created)
                        .timestamp(Instant.now())
                        .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExperienceDto>> updateExperience(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") String id,
            @Valid @RequestBody UpdateExperienceRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<ExperienceDto>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        ExperienceDto updated = experienceService.updateExperience(principal.getUserId(), id, request);
        return ResponseEntity.ok(ApiResponse.<ExperienceDto>builder()
                .success(true)
                .message("Experience updated successfully")
                .data(updated)
                .timestamp(Instant.now())
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExperience(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") String id) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<Void>builder()
                            .success(false)
                            .message("Authentication required")
                            .timestamp(Instant.now())
                            .build());
        }

        experienceService.deleteExperience(principal.getUserId(), id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Experience deleted successfully")
                .data(null)
                .timestamp(Instant.now())
                .build());
    }
}
