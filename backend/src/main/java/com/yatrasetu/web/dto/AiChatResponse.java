package com.yatrasetu.web.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AiChatResponse {

    private String message;
    private String conversationId;
    private String role; // GUEST, TRAVELER, PARTNER, GOVERNMENT
    @Builder.Default
    private List<String> suggestedActions = new ArrayList<>();
    @Builder.Default
    private List<AiEntityReference> relevantEntities = new ArrayList<>();
    private boolean fallback;
    private String provider;
    private String disclaimer;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiEntityReference {
        private String type; // DESTINATION, POI, FOOD, HOTEL, EXPERIENCE, HOST
        private String id;
        private String name;
        private String url;
        private String subtitle;
    }
}
