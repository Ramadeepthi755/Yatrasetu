package com.yatrasetu.web.rest;

import com.yatrasetu.service.intelligence.CulturalOpportunityService;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.intelligence.CulturalOpportunityDto;
import com.yatrasetu.web.dto.intelligence.CulturalOpportunityOverviewDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/government/cultural-opportunities")
@RequiredArgsConstructor
@PreAuthorize("hasRole('GOVERNMENT')")
public class GovernmentCulturalOpportunityController {

    private final CulturalOpportunityService culturalOpportunityService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CulturalOpportunityDto>>> getCulturalOpportunities(
            @RequestParam(name = "includeDemo", defaultValue = "false") boolean includeDemo) {
        List<CulturalOpportunityDto> opportunities = culturalOpportunityService.calculateAllCulturalOpportunities(includeDemo);
        return ResponseEntity.ok(ApiResponse.ok(opportunities));
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<CulturalOpportunityOverviewDto>> getOverview(
            @RequestParam(name = "includeDemo", defaultValue = "false") boolean includeDemo) {
        CulturalOpportunityOverviewDto overview = culturalOpportunityService.getOverview(includeDemo);
        return ResponseEntity.ok(ApiResponse.ok(overview));
    }

    @GetMapping("/{destinationId}")
    public ResponseEntity<ApiResponse<CulturalOpportunityDto>> getDestinationOpportunity(
            @PathVariable("destinationId") String destinationId,
            @RequestParam(name = "includeDemo", defaultValue = "false") boolean includeDemo) {
        CulturalOpportunityDto dto = culturalOpportunityService.calculateDestinationOpportunity(destinationId, includeDemo);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }
}
