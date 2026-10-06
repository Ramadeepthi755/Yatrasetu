package com.yatrasetu.web.rest;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.service.UserService;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.GovernmentOverviewDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/government")
@RequiredArgsConstructor
@PreAuthorize("hasRole('GOVERNMENT')")
public class GovernmentController {

    private final UserService userService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<GovernmentOverviewDto>> getGovernmentOverview(
            @AuthenticationPrincipal UserPrincipal principal) {
        
        GovernmentOverviewDto overview = userService.getGovernmentOverview();
        return ResponseEntity.ok(ApiResponse.ok(overview));
    }
}
