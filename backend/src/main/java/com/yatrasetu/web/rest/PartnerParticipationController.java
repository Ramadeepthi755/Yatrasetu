package com.yatrasetu.web.rest;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.ExperienceSupportingProviderDto;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/partner")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PARTNER')")
public class PartnerParticipationController {

    private final ExperienceSupportingProviderRepository supportingProviderRepository;
    private final ExperienceRepository experienceRepository;
    private final LocalHostRepository hostRepository;
    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;

    @GetMapping("/participations")
    public ResponseEntity<ApiResponse<List<ExperienceSupportingProviderDto>>> getMyParticipations(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<List<ExperienceSupportingProviderDto>>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        String userId = principal.getUserId();
        LocalHost host = hostRepository.findByUserId(userId).orElse(null);
        String hostId = host != null ? host.getId() : userId;
        String hostName = host != null ? host.getName() : principal.getUsername();

        List<ExperienceSupportingProvider> participations = supportingProviderRepository.findByProviderIdOrName(hostId, hostName);
        if (participations.isEmpty() && !userId.equals(hostId)) {
            participations = supportingProviderRepository.findByProviderId(userId);
        }

        List<ExperienceSupportingProviderDto> dtos = participations.stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("Supporting provider participations retrieved", dtos));
    }

    @Data
    public static class RespondParticipationRequest {
        private String action; // ACCEPT, DECLINE
        private String notes;
    }

    @PostMapping("/participations/{id}/respond")
    @Transactional
    public ResponseEntity<ApiResponse<ExperienceSupportingProviderDto>> respondToParticipation(
            @PathVariable("id") String id,
            @RequestBody RespondParticipationRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<ExperienceSupportingProviderDto>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        ExperienceSupportingProvider sp = supportingProviderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Participation invitation not found with ID: " + id));

        if ("ACCEPT".equalsIgnoreCase(request.getAction())) {
            sp.setStatus("ACCEPTED");
        } else {
            sp.setStatus("DECLINED");
        }
        if (request.getNotes() != null) {
            sp.setNotes(request.getNotes());
        }
        sp.setUpdatedAt(Instant.now());

        ExperienceSupportingProvider saved = supportingProviderRepository.save(sp);
        return ResponseEntity.ok(ApiResponse.ok("Participation status updated to " + sp.getStatus(), toDto(saved)));
    }

    @Data
    public static class InviteSupportingProviderRequest {
        private String providerId;
        private String providerName;
        private String providerType; // ARTISAN, HOTEL, LOCAL_BUSINESS, GUIDE, RESTAURANT
        private String roleDescription;
        private String notes;
    }

    @PostMapping("/experiences/{experienceId}/supporting-providers")
    @Transactional
    public ResponseEntity<ApiResponse<ExperienceSupportingProviderDto>> inviteSupportingProvider(
            @PathVariable("experienceId") String experienceId,
            @RequestBody InviteSupportingProviderRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<ExperienceSupportingProviderDto>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new IllegalArgumentException("Experience not found with ID: " + experienceId));

        if (experience.getHost() == null || experience.getHost().getUser() == null ||
                !experience.getHost().getUser().getId().equals(principal.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.<ExperienceSupportingProviderDto>builder().success(false).message("Access denied: You do not own this experience").timestamp(Instant.now()).build());
        }

        ExperienceSupportingProvider sp = ExperienceSupportingProvider.builder()
                .id(UUID.randomUUID().toString())
                .experience(experience)
                .providerId(request.getProviderId() != null ? request.getProviderId() : "prov_" + UUID.randomUUID().toString().substring(0, 8))
                .providerName(request.getProviderName())
                .providerType(request.getProviderType() != null ? request.getProviderType() : "ARTISAN")
                .roleDescription(request.getRoleDescription() != null ? request.getRoleDescription() : "Supporting Cultural Partner")
                .status("INVITED")
                .notes(request.getNotes())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        ExperienceSupportingProvider saved = supportingProviderRepository.save(sp);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Supporting provider invited successfully", toDto(saved)));
    }

    @DeleteMapping("/experiences/{experienceId}/supporting-providers/{supportingId}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> removeSupportingProvider(
            @PathVariable("experienceId") String experienceId,
            @PathVariable("supportingId") String supportingId,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<Void>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new IllegalArgumentException("Experience not found with ID: " + experienceId));

        if (experience.getHost() == null || experience.getHost().getUser() == null ||
                !experience.getHost().getUser().getId().equals(principal.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.<Void>builder().success(false).message("Access denied: You do not own this experience").timestamp(Instant.now()).build());
        }

        supportingProviderRepository.deleteById(supportingId);
        return ResponseEntity.ok(ApiResponse.ok("Supporting provider removed", null));
    }

    @GetMapping("/participations/available-providers")
    public ResponseEntity<ApiResponse<List<ExperienceSupportingProviderDto>>> getAvailableProviders(
            @RequestParam(value = "destinationId", required = false) String destinationId,
            @RequestParam(value = "cityId", required = false) String cityId) {

        List<ExperienceSupportingProviderDto> results = new ArrayList<>();

        // Add hosts/artisans in destination
        List<LocalHost> hosts = destinationId != null ? hostRepository.findByDestinationId(destinationId) :
                (cityId != null ? hostRepository.findByCityId(cityId) : hostRepository.findAll());

        for (LocalHost h : hosts) {
            results.add(ExperienceSupportingProviderDto.builder()
                    .providerId(h.getId())
                    .providerName(h.getName())
                    .providerType(h.getRoleTitle() != null && h.getRoleTitle().toLowerCase().contains("artisan") ? "ARTISAN" : "GUIDE")
                    .roleDescription(h.getRoleTitle() != null ? h.getRoleTitle() : "Local Specialist")
                    .status("AVAILABLE")
                    .build());
        }

        return ResponseEntity.ok(ApiResponse.ok("Available providers retrieved", results));
    }

    private ExperienceSupportingProviderDto toDto(ExperienceSupportingProvider sp) {
        return ExperienceSupportingProviderDto.builder()
                .id(sp.getId())
                .experienceId(sp.getExperience() != null ? sp.getExperience().getId() : null)
                .providerId(sp.getProviderId())
                .providerName(sp.getProviderName())
                .providerType(sp.getProviderType())
                .roleDescription(sp.getRoleDescription())
                .status(sp.getStatus())
                .notes(sp.getNotes())
                .createdAt(sp.getCreatedAt())
                .build();
    }
}
