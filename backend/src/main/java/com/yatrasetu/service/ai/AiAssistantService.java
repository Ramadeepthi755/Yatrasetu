package com.yatrasetu.service.ai;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.web.dto.AiChatRequest;
import com.yatrasetu.web.dto.AiChatResponse;
import com.yatrasetu.web.dto.SuggestedQuestionsResponse;

public interface AiAssistantService {

    AiChatResponse chat(AiChatRequest request, UserPrincipal principal);

    SuggestedQuestionsResponse getSuggestedQuestions(UserPrincipal principal, String destinationId, String path);
}
