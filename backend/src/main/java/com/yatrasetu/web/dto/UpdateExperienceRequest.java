package com.yatrasetu.web.dto;

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
public class UpdateExperienceRequest {
    private String destinationId;
    private String cityId;
    private String culturalTraditionId;
    private String title;
    private String description;
    private String category;
    private BigDecimal durationHours;
    private BigDecimal pricePerPerson;
    private Integer maxGroupSize;
    private List<String> includedItems;
    private String requirements;
    private List<String> languages;
    private String coverImageUrl;
    private Boolean isActive;
    private String status;
}
