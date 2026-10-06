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
public class LocalHostDetailDto {
    private String id;
    private String userId;
    private String name;
    private String stateId;
    private String stateName;
    private String cityId;
    private String cityName;
    private String destinationId;
    private String destinationName;
    private List<String> languages;
    private List<String> skills;
    private List<String> interests;
    private String roleTitle;
    private BigDecimal pricePerHour;
    private BigDecimal rating;
    private Integer experienceCount;
    private String availability;
    private Boolean isVerified;
    private Boolean isDemoData;
    private String about;
    private String avatarUrl;
    private List<ExperienceDto> experiences;
}
