package com.yatrasetu.web.rest;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.service.TripService;
import com.yatrasetu.service.ai.AiAssistantService;
import com.yatrasetu.web.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiAssistantController {

    private final AiAssistantService aiAssistantService;
    private final TripService tripService;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<AiChatResponse>> chat(
            @RequestBody AiChatRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        
        AiChatResponse response = aiAssistantService.chat(request, principal);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/suggested-questions")
    public ResponseEntity<ApiResponse<SuggestedQuestionsResponse>> getSuggestedQuestions(
            @RequestParam(required = false) String destinationId,
            @RequestParam(required = false) String path,
            @AuthenticationPrincipal UserPrincipal principal) {
        
        SuggestedQuestionsResponse response = aiAssistantService.getSuggestedQuestions(principal, destinationId, path);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/plan-trip")
    public ResponseEntity<ApiResponse<TripDto>> planTrip(
            @Valid @RequestBody TripPlanRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        
        TripDto trip = tripService.planTrip(request, principal);
        return ResponseEntity.ok(ApiResponse.ok("Trip plan generated successfully", trip));
    }
}
