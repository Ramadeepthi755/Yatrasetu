package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantDto {
    private String id;
    private String destinationId;
    private String name;
    private String cuisineType;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal rating;
    private Integer reviewsCount;
    private Boolean isVerified;
    private String sourceType;
    private String sourceLabel;
    private String phone;
    private String website;
    private String openingHours;
    private String priceRange;
}
