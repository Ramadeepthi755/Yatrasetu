package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuideMatchResponseDto {
    private List<RecommendedGuideDto> matches;
    private boolean exactMatchFound;
    private String message;
    private List<String> relaxationSuggestions; // e.g. "Relax budget constraint", "Relax language constraint"
}
