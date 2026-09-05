package com.yatrasetu.service;

import com.yatrasetu.domain.City;
import com.yatrasetu.domain.Destination;
import com.yatrasetu.domain.Experience;
import com.yatrasetu.domain.LocalHost;
import com.yatrasetu.domain.User;
import com.yatrasetu.repository.*;
import com.yatrasetu.web.dto.CreateExperienceRequest;
import com.yatrasetu.web.dto.ExperienceDto;
import com.yatrasetu.web.dto.UpdateExperienceRequest;
import lombok.RequiredArgsConstructor;
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

@Service
@RequiredArgsConstructor
public class ExperienceService {

    private final ExperienceRepository experienceRepository;
    private final LocalHostRepository localHostRepository;
    private final DestinationRepository destinationRepository;
    private final CityRepository cityRepository;
    private final UserRepository userRepository;

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
        return experienceRepository.findByDestinationId(destinationId)
                .stream()
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

        Experience experience = Experience.builder()
                .id("exp-" + UUID.randomUUID().toString().substring(0, 8))
                .host(host)
                .destination(destination)
                .city(city)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .durationHours(request.getDurationHours())
                .pricePerPerson(request.getPricePerPerson())
                .maxGroupSize(request.getMaxGroupSize() != null ? request.getMaxGroupSize() : 8)
                .includedItems(request.getIncludedItems() != null ? request.getIncludedItems() : List.of())
                .requirements(request.getRequirements())
                .languages(request.getLanguages() != null ? request.getLanguages() : List.of("English", "Hindi"))
                .coverImageUrl(request.getCoverImageUrl())
                .isApproved(true)
                .isActive(true)
                .isDemoData(false)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        Experience saved = experienceRepository.save(experience);
        return toDto(saved);
    }

    @Transactional
    public ExperienceDto updateExperience(String authIdentifier, String experienceId, UpdateExperienceRequest request) {
        User user = findUserByAuthIdentifier(authIdentifier);
        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new IllegalArgumentException("Experience not found with id: " + experienceId));

        // Strict Server-Side Partner Ownership Authorization
        validateOwnership(experience, user);

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
        if (request.getDestinationId() != null) {
            Destination dest = destinationRepository.findById(request.getDestinationId()).orElse(null);
            experience.setDestination(dest);
        }
        if (request.getCityId() != null) {
            City city = cityRepository.findById(request.getCityId()).orElse(null);
            experience.setCity(city);
        }

        experience.setUpdatedAt(Instant.now());
        Experience saved = experienceRepository.save(experience);
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
                .build();
    }
}
