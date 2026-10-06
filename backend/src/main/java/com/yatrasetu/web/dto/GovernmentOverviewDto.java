package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GovernmentOverviewDto {
    private String authority;
    private long totalTravelers;
    private long totalPartners;
    private long pendingPartnerVerifications;
    private long approvedPartners;
    private long availableDestinations;
    private String message;
    @Builder.Default
    private Instant timestamp = Instant.now();
}
