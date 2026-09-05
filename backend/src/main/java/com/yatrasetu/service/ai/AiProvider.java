package com.yatrasetu.service.ai;

import java.util.Map;

public interface AiProvider {

    String getProviderName();

    boolean isAvailable();

    String generateChatResponse(String systemPrompt, String userMessage, Map<String, Object> context);

    String generateItineraryJson(String systemPrompt, String userPrompt);
}
