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
public class HotelDto {
    private String id;
    private String hotelName;
    private String cityId;
    private String cityName;
    private String stateId;
    private String stateName;
    private String destinationId;
    private String destinationName;
    private BigDecimal hotelRating;
    private BigDecimal pricePerNight;
    private List<String> amenities;
    private String category;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Boolean isPartnerProperty;
    private String inventoryType;
    private String sourceType;
    private String sourceLabel;
}
