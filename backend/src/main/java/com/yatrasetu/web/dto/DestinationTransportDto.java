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
public class DestinationTransportDto {
    private String id;
    private String destinationId;
    private String mode;
    private String name;
    private BigDecimal distanceKm;
    private String description;
    private String roadCondition;
    private String priceType;
    private BigDecimal estimatedFareInr;
    private String sourceType;
    private String sourceLabel;
}
