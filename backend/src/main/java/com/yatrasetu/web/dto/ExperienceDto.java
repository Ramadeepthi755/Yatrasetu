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
public class ExperienceDto {
    private String id;
    private String hostId;
    private String hostName;
    private String hostRoleTitle;
    private String hostAvatarUrl;
    private BigDecimal hostRating;
    private String hostCityName;
    private String destinationId;
    private String destinationName;
    private String cityId;
    private String cityName;
    private String title;
    private String description;
    private String category;
    private BigDecimal durationHours;
    private BigDecimal pricePerPerson;
    private Integer maxGroupSize;
    private List<String> includedItems;
    private String requirements;
    private List<String> languages;
    private String coverImageUrl;
    private Boolean isApproved;
    private Boolean isActive;
    private Boolean isDemoData;
    private String culturalTraditionId;
    private String culturalTraditionName;
    private String status;
    private String verificationStatus;
    private String verificationNotes;
    private String verifiedBy;
    private java.time.Instant verifiedAt;
    private List<ExperienceSupportingProviderDto> supportingProviders;
}
