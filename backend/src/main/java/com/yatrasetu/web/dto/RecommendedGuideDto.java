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
public class RecommendedGuideDto {
    private LocalHostDto guide;
    private double matchScore;
    private List<String> matchReasons;
    private List<ExperienceDto> availableExperiences;
}
