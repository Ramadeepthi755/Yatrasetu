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
public class SuggestedQuestionsResponse {

    private String role;
    private String destinationId;
    private String destinationName;
    @Builder.Default
    private List<String> questions = new ArrayList<>();
}
