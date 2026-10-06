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
public class GuideMatchFilterRequest {
    private String destinationId;
    private String cityId;
    private List<String> interests;
    private List<String> languages;
    private BigDecimal maxBudgetPerHour;
    private String skill;
    private Boolean verifiedOnly;
}
