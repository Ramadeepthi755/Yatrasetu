package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StateDto {
    private String id;
    private String stateName;
    private String region;
    private String capitalCity;
    private String description;
    private String bannerImageUrl;
    private long cityCount;
    private long destinationCount;
}
