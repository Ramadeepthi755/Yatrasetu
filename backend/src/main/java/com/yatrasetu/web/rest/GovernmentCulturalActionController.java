package com.yatrasetu.web.rest;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.domain.User;
import com.yatrasetu.domain.intelligence.EcosystemGapType;
import com.yatrasetu.domain.intelligence.GovernmentActionPriority;
import com.yatrasetu.domain.intelligence.GovernmentActionStatus;
import com.yatrasetu.repository.UserRepository;
import com.yatrasetu.service.intelligence.CulturalActionEngineService;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.intelligence.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/government/cultural-actions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('GOVERNMENT')")
public class GovernmentCulturalActionController {

    private final CulturalActionEngineService actionEngineService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CulturalGovernmentActionDto>>> getCulturalActions(
            @RequestParam(name = "status", required = false) GovernmentActionStatus status,
            @RequestParam(name = "priority", required = false) GovernmentActionPriority priority,
            @RequestParam(name = "gapType", required = false) EcosystemGapType gapType,
            @RequestParam(name = "includeDemo", defaultValue = "false") boolean includeDemo) {
        List<CulturalGovernmentActionDto> actions = actionEngineService.getCulturalActions(status, priority, gapType, includeDemo);
        return ResponseEntity.ok(ApiResponse.ok(actions));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CulturalGovernmentActionDto>> getCulturalActionById(
            @PathVariable("id") String id,
            @RequestParam(name = "includeDemo", defaultValue = "false") boolean includeDemo) {
        CulturalGovernmentActionDto action = actionEngineService.getCulturalActionById(id, includeDemo);
        if (action == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.ok(action));
    }

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<List<CulturalGovernmentActionDto>>> generateCulturalActions(
            @RequestParam(name = "includeDemo", defaultValue = "false") boolean includeDemo,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        List<CulturalGovernmentActionDto> actions = actionEngineService.generateAndSyncCulturalActions(includeDemo, user);
        return ResponseEntity.ok(ApiResponse.ok(actions));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<CulturalGovernmentActionDto>> updateActionStatus(
            @PathVariable("id") String id,
            @RequestBody GovernmentActionStatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        CulturalGovernmentActionDto updated = actionEngineService.updateActionStatus(
                id,
                request.getStatus(),
                request.getResolutionNotes(),
                user
        );
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.ok(updated));
    }

    // Cultural Gap endpoints
    @GetMapping("/gaps")
    public ResponseEntity<ApiResponse<List<CulturalEcosystemGapDto>>> getCulturalGaps(
            @RequestParam(name = "includeDemo", defaultValue = "false") boolean includeDemo) {
        List<CulturalEcosystemGapDto> gaps = actionEngineService.detectAndSyncCulturalGaps(includeDemo);
        return ResponseEntity.ok(ApiResponse.ok(gaps));
    }

    @GetMapping("/gaps/overview")
    public ResponseEntity<ApiResponse<CulturalEcosystemGapOverviewDto>> getCulturalGapsOverview(
            @RequestParam(name = "includeDemo", defaultValue = "false") boolean includeDemo) {
        CulturalEcosystemGapOverviewDto overview = actionEngineService.getGapsOverview(includeDemo);
        return ResponseEntity.ok(ApiResponse.ok(overview));
    }

    @GetMapping("/gaps/{destinationId}")
    public ResponseEntity<ApiResponse<List<CulturalEcosystemGapDto>>> getDestinationCulturalGaps(
            @PathVariable("destinationId") String destinationId,
            @RequestParam(name = "includeDemo", defaultValue = "false") boolean includeDemo) {
        List<CulturalEcosystemGapDto> gaps = actionEngineService.detectAndSyncCulturalGaps(includeDemo).stream()
                .filter(g -> g.getDestinationId().equals(destinationId))
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(gaps));
    }
}
