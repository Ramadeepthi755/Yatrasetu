package com.yatrasetu.web.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TripPlanRequest {

    @NotBlank(message = "destinationId is required")
    private String destinationId;

    private LocalDate startDate;
    private LocalDate endDate;

    @Min(value = 1, message = "totalDays must be at least 1")
    @Max(value = 14, message = "totalDays cannot exceed 14")
    @Builder.Default
    private Integer totalDays = 3;

    @Min(value = 1, message = "travelerCount must be at least 1")
    @Builder.Default
    private Integer travelerCount = 1;

    @Builder.Default
    private String budgetTier = "Mid-Range"; // Budget, Mid-Range, Luxury

    @Builder.Default
    private String travelStyle = "Balanced"; // Relaxed, Balanced, Fast-Paced, Cultural, Nature

    @Builder.Default
    private String companions = "Solo"; // Solo, Couple, Family, Friends

    @Builder.Default
    private List<String> interests = new ArrayList<>();

    private boolean saveDirectly;
}
