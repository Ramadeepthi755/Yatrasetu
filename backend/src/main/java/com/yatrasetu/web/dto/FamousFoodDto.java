package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FamousFoodDto {
    private String id;
    private String destinationId;
    private String dishName;
    private String description;
    private Boolean isVegetarian;
    private String cuisineType;
    private String imageUrl;
    private String sourceType;
    private String sourceLabel;
}
