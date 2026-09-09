package com.yatrasetu.service;

import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.web.dto.CreateExperienceRequest;
import com.yatrasetu.web.dto.ExperienceDto;
import com.yatrasetu.web.dto.ExperienceVerificationRequest;
import com.yatrasetu.web.dto.UpdateExperienceRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExperienceService {

    private final ExperienceRepository experienceRepository;
    private final LocalHostRepository localHostRepository;
    private final DestinationRepository destinationRepository;
    private final CityRepository cityRepository;
    private final UserRepository userRepository;
    private final CulturalTraditionRepository culturalTraditionRepository;

    @Transactional(readOnly = true)
    public Page<ExperienceDto> getAllExperiences(
            String destinationId,
            String cityId,
            String category,
            BigDecimal maxPrice,
            String language,
            String search,
            Pageable pageable) {

        String cleanedDest = (destinationId != null && !destinationId.trim().isEmpty() && !destinationId.equalsIgnoreCase("all")) ? destinationId.trim() : null;
        String cleanedCity = (cityId != null && !cityId.trim().isEmpty() && !cityId.equalsIgnoreCase("all")) ? cityId.trim() : null;
        String cleanedCat = (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("all")) ? category.trim() : null;
        String cleanedLang = (language != null && !language.trim().isEmpty() && !language.equalsIgnoreCase("all")) ? language.trim() : null;
        String cleanedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        return experienceRepository.findWithFilters(
                cleanedDest,
                cleanedCity,
                cleanedCat,
                maxPrice,
                cleanedLang,
                cleanedSearch,
                pageable
        ).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<ExperienceDto> getExperienceById(String id) {
        return experienceRepository.findById(id).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<ExperienceDto> getExperiencesByDestination(String destinationId) {
        List<Experience> experiences = experienceRepository.findByDestinationId(destinationId);
        if (experiences.isEmpty()) {
            Optional<Destination> destOpt = destinationRepository.findById(destinationId);
            if (destOpt.isPresent()) {
                Destination dest = destOpt.get();
                if (dest.getCity() != null) {
                    experiences = experienceRepository.findByCityId(dest.getCity().getId());
                }
                if (experiences.isEmpty() && dest.getNearestMajorCity() != null && !dest.getNearestMajorCity().isBlank()) {
                    String major = dest.getNearestMajorCity().toLowerCase().trim();
                    experiences = experienceRepository.findAll().stream()
                            .filter(e -> (e.getCity() != null && e.getCity().getCityName() != null && e.getCity().getCityName().toLowerCase().contains(major))
                                    || (e.getCity() != null && e.getCity().getId() != null && e.getCity().getId().toLowerCase().contains(major)))
                            .collect(Collectors.toList());
                }
            }
        }
        return experiences.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExperienceDto> getExperiencesByHost(String hostId) {
        return experienceRepository.findByHostId(hostId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExperienceDto> getExperiencesByCulturalTradition(String culturalTraditionId) {
        // Enforce honest traveler discovery: Only genuinely VERIFIED (or DEMO) experiences are exposed
        return experienceRepository.findVerifiedByCulturalTraditionId(culturalTraditionId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getCategories() {
        return experienceRepository.findDistinctCategories();
    }

    // =========================================================================
    // Partner Experience Management (with strict Server-Side Ownership Checks)
    // =========================================================================

    @Transactional(readOnly = true)
    public List<ExperienceDto> getMyExperiences(String authIdentifier) {
        User user = findUserByAuthIdentifier(authIdentifier);
        return experienceRepository.findByHostUserId(user.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExperienceDto getMyExperienceById(String authIdentifier, String experienceId) {
        User user = findUserByAuthIdentifier(authIdentifier);
        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new IllegalArgumentException("Experience not found with id: " + experienceId));
        validateOwnership(experience, user);
        return toDto(experience);
    }

    @Transactional
    public ExperienceDto createExperience(String authIdentifier, CreateExperienceRequest request) {
        User user = findUserByAuthIdentifier(authIdentifier);

        // Find or auto-initialize local host profile for this partner user
        LocalHost host = localHostRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    City fallbackCity = cityRepository.findAll().stream().findFirst()
                            .orElseThrow(() -> new IllegalStateException("No cities available"));
                    LocalHost newHost = LocalHost.builder()
                            .id("host-" + UUID.randomUUID().toString().substring(0, 8))
                            .user(user)
                            .name(user.getFullName() != null ? user.getFullName() : "Partner Host")
                            .state(fallbackCity.getState())
                            .city(fallbackCity)
                            .roleTitle("Experience Host")
                            .pricePerHour(BigDecimal.valueOf(500.0))
                            .rating(BigDecimal.valueOf(5.0))
                            .experienceCount(1)
                            .isVerified(user.isVerified())
                            .isDemoData(false)
                            .about("Verified YatraSetu tourism partner host.")
                            .avatarUrl(user.getAvatarUrl())
                            .build();
                    return localHostRepository.save(newHost);
                });

        Destination destination = null;
        if (request.getDestinationId() != null && !request.getDestinationId().trim().isEmpty()) {
            destination = destinationRepository.findById(request.getDestinationId()).orElse(null);
        }

        City city = null;
        if (request.getCityId() != null && !request.getCityId().trim().isEmpty()) {
            city = cityRepository.findById(request.getCityId()).orElse(null);
        } else if (destination != null && destination.getCity() != null) {
            city = destination.getCity();
        } else if (host.getCity() != null) {
            city = host.getCity();
        }

        // Cultural Tradition Linking & Geographic Validation
        CulturalTradition tradition = null;
        ExperienceStatus initialStatus = ExperienceStatus.PUBLISHED;
        ExperienceVerificationStatus initialVerification = ExperienceVerificationStatus.UNVERIFIED;
        boolean initialApproved = true;

        if (request.getCulturalTraditionId() != null && !request.getCulturalTraditionId().trim().isEmpty()) {
            String traditionId = request.getCulturalTraditionId().trim();
            tradition = culturalTraditionRepository.findById(traditionId)
                    .orElseThrow(() -> new IllegalArgumentException("Cultural tradition not found with id: " + traditionId));

            // Server-side geographic validation
            validateGeographicMatch(tradition, destination, city, host);

            // Cultural experiences start in DRAFT and UNVERIFIED status
            initialStatus = ExperienceStatus.DRAFT;
            initialVerification = ExperienceVerificationStatus.UNVERIFIED;
            initialApproved = false;
        }

        Experience experience = Experience.builder()
                .id("exp-" + UUID.randomUUID().toString().substring(0, 8))
                .host(host)
                .destination(destination)
                .city(city)
                .culturalTradition(tradition)
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .category(request.getCategory().trim())
                .durationHours(request.getDurationHours())
                .pricePerPerson(request.getPricePerPerson())
                .maxGroupSize(request.getMaxGroupSize() != null ? request.getMaxGroupSize() : 8)
                .includedItems(request.getIncludedItems() != null ? request.getIncludedItems() : List.of())
                .requirements(request.getRequirements())
                .languages(request.getLanguages() != null ? request.getLanguages() : List.of("English", "Hindi"))
                .coverImageUrl(request.getCoverImageUrl())
                .status(initialStatus)
                .verificationStatus(initialVerification)
                .isApproved(initialApproved)
                .isActive(true)
                .isDemoData(false)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        Experience saved = experienceRepository.save(experience);
        log.info("Partner {} created experience {} [category={}, culturalTradition={}, status={}, verification={}]",
                user.getId(), saved.getId(), saved.getCategory(),
                tradition != null ? tradition.getId() : "NONE",
                saved.getStatus(), saved.getVerificationStatus());

        return toDto(saved);
    }

    @Transactional
    public ExperienceDto updateExperience(String authIdentifier, String experienceId, UpdateExperienceRequest request) {
        User user = findUserByAuthIdentifier(authIdentifier);
        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new IllegalArgumentException("Experience not found with id: " + experienceId));

        // Strict Server-Side Partner Ownership Authorization
        validateOwnership(experience, user);

        Destination newDest = experience.getDestination();
        if (request.getDestinationId() != null) {
            newDest = destinationRepository.findById(request.getDestinationId()).orElse(null);
            experience.setDestination(newDest);
        }

        City newCity = experience.getCity();
        if (request.getCityId() != null) {
            newCity = cityRepository.findById(request.getCityId()).orElse(null);
            experience.setCity(newCity);
        }

        if (request.getCulturalTraditionId() != null) {
            if (request.getCulturalTraditionId().trim().isEmpty()) {
                experience.setCulturalTradition(null);
            } else {
                CulturalTradition tradition = culturalTraditionRepository.findById(request.getCulturalTraditionId().trim())
                        .orElseThrow(() -> new IllegalArgumentException("Cultural tradition not found with id: " + request.getCulturalTraditionId()));
                validateGeographicMatch(tradition, newDest, newCity, experience.getHost());
                experience.setCulturalTradition(tradition);
            }
        }

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            experience.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null && !request.getDescription().trim().isEmpty()) {
            experience.setDescription(request.getDescription().trim());
        }
        if (request.getCategory() != null && !request.getCategory().trim().isEmpty()) {
            experience.setCategory(request.getCategory().trim());
        }
        if (request.getDurationHours() != null) {
            experience.setDurationHours(request.getDurationHours());
        }
        if (request.getPricePerPerson() != null) {
            experience.setPricePerPerson(request.getPricePerPerson());
        }
        if (request.getMaxGroupSize() != null) {
            experience.setMaxGroupSize(request.getMaxGroupSize());
        }
        if (request.getIncludedItems() != null) {
            experience.setIncludedItems(request.getIncludedItems());
        }
        if (request.getRequirements() != null) {
            experience.setRequirements(request.getRequirements());
        }
        if (request.getLanguages() != null) {
            experience.setLanguages(request.getLanguages());
        }
        if (request.getCoverImageUrl() != null) {
            experience.setCoverImageUrl(request.getCoverImageUrl());
        }
        if (request.getIsActive() != null) {
            experience.setIsActive(request.getIsActive());
        }

        // If a previously verified experience is edited by partner, reset verification to ensure security
        if (experience.getVerificationStatus() == ExperienceVerificationStatus.VERIFIED) {
            experience.setVerificationStatus(ExperienceVerificationStatus.UNVERIFIED);
            experience.setStatus(ExperienceStatus.DRAFT);
            experience.setIsApproved(false);
            log.info("Experience {} reset to DRAFT/UNVERIFIED following partner update", experienceId);
        }

        experience.setUpdatedAt(Instant.now());
        Experience saved = experienceRepository.save(experience);
        return toDto(saved);
    }

    @Transactional
    public ExperienceDto submitExperience(String authIdentifier, String experienceId) {
        User user = findUserByAuthIdentifier(authIdentifier);
        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new IllegalArgumentException("Experience not found with id: " + experienceId));

        validateOwnership(experience, user);

        experience.setStatus(ExperienceStatus.SUBMITTED);
        experience.setVerificationStatus(ExperienceVerificationStatus.PENDING_REVIEW);
        experience.setUpdatedAt(Instant.now());

        Experience saved = experienceRepository.save(experience);
        log.info("Partner {} submitted experience {} for verification", user.getId(), experienceId);
        return toDto(saved);
    }

    @Transactional
    public void deleteExperience(String authIdentifier, String experienceId) {
        User user = findUserByAuthIdentifier(authIdentifier);
        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new IllegalArgumentException("Experience not found with id: " + experienceId));

        // Strict Server-Side Partner Ownership Authorization
        validateOwnership(experience, user);

        experienceRepository.delete(experience);
    }

    // =========================================================================
    // Government Cultural Experience Verification & Accreditation
    // =========================================================================

    @Transactional(readOnly = true)
    public List<ExperienceDto> getPendingReviewExperiences() {
        return experienceRepository.findByVerificationStatusIn(
                List.of(ExperienceVerificationStatus.PENDING_REVIEW, ExperienceVerificationStatus.UNVERIFIED)
        ).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public ExperienceDto verifyExperience(String governmentAuthIdentifier, String experienceId, ExperienceVerificationRequest request) {
        User govUser = findUserByAuthIdentifier(governmentAuthIdentifier);
        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new IllegalArgumentException("Experience not found with id: " + experienceId));

        if (request.getDecision() == null || request.getDecision().trim().isEmpty()) {
            throw new IllegalArgumentException("Verification decision is required (APPROVED, REJECTED, or SUSPENDED).");
        }

        String decision = request.getDecision().trim().toUpperCase();
        ExperienceVerificationStatus previousVerification = experience.getVerificationStatus();
        ExperienceStatus previousStatus = experience.getStatus();

        if ("APPROVED".equals(decision)) {
            experience.setVerificationStatus(ExperienceVerificationStatus.VERIFIED);
            experience.setStatus(ExperienceStatus.PUBLISHED);
            experience.setIsApproved(true);
            experience.setVerifiedBy(govUser.getId());
            experience.setVerifiedAt(Instant.now());
            experience.setVerificationNotes(request.getVerificationNotes());
        } else if ("REJECTED".equals(decision)) {
            experience.setVerificationStatus(ExperienceVerificationStatus.REJECTED);
            experience.setStatus(ExperienceStatus.REJECTED);
            experience.setIsApproved(false);
            experience.setVerifiedBy(govUser.getId());
            experience.setVerifiedAt(Instant.now());
            experience.setVerificationNotes(request.getVerificationNotes());
        } else if ("SUSPENDED".equals(decision)) {
            experience.setVerificationStatus(ExperienceVerificationStatus.SUSPENDED);
            experience.setStatus(ExperienceStatus.SUSPENDED);
            experience.setIsApproved(false);
            experience.setVerifiedBy(govUser.getId());
            experience.setVerifiedAt(Instant.now());
            experience.setVerificationNotes(request.getVerificationNotes());
        } else {
            throw new IllegalArgumentException("Invalid verification decision: " + decision + ". Expected APPROVED, REJECTED, or SUSPENDED.");
        }

        experience.setUpdatedAt(Instant.now());
        Experience saved = experienceRepository.save(experience);

        log.info("Government official {} verified experience {} [decision={}, previousStatus={}, newStatus={}, previousVerif={}, newVerif={}]",
                govUser.getId(), experienceId, decision, previousStatus, saved.getStatus(), previousVerification, saved.getVerificationStatus());

        return toDto(saved);
    }

    // =========================================================================
    // Geographic Validation Logic
    // =========================================================================

    public void validateGeographicMatch(CulturalTradition tradition, Destination destination, City city, LocalHost host) {
        if (tradition == null) {
            return;
        }

        String traditionStateId = tradition.getState() != null ? tradition.getState().getId() : null;
        String traditionStateName = tradition.getState() != null ? tradition.getState().getStateName() : "its registered state";

        // 1. If tradition has specific destination
        if (tradition.getDestination() != null) {
            String tradDestId = tradition.getDestination().getId();
            // If destination provided and matches exactly -> Strongest match
            if (destination != null && destination.getId().equalsIgnoreCase(tradDestId)) {
                return;
            }
        }

        // 2. If tradition has specific city
        if (tradition.getCity() != null) {
            String tradCityId = tradition.getCity().getId();
            // If city provided and matches exactly -> Strong match
            if (city != null && city.getId().equalsIgnoreCase(tradCityId)) {
                return;
            }
            // If destination's city matches tradition's city -> Strong match
            if (destination != null && destination.getCity() != null && destination.getCity().getId().equalsIgnoreCase(tradCityId)) {
                return;
            }
        }

        // 3. Regional / State-level match check
        if (traditionStateId != null) {
            if (destination != null && destination.getState() != null) {
                if (destination.getState().getId().equalsIgnoreCase(traditionStateId)) {
                    return; // State matches
                } else {
                    throw new IllegalArgumentException(String.format(
                            "Geographic mismatch: Cultural tradition '%s' belongs to %s, but the selected destination '%s' is located in %s.",
                            tradition.getTraditionName(), traditionStateName,
                            destination.getDestinationName(), destination.getState().getStateName()));
                }
            }

            if (city != null && city.getState() != null) {
                if (city.getState().getId().equalsIgnoreCase(traditionStateId)) {
                    return; // State matches
                } else {
                    throw new IllegalArgumentException(String.format(
                            "Geographic mismatch: Cultural tradition '%s' belongs to %s, but the selected city '%s' is located in %s.",
                            tradition.getTraditionName(), traditionStateName,
                            city.getCityName(), city.getState().getStateName()));
                }
            }

            if (host != null && host.getState() != null) {
                if (host.getState().getId().equalsIgnoreCase(traditionStateId)) {
                    return;
                } else {
                    throw new IllegalArgumentException(String.format(
                            "Geographic mismatch: Cultural tradition '%s' belongs to %s, but host location is in %s.",
                            tradition.getTraditionName(), traditionStateName, host.getState().getStateName()));
                }
            }
        }
    }

    private void validateOwnership(Experience experience, User user) {
        if (experience.getHost() == null ||
                experience.getHost().getUser() == null ||
                !experience.getHost().getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this experience.");
        }
    }

    private User findUserByAuthIdentifier(String authIdentifier) {
        return userRepository.findByAuthUserId(authIdentifier)
                .or(() -> userRepository.findById(authIdentifier))
                .or(() -> userRepository.findByEmail(authIdentifier))
                .orElseThrow(() -> new IllegalArgumentException("User not found for identifier: " + authIdentifier));
    }

    public ExperienceDto toDto(Experience e) {
        return ExperienceDto.builder()
                .id(e.getId())
                .hostId(e.getHost() != null ? e.getHost().getId() : null)
                .hostName(e.getHost() != null ? e.getHost().getName() : null)
                .hostRoleTitle(e.getHost() != null ? e.getHost().getRoleTitle() : null)
                .hostAvatarUrl(e.getHost() != null ? e.getHost().getAvatarUrl() : null)
                .hostRating(e.getHost() != null ? e.getHost().getRating() : null)
                .hostCityName(e.getHost() != null && e.getHost().getCity() != null ? e.getHost().getCity().getCityName() : null)
                .destinationId(e.getDestination() != null ? e.getDestination().getId() : null)
                .destinationName(e.getDestination() != null ? e.getDestination().getDestinationName() : null)
                .cityId(e.getCity() != null ? e.getCity().getId() : (e.getHost() != null && e.getHost().getCity() != null ? e.getHost().getCity().getId() : null))
                .cityName(e.getCity() != null ? e.getCity().getCityName() : (e.getHost() != null && e.getHost().getCity() != null ? e.getHost().getCity().getCityName() : null))
                .title(e.getTitle())
                .description(e.getDescription())
                .category(e.getCategory())
                .durationHours(e.getDurationHours())
                .pricePerPerson(e.getPricePerPerson())
                .maxGroupSize(e.getMaxGroupSize())
                .includedItems(e.getIncludedItems())
                .requirements(e.getRequirements())
                .languages(e.getLanguages())
                .coverImageUrl(e.getCoverImageUrl())
                .isApproved(e.getIsApproved())
                .isActive(e.getIsActive())
                .isDemoData(e.getIsDemoData())
                .culturalTraditionId(e.getCulturalTradition() != null ? e.getCulturalTradition().getId() : null)
                .culturalTraditionName(e.getCulturalTradition() != null ? e.getCulturalTradition().getTraditionName() : null)
                .status(e.getStatus() != null ? e.getStatus().name() : ExperienceStatus.PUBLISHED.name())
                .verificationStatus(e.getVerificationStatus() != null ? e.getVerificationStatus().name() : ExperienceVerificationStatus.UNVERIFIED.name())
                .verificationNotes(e.getVerificationNotes())
                .verifiedBy(e.getVerifiedBy())
                .verifiedAt(e.getVerifiedAt())
                .build();
    }
}

