package com.yatrasetu.web.dto.intelligence;

import com.yatrasetu.domain.intelligence.EcosystemGapType;
import com.yatrasetu.domain.intelligence.GovernmentActionPriority;
import com.yatrasetu.domain.intelligence.GovernmentActionStatus;
import com.yatrasetu.domain.intelligence.GovernmentActionType;
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
public class CulturalGovernmentActionDto {

    private String id;
    private String destinationId;
    private String destinationName;
    private String stateId;
    private String stateName;
    private String cityId;
    private String cityName;

    private EcosystemGapType gapType;
    private GovernmentActionType actionType;
    private GovernmentActionPriority priority;
    private GovernmentActionStatus status;

    private String title;
    private String recommendedIntervention;
    private String whyRecommendedReason;

    // Opportunity metrics
    private BigDecimal opportunityScore;
    private BigDecimal traditionScore;
    private BigDecimal demandScore;
    private BigDecimal supplyScore;
    private BigDecimal gapPenalty;

    private int traditionCount;
    private int giTraditionCount;
    private long observedDemandSignals;
    private int verifiedExperienceCount;
    private int verifiedArtisanCount;

    private String notes;
    private String resolutionNotes;
    private Instant resolvedAt;
    private String userFullName;
    private String userId;

    private List<String> evidenceBullets;
    private String disclaimer;
    private Instant createdAt;
    private Instant updatedAt;
}
