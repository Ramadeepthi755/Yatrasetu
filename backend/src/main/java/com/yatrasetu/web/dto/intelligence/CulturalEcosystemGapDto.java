package com.yatrasetu.web.dto.intelligence;

import com.yatrasetu.domain.intelligence.EcosystemGapType;
import com.yatrasetu.domain.intelligence.IntelligenceSourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CulturalEcosystemGapDto {

    private String id;
    private String destinationId;
    private String destinationName;
    private String stateId;
    private String stateName;
    private String cityId;
    private String cityName;

    private EcosystemGapType gapType;
    private String severity; // CRITICAL, HIGH, MEDIUM, LOW, INSUFFICIENT_DATA
    private String description;
    private String suggestedIntervention;

    // Platform context
    private BigDecimal opportunityScore;
    private int traditionCount;
    private int giTraditionCount;
    private long observedDemandSignals;
    private int verifiedExperienceCount;
    private int verifiedArtisanCount;

    private IntelligenceSourceType sourceType;
    private String disclaimer;
    private Instant detectedAt;
}
