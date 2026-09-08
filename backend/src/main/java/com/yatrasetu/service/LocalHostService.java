package com.yatrasetu.service;

import com.yatrasetu.domain.Experience;
import com.yatrasetu.domain.LocalHost;
import com.yatrasetu.repository.ExperienceRepository;
import com.yatrasetu.repository.LocalHostRepository;
import com.yatrasetu.web.dto.ExperienceDto;
import com.yatrasetu.web.dto.LocalHostDetailDto;
import com.yatrasetu.web.dto.LocalHostDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocalHostService {

    private final LocalHostRepository localHostRepository;
    private final ExperienceRepository experienceRepository;

    @Transactional(readOnly = true)
    public Page<LocalHostDto> getAllHosts(
            String cityId,
            String destinationId,
            String stateId,
            Boolean isVerified,
            BigDecimal minRating,
            BigDecimal maxPrice,
            String skill,
            String language,
            String search,
            Pageable pageable) {

        String cleanedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String cleanedSkill = (skill != null && !skill.trim().isEmpty() && !skill.equalsIgnoreCase("all")) ? skill.trim() : null;
        String cleanedLang = (language != null && !language.trim().isEmpty() && !language.equalsIgnoreCase("all")) ? language.trim() : null;
        String cleanedCity = (cityId != null && !cityId.trim().isEmpty() && !cityId.equalsIgnoreCase("all")) ? cityId.trim() : null;
        String cleanedDest = (destinationId != null && !destinationId.trim().isEmpty() && !destinationId.equalsIgnoreCase("all")) ? destinationId.trim() : null;
        String cleanedState = (stateId != null && !stateId.trim().isEmpty() && !stateId.equalsIgnoreCase("all")) ? stateId.trim() : null;

        return localHostRepository.findWithFilters(
                cleanedCity,
                cleanedDest,
                cleanedState,
                isVerified,
                minRating,
                maxPrice,
                cleanedSkill,
                cleanedLang,
                cleanedSearch,
                pageable
        ).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<LocalHostDetailDto> getHostById(String id) {
        return localHostRepository.findById(id).map(host -> {
            List<Experience> experiences = experienceRepository.findByHostId(host.getId());
            List<ExperienceDto> experienceDtos = experiences.stream()
                    .map(this::toExperienceDto)
                    .collect(Collectors.toList());
            return toDetailDto(host, experienceDtos);
        });
    }

    @Transactional(readOnly = true)
    public List<LocalHostDto> getHostsByDestination(String destinationId) {
        return localHostRepository.findByDestinationId(destinationId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LocalHostDto> getHostsByCity(String cityId) {
        return localHostRepository.findByCityId(cityId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<LocalHost> findByUserId(String userId) {
        return localHostRepository.findByUserId(userId);
    }

    public LocalHostDto toDto(LocalHost h) {
        return LocalHostDto.builder()
                .id(h.getId())
                .userId(h.getUser() != null ? h.getUser().getId() : null)
                .name(h.getName())
                .stateId(h.getState() != null ? h.getState().getId() : null)
                .stateName(h.getState() != null ? h.getState().getStateName() : null)
                .cityId(h.getCity() != null ? h.getCity().getId() : null)
                .cityName(h.getCity() != null ? h.getCity().getCityName() : null)
                .destinationId(h.getDestination() != null ? h.getDestination().getId() : null)
                .destinationName(h.getDestination() != null ? h.getDestination().getDestinationName() : null)
                .languages(h.getLanguages())
                .skills(h.getSkills())
                .interests(h.getInterests())
                .roleTitle(h.getRoleTitle())
                .pricePerHour(h.getPricePerHour())
                .rating(h.getRating())
                .experienceCount(h.getExperienceCount())
                .availability(h.getAvailability())
                .isVerified(h.getIsVerified())
                .isDemoData(h.getIsDemoData())
                .about(h.getAbout())
                .avatarUrl(h.getAvatarUrl())
                .build();
    }

    public LocalHostDetailDto toDetailDto(LocalHost h, List<ExperienceDto> experiences) {
        return LocalHostDetailDto.builder()
                .id(h.getId())
                .userId(h.getUser() != null ? h.getUser().getId() : null)
                .name(h.getName())
                .stateId(h.getState() != null ? h.getState().getId() : null)
                .stateName(h.getState() != null ? h.getState().getStateName() : null)
                .cityId(h.getCity() != null ? h.getCity().getId() : null)
                .cityName(h.getCity() != null ? h.getCity().getCityName() : null)
                .destinationId(h.getDestination() != null ? h.getDestination().getId() : null)
                .destinationName(h.getDestination() != null ? h.getDestination().getDestinationName() : null)
                .languages(h.getLanguages())
                .skills(h.getSkills())
                .interests(h.getInterests())
                .roleTitle(h.getRoleTitle())
                .pricePerHour(h.getPricePerHour())
                .rating(h.getRating())
                .experienceCount(h.getExperienceCount())
                .availability(h.getAvailability())
                .isVerified(h.getIsVerified())
                .isDemoData(h.getIsDemoData())
                .about(h.getAbout())
                .avatarUrl(h.getAvatarUrl())
                .experiences(experiences)
                .build();
    }

    public ExperienceDto toExperienceDto(Experience e) {
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
