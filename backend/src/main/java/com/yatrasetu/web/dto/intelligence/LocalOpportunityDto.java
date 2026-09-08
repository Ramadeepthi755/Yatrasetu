package com.yatrasetu.web.dto.intelligence;

import com.yatrasetu.domain.intelligence.IntelligenceSourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocalOpportunityDto {
    private String destinationId;
    private String destinationName;
    private BigDecimal opportunityScore;
    private long verifiedHostsCount;
    private long hotelsCount;
    private long experiencesCount;
    private long restaurantsCount;
    private long rentalProvidersCount;
    private IntelligenceSourceType sourceType;
    private String explanation;
    private String disclaimer;
}
