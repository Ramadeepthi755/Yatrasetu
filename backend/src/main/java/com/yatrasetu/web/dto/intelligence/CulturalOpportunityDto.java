package com.yatrasetu.web.dto.intelligence;

import com.yatrasetu.domain.intelligence.CulturalOpportunityClassification;
import com.yatrasetu.domain.intelligence.CulturalSupplyDemandMatrixCategory;
import com.yatrasetu.domain.intelligence.IntelligenceSourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CulturalOpportunityDto {

    private String destinationId;
    private String destinationName;
    private String cityId;
    private String cityName;
    private String stateId;
    private String stateName;

    private BigDecimal score;
    private String status; // SUFFICIENT_DATA or INSUFFICIENT_DATA
    private String confidence; // HIGH, MEDIUM, LOW, INSUFFICIENT
    private CulturalOpportunityClassification classification;
    private CulturalSupplyDemandMatrixCategory matrixCategory;

    // Component scores
    private BigDecimal traditionScore; // 0 - 30
    private BigDecimal demandScore;    // 0 - 35
    private BigDecimal supplyScore;    // 0 - 25
    private BigDecimal gapPenalty;     // 0 - 20

    // Underlying counts
    private int traditionCount;
    private int destinationTraditionCount;
    private int cityTraditionCount;
    private int stateTraditionCount;
    private int giTraditionCount;

    private long observedDemandSignals;
    private int verifiedExperienceCount;
    private int verifiedArtisanCount;

    private List<String> detectedGaps;
    private List<String> explanations;
    private List<String> suggestedActions;

    private IntelligenceSourceType dataMode;
    private String disclaimer;
    private Instant generatedAt;
}
