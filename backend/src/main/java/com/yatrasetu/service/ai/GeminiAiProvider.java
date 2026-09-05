package com.yatrasetu.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Pattern;

@Slf4j
@Component
public class GeminiAiProvider implements AiProvider {

    @Value("${app.gemini.api-key:}")
    private String apiKey;

    @Value("${app.gemini.model:gemini-flash-latest}")
    private String modelName;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Defensive patterns against prompt injection and jailbreak attempts
    private static final List<Pattern> INJECTION_PATTERNS = List.of(
            Pattern.compile("ignore (all|the|previous) (instructions|prompts|rules)", Pattern.CASE_INSENSITIVE),
            Pattern.compile("disregard (all|the|previous)", Pattern.CASE_INSENSITIVE),
            Pattern.compile("system prompt", Pattern.CASE_INSENSITIVE),
            Pattern.compile("you are now in (developer|god|dan|jailbreak) mode", Pattern.CASE_INSENSITIVE),
            Pattern.compile("act as (root|unrestricted|an unfiltered)", Pattern.CASE_INSENSITIVE),
            Pattern.compile("reveal (api[_-]?key|secret|password|token)", Pattern.CASE_INSENSITIVE)
    );

    @Override
    public String getProviderName() {
        return "Google Gemini (" + modelName + ")";
    }

    @Override
    public boolean isAvailable() {
        return apiKey != null && !apiKey.trim().isEmpty();
    }

    @Override
    public String generateChatResponse(String systemPrompt, String userMessage, Map<String, Object> context) {
        if (!isAvailable()) {
            throw new IllegalStateException("Gemini API key is not configured.");
        }

        // 1. Guard against prompt injection
        if (detectPromptInjection(userMessage)) {
            log.warn("Prompt injection pattern detected in user query.");
            return "I am the YatraSetu AI Assistant, dedicated strictly to providing authentic, verified travel guidance for Indian heritage destinations. I cannot fulfill requests that alter safety rules, system prompts, or security boundaries.";
        }

        try {
            String endpoint = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                    modelName, apiKey);

            // Construct Gemini Request Body
            Map<String, Object> requestBody = new HashMap<>();

            // System instruction
            Map<String, Object> systemPart = Map.of("text", systemPrompt + "\n\nVERIFIED YATRASETU DATA CONTEXT:\n" + formatContextForGemini(context));
            requestBody.put("systemInstruction", Map.of("parts", List.of(systemPart)));

            // User contents
            Map<String, Object> userPart = Map.of("text", userMessage);
            Map<String, Object> contentObj = Map.of("role", "user", "parts", List.of(userPart));
            requestBody.put("contents", List.of(contentObj));

            // Generation config
            requestBody.put("generationConfig", Map.of(
                    "temperature", 0.3,
                    "topP", 0.8,
                    "maxOutputTokens", 1024
            ));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);

            ResponseEntity<String> response = restTemplate.postForEntity(endpoint, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && !candidates.isEmpty()) {
                    JsonNode parts = candidates.get(0).path("content").path("parts");
                    if (parts.isArray() && !parts.isEmpty()) {
                        return parts.get(0).path("text").asText();
                    }
                }
            }
        } catch (Exception e) {
            log.error("Gemini API request failed: {}", e.getMessage());
            throw new RuntimeException("Gemini API call failed: " + e.getMessage(), e);
        }

        throw new RuntimeException("Empty response received from Gemini API");
    }

    @Override
    public String generateItineraryJson(String systemPrompt, String userPrompt) {
        if (!isAvailable()) {
            throw new IllegalStateException("Gemini API key is not configured.");
        }

        try {
            String endpoint = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                    modelName, apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("systemInstruction", Map.of("parts", List.of(Map.of("text", systemPrompt))));
            requestBody.put("contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", userPrompt)))));
            requestBody.put("generationConfig", Map.of(
                    "temperature", 0.2,
                    "responseMimeType", "application/json"
            ));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);

            ResponseEntity<String> response = restTemplate.postForEntity(endpoint, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && !candidates.isEmpty()) {
                    return candidates.get(0).path("content").path("parts").get(0).path("text").asText();
                }
            }
        } catch (Exception e) {
            log.error("Gemini itinerary generation failed: {}", e.getMessage());
            throw new RuntimeException("Gemini itinerary generation failed: " + e.getMessage(), e);
        }

        throw new RuntimeException("Empty response received from Gemini API");
    }

    private boolean detectPromptInjection(String input) {
        if (input == null) return false;
        for (Pattern p : INJECTION_PATTERNS) {
            if (p.matcher(input).find()) {
                return true;
            }
        }
        return false;
    }

    private String formatContextForGemini(Map<String, Object> context) {
        if (context == null || context.isEmpty()) return "No specific destination context provided.";
        try {
            return objectMapper.writeValueAsString(context);
        } catch (Exception e) {
            return context.toString();
        }
    }
}
