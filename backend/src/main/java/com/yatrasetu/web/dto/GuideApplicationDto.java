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
public class GuideApplicationDto {
    private String id;
    private String userId;
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
    private String status; // PENDING_REVIEW, VERIFIED, REJECTED
    private String reviewerNotes;
    private String reviewedBy;
    private Instant reviewedAt;
    private Instant submittedAt;
}
