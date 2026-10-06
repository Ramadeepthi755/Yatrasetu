package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuideApplicationSubmitRequest {
    private String guideName;
    private String email;
    private String category;
    private String businessName;
    private String operatingState;
    private String operatingCity;
    private String address;
    private String description;
    private String skills;
    private String indicativePricing;
    private String languages;
    private String linkedinUrl;
    private String instagramUrl;
    private Boolean digilockerVerified;
    private String aadhaarLast4;
    private String residencyCity;
    private Integer residencyYears;
    private String residencyProofRef;
}
