package com.yatrasetu.service.ai;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.domain.Destination;
import com.yatrasetu.repository.DestinationRepository;
import com.yatrasetu.web.dto.AiChatRequest;
import com.yatrasetu.web.dto.AiChatResponse;
import com.yatrasetu.web.dto.SuggestedQuestionsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiAssistantServiceImpl implements AiAssistantService {

    private final GeminiAiProvider geminiAiProvider;
    private final DeterministicFallbackAiProvider fallbackAiProvider;
    private final AiContextRetrievalService contextRetrievalService;
    private final DestinationRepository destinationRepository;

    private static final String SYSTEM_PROMPT = """
            You are YatraSetu AI, an expert, authentic Indian heritage travel assistant.
            You must ONLY provide facts grounded in the provided YatraSetu data context.
            ZERO-HALLUCINATION RULE:
            - Never invent restaurant names, business names, phone numbers, websites, live taxi fares, or hotel room availability.
            - If data is unavailable in the context, explicitly state: "Information is currently unavailable from our verified listings."
            - Never fabricate fallback business listings.
            - Respect the user's role (GUEST, TRAVELER, PARTNER, GOVERNMENT).
            - Recommend visiting real POIs with known entry fees and typical visit durations.
            
            GOVERNMENT INTELLIGENCE RULES:
            - When answering a GOVERNMENT user, use ONLY the provided structured YatraSetu intelligence (destination scores, activity pressure proxies, redistribution opportunities).
            - Always refer to crowd indices as "Activity Pressure proxy" or "Platform Activity Indicator", NOT physical sensor counts or physical footfall.
            - Never invent official government statistics, tourist arrival counts, or revenue metrics.
            - If asked for official data not present in the context, state clearly: "YatraSetu does not currently have an official source for that statistic."
            """;

    @Override
    public AiChatResponse chat(AiChatRequest request, UserPrincipal principal) {
        // 1. Role derivation strictly on the server side
        String role = (principal != null && principal.getRole() != null)
                ? principal.getRole().name()
                : "GUEST";

        String userMessage = request.getMessage() != null ? request.getMessage().trim() : "";
        if (userMessage.isEmpty()) {
            userMessage = "Tell me about this destination";
        }

        // 2. Safe page context extraction (informational only)
        String destinationId = null;
        String cityId = null;
        if (request.getPageContext() != null) {
            destinationId = request.getPageContext().getDestinationId();
            cityId = request.getPageContext().getCityId();
        }

        // 3. Retrieve verified YatraSetu facts
        Map<String, Object> factsContext = contextRetrievalService.retrieveContext(userMessage, destinationId, cityId, role);

        // 4. Generate response with provider failover
        String replyText;
        String providerName;
        boolean isFallback = false;

        if (geminiAiProvider.isAvailable()) {
            try {
                replyText = geminiAiProvider.generateChatResponse(SYSTEM_PROMPT, userMessage, factsContext);
                providerName = geminiAiProvider.getProviderName();
            } catch (Exception e) {
                log.warn("Gemini AI provider failed or errored: {}. Switching to deterministic fallback engine.", e.getMessage());
                replyText = fallbackAiProvider.generateChatResponse(SYSTEM_PROMPT, userMessage, factsContext);
                providerName = fallbackAiProvider.getProviderName();
                isFallback = true;
            }
        } else {
            replyText = fallbackAiProvider.generateChatResponse(SYSTEM_PROMPT, userMessage, factsContext);
            providerName = fallbackAiProvider.getProviderName();
            isFallback = true;
        }

        // 5. Build entity references for quick navigation in chat
        List<AiChatResponse.AiEntityReference> entities = extractEntityReferences(factsContext);

        // 6. Build suggested follow-up actions
        List<String> suggestedActions = buildSuggestedActions(role, (String) factsContext.get("destinationName"));

        return AiChatResponse.builder()
                .message(replyText)
                .conversationId(request.getConversationId() != null ? request.getConversationId() : UUID.randomUUID().toString())
                .role(role)
                .provider(providerName)
                .fallback(isFallback)
                .disclaimer("Grounded in YatraSetu verified dataset and Open-Meteo live API. Zero hallucination enforced.")
                .relevantEntities(entities)
                .suggestedActions(suggestedActions)
                .build();
    }

    @Override
    public SuggestedQuestionsResponse getSuggestedQuestions(UserPrincipal principal, String destinationId, String path) {
        String role = (principal != null && principal.getRole() != null)
                ? principal.getRole().name()
                : "GUEST";

        String destName = null;
        if (destinationId != null && !destinationId.trim().isEmpty()) {
            destName = destinationRepository.findById(destinationId).map(Destination::getDestinationName).orElse(null);
        }

        List<String> questions = new ArrayList<>();

        if (destName != null) {
            switch (role) {
                case "PARTNER" -> {
                    questions.add(String.format("What experiences are in high demand in %s?", destName));
                    questions.add("How do I complete host verification?");
                    questions.add(String.format("What are tourist safety guidelines for %s?", destName));
                }
                case "GOVERNMENT" -> {
                    questions.add(String.format("Explain the health score and activity pressure for %s", destName));
                    questions.add(String.format("Which compatible alternative destinations could absorb demand from %s?", destName));
                    questions.add(String.format("What is the local partner ecosystem capacity in %s?", destName));
                }
                case "TRAVELER" -> {
                    questions.add(String.format("Plan a 3-day itinerary for %s with verified POIs", destName));
                    questions.add(String.format("What authentic dishes should I try in %s?", destName));
                    questions.add(String.format("What is the current weather and best time of day to visit %s?", destName));
                    questions.add(String.format("What is an honest budget estimate for %s?", destName));
                }
                default -> { // GUEST
                    questions.add(String.format("What are the top UNESCO heritage spots in %s?", destName));
                    questions.add(String.format("What regional food is famous in %s?", destName));
                    questions.add("How do I save a trip itinerary?");
                }
            }
        } else {
            switch (role) {
                case "PARTNER" -> {
                    questions.add("How do local partners get verified on YatraSetu?");
                    questions.add("What are the requirements for listing a heritage homestay?");
                    questions.add("How can I connect with travelers requesting local guides?");
                }
                case "GOVERNMENT" -> {
                    questions.add("Which destinations are currently showing high activity pressure?");
                    questions.add("Where should tourism demand be redistributed according to YatraSetu?");
                    questions.add("Which underutilized destinations have strong local partner capacity?");
                    questions.add("Show tourism demand trends across the ecosystem");
                }
                case "TRAVELER" -> {
                    questions.add("What are the best heritage destinations to visit this month?");
                    questions.add("How does the Smart AI Trip Planner calculate budgets?");
                    questions.add("Recommend peaceful destinations with rich architecture");
                }
                default -> { // GUEST
                    questions.add("What destinations can I explore on YatraSetu?");
                    questions.add("Which cities have the most UNESCO World Heritage Sites?");
                    questions.add("Why should I create a YatraSetu traveler account?");
                }
            }
        }

        return SuggestedQuestionsResponse.builder()
                .role(role)
                .destinationId(destinationId)
                .destinationName(destName)
                .questions(questions)
                .build();
    }

    private List<AiChatResponse.AiEntityReference> extractEntityReferences(Map<String, Object> context) {
        List<AiChatResponse.AiEntityReference> list = new ArrayList<>();
        String destId = (String) context.get("destinationId");
        String destName = (String) context.get("destinationName");
        if (destId != null && destName != null) {
            list.add(AiChatResponse.AiEntityReference.builder()
                    .type("DESTINATION")
                    .id(destId)
                    .name(destName)
                    .url("/destinations/" + destId)
                    .subtitle("Destination Hub")
                    .build());
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> pois = (List<Map<String, Object>>) context.get("pois");
        if (pois != null) {
            for (Map<String, Object> poi : pois.stream().limit(3).toList()) {
                list.add(AiChatResponse.AiEntityReference.builder()
                        .type("POI")
                        .id((String) poi.get("id"))
                        .name((String) poi.get("name"))
                        .url("/destinations/" + destId + "#pois")
                        .subtitle((String) poi.get("category"))
                        .build());
            }
        }
        return list;
    }

    private List<String> buildSuggestedActions(String role, String destName) {
        List<String> actions = new ArrayList<>();
        if ("GUEST".equals(role)) {
            actions.add("Sign In to Save Trips");
            actions.add("Explore Destinations");
        } else if ("TRAVELER".equals(role)) {
            if (destName != null) {
                actions.add("Plan Trip to " + destName);
                actions.add("View Local Hosts in " + destName);
            } else {
                actions.add("Plan a New Trip");
                actions.add("View My Trips");
            }
        } else if ("PARTNER".equals(role)) {
            actions.add("Partner Dashboard");
            actions.add("Host Verification Status");
        } else if ("GOVERNMENT".equals(role)) {
            actions.add("Tourism Analytics");
            actions.add("Compliance Guidelines");
        }
        return actions;
    }
}
