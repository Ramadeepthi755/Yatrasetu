package com.yatrasetu.service.ai;

import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class AnthropicAiProvider implements AiProvider {

    @Override
    public String getProviderName() {
        return "Anthropic";
    }

    @Override
    public boolean isAvailable() {
        return false;
    }

    @Override
    public String generateChatResponse(String systemPrompt, String userMessage, Map<String, Object> context) {
        throw new UnsupportedOperationException("Anthropic provider is not configured. Falling back to primary provider.");
    }

    @Override
    public String generateItineraryJson(String systemPrompt, String userPrompt) {
        throw new UnsupportedOperationException("Anthropic provider is not configured.");
    }
}
