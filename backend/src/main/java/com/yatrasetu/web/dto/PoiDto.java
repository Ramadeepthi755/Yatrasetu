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
public class PoiDto {
    private String id;
    private String poiName;
    private String destinationId;
    private String destinationName;
    private String cityId;
    private String cityName;
    private String category;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private List<String> tags;
    private String characteristics;
    private BigDecimal entryFeeInr;
    private BigDecimal typicalDurationHours;
}
