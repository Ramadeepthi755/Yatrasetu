package com.yatrasetu.web.rest;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.service.GuideApplicationService;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.GuideApplicationDto;
import com.yatrasetu.web.dto.GuideApplicationSubmitRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/guide/application")
@RequiredArgsConstructor
public class GuideApplicationController {

    private final GuideApplicationService guideApplicationService;

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<GuideApplicationDto>> submitApplication(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody GuideApplicationSubmitRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required to submit guide application"));
        }

        GuideApplicationDto result = guideApplicationService.submitApplication(principal.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Guide verification application submitted successfully", result));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<GuideApplicationDto>> getMyApplication(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        GuideApplicationDto app = guideApplicationService.getMyApplication(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.ok("Retrieved current guide application", app));
    }
}
