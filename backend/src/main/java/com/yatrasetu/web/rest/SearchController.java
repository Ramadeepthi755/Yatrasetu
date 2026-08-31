package com.yatrasetu.web.rest;

import com.yatrasetu.service.SearchService;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.SearchResultsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<ApiResponse<SearchResultsDto>> search(
            @RequestParam(name = "q", required = false) String query,
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "limit", defaultValue = "10") int limit) {

        SearchResultsDto results = searchService.search(query, category, limit);
        return ResponseEntity.ok(ApiResponse.<SearchResultsDto>builder()
                .success(true)
                .message("Search completed successfully")
                .data(results)
                .timestamp(Instant.now())
                .build());
    }
}
