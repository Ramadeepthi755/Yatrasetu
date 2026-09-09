package com.yatrasetu.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Profile {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    @Column(name = "display_name", length = 150)
    private String displayName;

    @Column(name = "profile_image_url", columnDefinition = "TEXT")
    private String profileImageUrl;

    @Column(name = "home_city", length = 100)
    private String homeCity;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "preferred_language", length = 50)
    private String preferredLanguage;

    @Column(name = "travel_style", length = 50)
    @Builder.Default
    private String travelStyle = "Explorer";

    @Column(name = "budget_preference", length = 50)
    @Builder.Default
    private String budgetPreference = "Mid-Range";

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "travel_connect_enabled")
    @Builder.Default
    private boolean travelConnectEnabled = true;

    @Column(name = "business_name", length = 200)
    private String businessName;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", length = 30)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Column(name = "emergency_contact", length = 50)
    private String emergencyContact;

    @Convert(converter = com.yatrasetu.domain.converter.StringListConverter.class)
    @Column(name = "languages", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> languages = new ArrayList<>();

    @Convert(converter = com.yatrasetu.domain.converter.StringListConverter.class)
    @Column(name = "interests", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> interests = new ArrayList<>();

    @Convert(converter = com.yatrasetu.domain.converter.StringListConverter.class)
    @Column(name = "partner_skills", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> partnerSkills = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

}
