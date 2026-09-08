package com.yatrasetu.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateExperienceRequest {

    private String destinationId;
    private String cityId;
    private String culturalTraditionId;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Duration in hours is required")
    @Positive(message = "Duration must be positive")
    private BigDecimal durationHours;

    @NotNull(message = "Price per person is required")
    @Positive(message = "Price must be positive")
    private BigDecimal pricePerPerson;

    private Integer maxGroupSize;
    private List<String> includedItems;
    private String requirements;
    private List<String> languages;
    private String coverImageUrl;
}
