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
public class CityDto {
    private String id;
    private String cityName;
    private String stateId;
    private String stateName;
    private String districtName;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String tier;
    private Boolean isTourismHub;
    private long destinationCount;
    private long poiCount;
    private long hotelCount;
}
