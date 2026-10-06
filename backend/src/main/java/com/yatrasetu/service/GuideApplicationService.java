package com.yatrasetu.service;

import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.web.dto.GuideApplicationDto;
import com.yatrasetu.web.dto.GuideApplicationSubmitRequest;
import com.yatrasetu.web.dto.GuideReviewRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GuideApplicationService {

    private final GuideApplicationRepository guideApplicationRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final LocalHostRepository localHostRepository;

    @Transactional
    public GuideApplicationDto submitApplication(String userId, GuideApplicationSubmitRequest request) {
        User user = userRepository.findById(userId).orElse(null);

        GuideApplication app = guideApplicationRepository.findByUserId(userId)
                .orElseGet(() -> GuideApplication.builder()
                        .id("gapp-" + UUID.randomUUID().toString().substring(0, 8))
                        .user(user)
                        .createdAt(Instant.now())
                        .build());

        app.setGuideName(request.getGuideName() != null ? request.getGuideName() : (user != null ? user.getFullName() : "Guide Candidate"));
        app.setEmail(request.getEmail() != null ? request.getEmail() : (user != null ? user.getEmail() : null));
        app.setCategory(request.getCategory() != null ? request.getCategory() : "GUIDE");
        app.setBusinessName(request.getBusinessName());
        app.setOperatingState(request.getOperatingState());
        app.setOperatingCity(request.getOperatingCity());
        app.setAddress(request.getAddress());
        app.setDescription(request.getDescription());
        app.setSkills(request.getSkills());
        app.setIndicativePricing(request.getIndicativePricing());
        app.setLanguages(request.getLanguages());
        app.setLinkedinUrl(request.getLinkedinUrl());
        app.setInstagramUrl(request.getInstagramUrl());
        app.setDigilockerVerified(Boolean.TRUE.equals(request.getDigilockerVerified()));

        // Mask Aadhaar to last 4 digits only
        if (request.getAadhaarLast4() != null && !request.getAadhaarLast4().isEmpty()) {
            String digits = request.getAadhaarLast4().replaceAll("\\D", "");
            app.setAadhaarLast4(digits.length() > 4 ? digits.substring(digits.length() - 4) : digits);
        }

        app.setResidencyCity(request.getResidencyCity());
        app.setResidencyYears(request.getResidencyYears());
        app.setResidencyProofRef(request.getResidencyProofRef());
        app.setStatus("PENDING_REVIEW");
        app.setSubmittedAt(Instant.now());
        app.setUpdatedAt(Instant.now());

        GuideApplication saved = guideApplicationRepository.save(app);

        // Update User & Profile verification status
        if (user != null) {
            user.setVerificationStatus(VerificationStatus.PENDING);
            user.setVerified(false);
            user.setUpdatedAt(Instant.now());
            userRepository.save(user);

            Profile profile = profileRepository.findById(userId).orElse(null);
            if (profile != null) {
                profile.setVerificationStatus(VerificationStatus.PENDING);
                if (request.getBusinessName() != null) profile.setBusinessName(request.getBusinessName());
                if (request.getOperatingCity() != null) profile.setCity(request.getOperatingCity());
                if (request.getOperatingState() != null) profile.setState(request.getOperatingState());
                profile.setUpdatedAt(Instant.now());
                profileRepository.save(profile);
            }
        }

        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public GuideApplicationDto getMyApplication(String userId) {
        return guideApplicationRepository.findByUserId(userId)
                .map(this::toDto)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId).orElse(null);
                    if (user == null) return null;
                    Profile profile = profileRepository.findById(userId).orElse(null);
                    return GuideApplicationDto.builder()
                            .id("gapp-draft")
                            .userId(userId)
                            .guideName(user.getFullName())
                            .email(user.getEmail())
                            .category("GUIDE")
                            .operatingCity(profile != null ? profile.getCity() : null)
                            .operatingState(profile != null ? profile.getState() : null)
                            .status("DRAFT")
                            .build();
                });
    }

    @Transactional(readOnly = true)
    public List<GuideApplicationDto> getAllApplications() {
        return guideApplicationRepository.findAllByOrderBySubmittedAtDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GuideApplicationDto getApplicationById(String id) {
        return guideApplicationRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Guide application not found with ID: " + id));
    }

    @Transactional
    public GuideApplicationDto reviewApplication(String reviewerId, String applicationId, GuideReviewRequest request) {
        GuideApplication app = guideApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Guide application not found with ID: " + applicationId));

        String decision = request.getDecision();
        String finalStatus = ("APPROVED".equalsIgnoreCase(decision) || "VERIFIED".equalsIgnoreCase(decision)) ? "VERIFIED" : "REJECTED";

        app.setStatus(finalStatus);
        app.setReviewerNotes(request.getReviewerNotes());
        app.setReviewedBy(reviewerId);
        app.setReviewedAt(Instant.now());
        app.setUpdatedAt(Instant.now());

        GuideApplication saved = guideApplicationRepository.save(app);

        // Update corresponding User, Profile, LocalHost records
        if (app.getUser() != null) {
            User user = app.getUser();
            boolean isVerified = "VERIFIED".equals(finalStatus);
            user.setVerificationStatus(isVerified ? VerificationStatus.APPROVED : VerificationStatus.REJECTED);
            user.setVerified(isVerified);
            user.setUpdatedAt(Instant.now());
            userRepository.save(user);

            Profile profile = profileRepository.findById(user.getId()).orElse(null);
            if (profile != null) {
                profile.setVerificationStatus(isVerified ? VerificationStatus.APPROVED : VerificationStatus.REJECTED);
                profile.setUpdatedAt(Instant.now());
                profileRepository.save(profile);
            }

            localHostRepository.findByUserId(user.getId()).ifPresent(host -> {
                host.setIsVerified(isVerified);
                host.setUpdatedAt(Instant.now());
                localHostRepository.save(host);
            });
        }

        return toDto(saved);
    }

    private GuideApplicationDto toDto(GuideApplication app) {
        return GuideApplicationDto.builder()
                .id(app.getId())
                .userId(app.getUser() != null ? app.getUser().getId() : null)
                .guideName(app.getGuideName())
                .email(app.getEmail())
                .category(app.getCategory())
                .businessName(app.getBusinessName())
                .operatingState(app.getOperatingState())
                .operatingCity(app.getOperatingCity())
                .address(app.getAddress())
                .description(app.getDescription())
                .skills(app.getSkills())
                .indicativePricing(app.getIndicativePricing())
                .languages(app.getLanguages())
                .linkedinUrl(app.getLinkedinUrl())
                .instagramUrl(app.getInstagramUrl())
                .digilockerVerified(app.getDigilockerVerified())
                .aadhaarLast4(app.getAadhaarLast4())
                .residencyCity(app.getResidencyCity())
                .residencyYears(app.getResidencyYears())
                .residencyProofRef(app.getResidencyProofRef())
                .status(app.getStatus())
                .reviewerNotes(app.getReviewerNotes())
                .reviewedBy(app.getReviewedBy())
                .reviewedAt(app.getReviewedAt())
                .submittedAt(app.getSubmittedAt())
                .build();
    }
}
