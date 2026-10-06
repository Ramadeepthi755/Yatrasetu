package com.yatrasetu.service.ai;

import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class OpenAiProvider implements AiProvider {

    @Override
    public String getProviderName() {
        return "OpenAI";
    }

    @Override
    public boolean isAvailable() {
        return false;
    }

    @Override
    public String generateChatResponse(String systemPrompt, String userMessage, Map<String, Object> context) {
        throw new UnsupportedOperationException("OpenAI provider is not configured. Falling back to primary provider.");
    }

    @Override
    public String generateItineraryJson(String systemPrompt, String userPrompt) {
        throw new UnsupportedOperationException("OpenAI provider is not configured.");
    }
}
