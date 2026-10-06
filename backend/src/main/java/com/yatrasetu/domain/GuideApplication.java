package com.yatrasetu.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "guide_applications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuideApplication {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "guide_name", length = 150, nullable = false)
    private String guideName;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "category", length = 100)
    @Builder.Default
    private String category = "GUIDE";

    @Column(name = "business_name", length = 200)
    private String businessName;

    @Column(name = "operating_state", length = 100)
    private String operatingState;

    @Column(name = "operating_city", length = 100)
    private String operatingCity;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "skills", columnDefinition = "TEXT")
    private String skills;

    @Column(name = "indicative_pricing", length = 100)
    private String indicativePricing;

    @Column(name = "languages", columnDefinition = "TEXT")
    private String languages;

    @Column(name = "linkedin_url", length = 255)
    private String linkedinUrl;

    @Column(name = "instagram_url", length = 255)
    private String instagramUrl;

    @Column(name = "digilocker_verified")
    @Builder.Default
    private Boolean digilockerVerified = false;

    @Column(name = "aadhaar_last4", length = 4)
    private String aadhaarLast4;

    @Column(name = "residency_city", length = 100)
    private String residencyCity;

    @Column(name = "residency_years")
    private Integer residencyYears;

    @Column(name = "residency_proof_ref", length = 255)
    private String residencyProofRef;

    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    private String status = "PENDING_REVIEW";

    @Column(name = "reviewer_notes", columnDefinition = "TEXT")
    private String reviewerNotes;

    @Column(name = "reviewed_by", length = 50)
    private String reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "submitted_at", nullable = false)
    @Builder.Default
    private Instant submittedAt = Instant.now();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
