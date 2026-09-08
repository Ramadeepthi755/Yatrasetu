package com.yatrasetu.service;

import com.yatrasetu.domain.PartnerSubtype;
import com.yatrasetu.domain.Profile;
import com.yatrasetu.domain.Role;
import com.yatrasetu.domain.User;
import com.yatrasetu.domain.VerificationStatus;
import com.yatrasetu.repository.ProfileRepository;
import com.yatrasetu.repository.UserRepository;
import com.yatrasetu.web.dto.*;
import lombok.RequiredArgsConstructor;
import jakarta.persistence.EntityManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final EntityManager entityManager;

    @Transactional
    public User syncUser(String authUserId, String email, String fullName, Role requestedRole, PartnerSubtype partnerSubtype) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty");
        }

        Optional<User> existingUser = Optional.empty();
        if (authUserId != null && !authUserId.trim().isEmpty()) {
            existingUser = userRepository.findByAuthUserId(authUserId);
        }
        if (existingUser.isEmpty()) {
            existingUser = userRepository.findByEmail(email);
        }

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            if (authUserId != null && user.getAuthUserId() == null) {
                user.setAuthUserId(authUserId);
                userRepository.save(user);
            }
            return user;
        }

        // Enforce rule: Government accounts CANNOT be created through public self-signup
        if (requestedRole == Role.GOVERNMENT) {
            throw new IllegalArgumentException("Government accounts cannot be created through public registration. Contact administration for official credentials.");
        }

        Role assignedRole = (requestedRole != null) ? requestedRole : Role.TRAVELER;
        String userId = (authUserId != null && !authUserId.trim().isEmpty()) ? authUserId : "usr-" + UUID.randomUUID().toString().substring(0, 8);

        User newUser = User.builder()
                .id(userId)
                .authUserId(authUserId)
                .email(email)
                .fullName(fullName != null && !fullName.trim().isEmpty() ? fullName : "Traveler")
                .role(assignedRole)
                .partnerSubtype(assignedRole == Role.PARTNER ? partnerSubtype : null)
                .verificationStatus(assignedRole == Role.PARTNER ? VerificationStatus.PENDING : VerificationStatus.APPROVED)
                .verified(assignedRole != Role.PARTNER)
                .active(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        Profile profile = Profile.builder()
                .id(userId)
                .user(newUser)
                .displayName(newUser.getFullName())
                .verificationStatus(newUser.getVerificationStatus())
                .languages(new ArrayList<>())
                .interests(new ArrayList<>())
                .partnerSkills(new ArrayList<>())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        newUser.setProfile(profile);
        entityManager.persist(newUser);
        return newUser;
    }

    @Transactional(readOnly = true)
    public UserProfileDto getUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        Profile profile = profileRepository.findById(userId).orElse(null);

        return UserProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .displayName(profile != null && profile.getDisplayName() != null ? profile.getDisplayName() : user.getFullName())
                .role(user.getRole())
                .avatarUrl(profile != null ? profile.getProfileImageUrl() : user.getAvatarUrl())
                .bio(profile != null ? profile.getBio() : null)
                .phone(profile != null ? profile.getPhone() : user.getPhone())
                .city(profile != null ? profile.getCity() : null)
                .state(profile != null ? profile.getState() : null)
                .preferredLanguage(profile != null ? profile.getPreferredLanguage() : null)
                .languages(profile != null && profile.getLanguages() != null ? profile.getLanguages() : new ArrayList<>())
                .interests(profile != null && profile.getInterests() != null ? profile.getInterests() : new ArrayList<>())
                .travelStyle(profile != null ? profile.getTravelStyle() : "Explorer")
                .budgetPreference(profile != null ? profile.getBudgetPreference() : "Mid-Range")
                .verified(user.isVerified())
                .build();
    }

    @Transactional
    public UserProfileDto updateUserProfile(String userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }

        Profile profile = profileRepository.findById(userId).orElseGet(() -> {
            Profile p = Profile.builder().id(userId).user(user).build();
            return profileRepository.save(p);
        });

        if (request.getDisplayName() != null) profile.setDisplayName(request.getDisplayName().trim());
        if (request.getBio() != null) profile.setBio(request.getBio().trim());
        if (request.getPhone() != null) profile.setPhone(request.getPhone().trim());
        if (request.getCity() != null) profile.setCity(request.getCity().trim());
        if (request.getState() != null) profile.setState(request.getState().trim());
        if (request.getPreferredLanguage() != null) profile.setPreferredLanguage(request.getPreferredLanguage().trim());
        if (request.getLanguages() != null) profile.setLanguages(request.getLanguages());
        if (request.getInterests() != null) profile.setInterests(request.getInterests());
        if (request.getTravelStyle() != null) profile.setTravelStyle(request.getTravelStyle().trim());
        if (request.getBudgetPreference() != null) profile.setBudgetPreference(request.getBudgetPreference().trim());
        if (request.getProfileImageUrl() != null) profile.setProfileImageUrl(request.getProfileImageUrl().trim());
        profile.setUpdatedAt(Instant.now());

        profileRepository.save(profile);
        userRepository.save(user);

        return getUserProfile(userId);
    }

    @Transactional(readOnly = true)
    public PartnerProfileDto getPartnerProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Partner not found with ID: " + userId));

        if (user.getRole() != Role.PARTNER) {
            throw new IllegalArgumentException("User is not registered as a Partner");
        }

        Profile profile = profileRepository.findById(userId).orElse(null);

        return PartnerProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .businessName(profile != null ? profile.getBusinessName() : null)
                .role(user.getRole())
                .partnerSubtype(user.getPartnerSubtype())
                .avatarUrl(profile != null ? profile.getProfileImageUrl() : user.getAvatarUrl())
                .bio(profile != null ? profile.getBio() : null)
                .phone(profile != null ? profile.getPhone() : user.getPhone())
                .city(profile != null ? profile.getCity() : null)
                .state(profile != null ? profile.getState() : null)
                .languages(profile != null && profile.getLanguages() != null ? profile.getLanguages() : new ArrayList<>())
                .partnerSkills(profile != null && profile.getPartnerSkills() != null ? profile.getPartnerSkills() : new ArrayList<>())
                .verificationStatus(user.getVerificationStatus())
                .verified(user.getVerificationStatus() == VerificationStatus.APPROVED)
                .build();
    }

    @Transactional
    public PartnerProfileDto updatePartnerProfile(String userId, UpdatePartnerProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Partner not found with ID: " + userId));

        if (user.getRole() != Role.PARTNER) {
            throw new IllegalArgumentException("User is not registered as a Partner");
        }

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPartnerSubtype() != null) {
            user.setPartnerSubtype(request.getPartnerSubtype());
        }

        Profile profile = profileRepository.findById(userId).orElseGet(() -> {
            Profile p = Profile.builder().id(userId).user(user).build();
            return profileRepository.save(p);
        });

        if (request.getBusinessName() != null) profile.setBusinessName(request.getBusinessName().trim());
        if (request.getBio() != null) profile.setBio(request.getBio().trim());
        if (request.getPhone() != null) profile.setPhone(request.getPhone().trim());
        if (request.getCity() != null) profile.setCity(request.getCity().trim());
        if (request.getState() != null) profile.setState(request.getState().trim());
        if (request.getLanguages() != null) profile.setLanguages(request.getLanguages());
        if (request.getPartnerSkills() != null) profile.setPartnerSkills(request.getPartnerSkills());
        if (request.getProfileImageUrl() != null) profile.setProfileImageUrl(request.getProfileImageUrl().trim());
        profile.setUpdatedAt(Instant.now());

        profileRepository.save(profile);
        userRepository.save(user);

        return getPartnerProfile(userId);
    }

    @Transactional(readOnly = true)
    public GovernmentOverviewDto getGovernmentOverview() {
        long totalTravelers = userRepository.countByRole(Role.TRAVELER);
        long totalPartners = userRepository.countByRole(Role.PARTNER);
        long pendingVerifications = userRepository.countByVerificationStatus(VerificationStatus.PENDING);
        long approvedPartners = userRepository.countByVerificationStatus(VerificationStatus.APPROVED);

        return GovernmentOverviewDto.builder()
                .authority("Ministry of Tourism & State Tourism Boards (Aggregated View)")
                .totalTravelers(totalTravelers)
                .totalPartners(totalPartners)
                .pendingPartnerVerifications(pendingVerifications)
                .approvedPartners(approvedPartners)
                .availableDestinations(93)
                .message("Official government tourism intelligence overview (Platform Aggregated Metrics)")
                .timestamp(Instant.now())
                .build();
    }
}
