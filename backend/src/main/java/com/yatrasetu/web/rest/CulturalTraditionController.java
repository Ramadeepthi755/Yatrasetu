package com.yatrasetu.web.rest;

import com.yatrasetu.service.CulturalTraditionService;
import com.yatrasetu.service.ExperienceService;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.CulturalTraditionDto;
import com.yatrasetu.web.dto.ExperienceDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/culture")
@RequiredArgsConstructor
public class CulturalTraditionController {

    private final CulturalTraditionService culturalTraditionService;
    private final ExperienceService experienceService;

    @GetMapping("/traditions")
    public ResponseEntity<ApiResponse<Page<CulturalTraditionDto>>> getAllTraditions(
            @RequestParam(required = false) String stateId,
            @RequestParam(required = false) String cityId,
            @RequestParam(required = false) String destinationId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "traditionName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<CulturalTraditionDto> result = culturalTraditionService.getAllTraditions(
                stateId, cityId, destinationId, category, search, pageable);

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/traditions/{id}")
    public ResponseEntity<ApiResponse<CulturalTraditionDto>> getTraditionById(@PathVariable String id) {
        CulturalTraditionDto dto = culturalTraditionService.getTraditionById(id);
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @GetMapping("/traditions/{id}/experiences")
    public ResponseEntity<ApiResponse<List<ExperienceDto>>> getExperiencesByTradition(@PathVariable String id) {
        List<ExperienceDto> experiences = experienceService.getExperiencesByCulturalTradition(id);
        return ResponseEntity.ok(ApiResponse.ok(experiences));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        List<String> categories = culturalTraditionService.getCategories();
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }

    @GetMapping("/states/{stateId}")
    public ResponseEntity<ApiResponse<List<CulturalTraditionDto>>> getTraditionsByState(@PathVariable String stateId) {
        List<CulturalTraditionDto> traditions = culturalTraditionService.getTraditionsByState(stateId);
        return ResponseEntity.ok(ApiResponse.ok(traditions));
    }

    @GetMapping("/destinations/{destinationId}")
    public ResponseEntity<ApiResponse<List<CulturalTraditionDto>>> getTraditionsByDestination(@PathVariable String destinationId) {
        List<CulturalTraditionDto> traditions = culturalTraditionService.getTraditionsByDestination(destinationId);
        return ResponseEntity.ok(ApiResponse.ok(traditions));
    }
}
