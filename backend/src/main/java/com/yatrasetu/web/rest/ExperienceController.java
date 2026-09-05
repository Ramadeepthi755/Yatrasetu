package com.yatrasetu.web.rest;

import com.yatrasetu.service.ExperienceService;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.ExperienceDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/experiences")
@RequiredArgsConstructor
public class ExperienceController {

    private final ExperienceService experienceService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ExperienceDto>>> getAllExperiences(
            @RequestParam(name = "destinationId", required = false) String destinationId,
            @RequestParam(name = "cityId", required = false) String cityId,
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(name = "language", required = false) String language,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "12") int size,
            @RequestParam(name = "sort", defaultValue = "createdAt") String sortBy,
            @RequestParam(name = "direction", defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ExperienceDto> result = experienceService.getAllExperiences(
                destinationId, cityId, category, maxPrice, language, search, pageable);

        return ResponseEntity.ok(ApiResponse.<Page<ExperienceDto>>builder()
                .success(true)
                .message("Retrieved experiences successfully")
                .data(result)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExperienceDto>> getExperienceById(@PathVariable("id") String id) {
        return experienceService.getExperienceById(id)
                .map(exp -> ResponseEntity.ok(ApiResponse.<ExperienceDto>builder()
                        .success(true)
                        .message("Retrieved experience successfully")
                        .data(exp)
                        .timestamp(Instant.now())
                        .build()))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.<ExperienceDto>builder()
                                .success(false)
                                .message("Experience not found with id: " + id)
                                .data(null)
                                .timestamp(Instant.now())
                                .build()));
    }

    @GetMapping("/destination/{destinationId}")
    public ResponseEntity<ApiResponse<List<ExperienceDto>>> getExperiencesByDestination(
            @PathVariable("destinationId") String destinationId) {
        List<ExperienceDto> experiences = experienceService.getExperiencesByDestination(destinationId);
        return ResponseEntity.ok(ApiResponse.<List<ExperienceDto>>builder()
                .success(true)
                .message("Retrieved experiences for destination successfully")
                .data(experiences)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/host/{hostId}")
    public ResponseEntity<ApiResponse<List<ExperienceDto>>> getExperiencesByHost(
            @PathVariable("hostId") String hostId) {
        List<ExperienceDto> experiences = experienceService.getExperiencesByHost(hostId);
        return ResponseEntity.ok(ApiResponse.<List<ExperienceDto>>builder()
                .success(true)
                .message("Retrieved experiences for host successfully")
                .data(experiences)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        List<String> categories = experienceService.getCategories();
        return ResponseEntity.ok(ApiResponse.<List<String>>builder()
                .success(true)
                .message("Retrieved experience categories successfully")
                .data(categories)
                .timestamp(Instant.now())
                .build());
    }
}
