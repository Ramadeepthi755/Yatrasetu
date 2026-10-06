package com.yatrasetu.web.rest;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.service.GuideApplicationService;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.GuideApplicationDto;
import com.yatrasetu.web.dto.GuideReviewRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/government/guides")
@RequiredArgsConstructor
@PreAuthorize("hasRole('GOVERNMENT')")
public class GovernmentGuideController {

    private final GuideApplicationService guideApplicationService;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<GuideApplicationDto>>> getPendingGuideApplications(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        List<GuideApplicationDto> list = guideApplicationService.getAllApplications();
        return ResponseEntity.ok(ApiResponse.ok("Retrieved pending guide verification applications successfully", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GuideApplicationDto>> getGuideApplicationById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") String id) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        GuideApplicationDto app = guideApplicationService.getApplicationById(id);
        return ResponseEntity.ok(ApiResponse.ok("Retrieved guide application details successfully", app));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<ApiResponse<GuideApplicationDto>> reviewGuideApplication(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") String id,
            @Valid @RequestBody GuideReviewRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        GuideApplicationDto updated = guideApplicationService.reviewApplication(principal.getUserId(), id, request);
        return ResponseEntity.ok(ApiResponse.ok("Guide application review processed successfully", updated));
    }
}
