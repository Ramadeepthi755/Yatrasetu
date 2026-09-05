package com.yatrasetu.web.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AiChatRequest {

    private String message;
    private String conversationId;
    private PageContext pageContext;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PageContext {
        private String path;
        private String destinationId;
        private String cityId;
        private String destinationName;
        private Map<String, Object> filters;
    }
}
