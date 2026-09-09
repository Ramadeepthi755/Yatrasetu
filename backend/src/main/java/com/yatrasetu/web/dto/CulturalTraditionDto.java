package com.yatrasetu.web.dto;

import com.yatrasetu.domain.CulturalTradition;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CulturalTraditionDto {

    private String id;
    private String stateId;
    private String stateName;
    private String cityId;
    private String cityName;
    private String destinationId;
    private String destinationName;
    private String traditionName;
    private String category;
    private String craftType;
    private String historicalOrigin;
    private String materialsUsed;
    private String culturalSignificance;
    private Boolean isGiTagged;
    private String giTagYear;
    private String primaryProducingCluster;
    private String sourceOrganization;
    private String sourceType;
    private String sourceLabel;
    private String sourceUrl;
    private String imageUrl;
    private String provenance;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;

    public static CulturalTraditionDto fromEntity(CulturalTradition entity) {
        if (entity == null) return null;

        return CulturalTraditionDto.builder()
                .id(entity.getId())
                .stateId(entity.getState() != null ? entity.getState().getId() : null)
                .stateName(entity.getState() != null ? entity.getState().getStateName() : null)
                .cityId(entity.getCity() != null ? entity.getCity().getId() : null)
                .cityName(entity.getCity() != null ? entity.getCity().getCityName() : null)
                .destinationId(entity.getDestination() != null ? entity.getDestination().getId() : null)
                .destinationName(entity.getDestination() != null ? entity.getDestination().getDestinationName() : null)
                .traditionName(entity.getTraditionName())
                .category(entity.getCategory())
                .craftType(entity.getCraftType())
                .historicalOrigin(entity.getHistoricalOrigin())
                .materialsUsed(entity.getMaterialsUsed())
                .culturalSignificance(entity.getCulturalSignificance())
                .isGiTagged(entity.getIsGiTagged())
                .giTagYear(entity.getGiTagYear())
                .primaryProducingCluster(entity.getPrimaryProducingCluster())
                .sourceOrganization(entity.getSourceOrganization())
                .sourceType(entity.getSourceType() != null ? entity.getSourceType().name() : "OFFICIAL")
                .sourceLabel(entity.getSourceType() != null ? entity.getSourceType().name() : "Official")
                .sourceUrl(entity.getSourceUrl())
                .imageUrl(entity.getImageUrl())
                .provenance(entity.getProvenance())
                .isActive(entity.getIsActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
