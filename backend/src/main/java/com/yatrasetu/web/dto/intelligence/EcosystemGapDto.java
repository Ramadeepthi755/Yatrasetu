package com.yatrasetu.web.dto.intelligence;

import com.yatrasetu.domain.intelligence.EcosystemGapType;
import com.yatrasetu.domain.intelligence.IntelligenceSourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EcosystemGapDto {
    private String id;
    private String destinationId;
    private String destinationName;
    private String stateName;
    private String cityName;
    private EcosystemGapType gapType;
    private String severity; // HIGH, MEDIUM, LOW
    private String description;
    private String suggestedIntervention;
    private long observedDemand;
    private long hostCount;
    private long hotelCount;
    private long experienceCount;
    private IntelligenceSourceType sourceType;
    private Instant detectedAt;
    private String disclaimer;
}
