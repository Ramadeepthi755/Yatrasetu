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
public class ExperienceSupportingProviderDto {
    private String id;
    private String experienceId;
    private String providerId;
    private String providerName;
    private String providerType; // ARTISAN, HOTEL, LOCAL_BUSINESS, GUIDE, RESTAURANT
    private String roleDescription;
    private String status; // INVITED, ACCEPTED, DECLINED
    private String notes;
    private Instant createdAt;
}
