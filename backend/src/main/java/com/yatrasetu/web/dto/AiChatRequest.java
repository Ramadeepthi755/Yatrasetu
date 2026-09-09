package com.yatrasetu.web.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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

    @NotBlank(message = "Message cannot be blank")
    @Size(max = 2000, message = "Message must not exceed 2000 characters")
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
