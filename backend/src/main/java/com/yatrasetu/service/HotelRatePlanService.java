package com.yatrasetu.service;

import com.yatrasetu.config.ResourceNotFoundException;
import com.yatrasetu.domain.*;
import com.yatrasetu.repository.HotelRatePlanRepository;
import com.yatrasetu.repository.HotelRepository;
import com.yatrasetu.repository.HotelRoomTypeRepository;
import com.yatrasetu.repository.UserRepository;
import com.yatrasetu.web.dto.CreateRatePlanRequest;
import com.yatrasetu.web.dto.HotelRatePlanDto;
import com.yatrasetu.web.dto.UpdateRatePlanRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HotelRatePlanService {

    private final HotelRatePlanRepository ratePlanRepository;
    private final HotelRoomTypeRepository roomTypeRepository;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;

    /**
     * Traveler-facing: Get active rate plans for a publicly verified hotel.
     */
    @Transactional(readOnly = true)
    public List<HotelRatePlanDto> getPublicRatePlansForHotel(String hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found: " + hotelId));

        if (Boolean.FALSE.equals(hotel.getIsActive()) ||
                hotel.getVerificationStatus() != HotelVerificationStatus.VERIFIED) {
            log.info("Hotel {} is not active or verified; public partner rates suppressed", hotelId);
            return List.of();
        }

        List<HotelRoomType> activeRooms = roomTypeRepository.findByHotelIdAndIsActiveTrueOrderByCreatedAtAsc(hotelId);
        if (activeRooms.isEmpty()) {
            return List.of();
        }

        List<String> roomIds = activeRooms.stream().map(HotelRoomType::getId).collect(Collectors.toList());
        return ratePlanRepository.findByRoomTypeIdInAndStatus(roomIds, RatePlanStatus.ACTIVE)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Traveler-facing: Get active rate plans for a specific room type in a verified hotel.
     */
    @Transactional(readOnly = true)
    public List<HotelRatePlanDto> getPublicRatePlansForRoomType(String hotelId, String roomTypeId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found: " + hotelId));

        if (Boolean.FALSE.equals(hotel.getIsActive()) ||
                hotel.getVerificationStatus() != HotelVerificationStatus.VERIFIED) {
            log.info("Hotel {} is not active or verified; public partner rates suppressed", hotelId);
            return List.of();
        }

        HotelRoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Room type not found: " + roomTypeId));

        if (!roomType.getHotel().getId().equals(hotelId) || Boolean.FALSE.equals(roomType.getIsActive())) {
            return List.of();
        }

        return ratePlanRepository.findByRoomTypeIdAndStatusOrderByCreatedAtAsc(roomTypeId, RatePlanStatus.ACTIVE)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Partner-facing: Get all rate plans for a room type owned by the partner.
     */
    @Transactional(readOnly = true)
    public List<HotelRatePlanDto> getPartnerRatePlans(String hotelId, String roomTypeId, String userEmailOrAuthId) {
        validateRoomTypeOwnership(hotelId, roomTypeId, userEmailOrAuthId);
        return ratePlanRepository.findByRoomTypeIdOrderByCreatedAtAsc(roomTypeId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Partner-facing: Get specific rate plan by ID.
     */
    @Transactional(readOnly = true)
    public HotelRatePlanDto getPartnerRatePlanById(String hotelId, String roomTypeId, String ratePlanId, String userEmailOrAuthId) {
        validateRoomTypeOwnership(hotelId, roomTypeId, userEmailOrAuthId);
        HotelRatePlan ratePlan = ratePlanRepository.findById(ratePlanId)
                .orElseThrow(() -> new ResourceNotFoundException("Rate plan not found: " + ratePlanId));

        if (!ratePlan.getRoomType().getId().equals(roomTypeId)) {
            throw new IllegalArgumentException("Rate plan " + ratePlanId + " does not belong to room " + roomTypeId);
        }

        return mapToDto(ratePlan);
    }

    /**
     * Partner-facing: Create a new rate plan for a room type.
     */
    @Transactional
    public HotelRatePlanDto createRatePlan(String hotelId, String roomTypeId, CreateRatePlanRequest request, String userEmailOrAuthId) {
        HotelRoomType roomType = validateRoomTypeOwnership(hotelId, roomTypeId, userEmailOrAuthId);

        validatePriceAndDates(request.getBasePrice(), request.getValidFrom(), request.getValidTo());

        MealPlan mealPlan = parseMealPlan(request.getMealPlan());
        CancellationPolicyType cancellationPolicy = parseCancellationPolicy(request.getCancellationPolicy());
        CancellationFeeType cancellationFeeType = parseCancellationFeeType(request.getCancellationFeeType());
        RatePlanStatus status = parseStatus(request.getStatus());

        if (status == RatePlanStatus.ACTIVE) {
            validateNoOverlappingActiveRates(roomTypeId, mealPlan, request.getValidFrom(), request.getValidTo(), null);
        }

        String rateId = "rate-" + UUID.randomUUID().toString().substring(0, 8);
        HotelRatePlan ratePlan = HotelRatePlan.builder()
                .id(rateId)
                .roomType(roomType)
                .planName(request.getPlanName().trim())
                .mealPlan(mealPlan)
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .basePrice(request.getBasePrice())
                .currency(request.getCurrency() != null ? request.getCurrency().trim().toUpperCase() : "INR")
                .priceUnit(request.getPriceUnit() != null ? request.getPriceUnit().trim() : "PER_NIGHT")
                .validFrom(request.getValidFrom())
                .validTo(request.getValidTo())
                .cancellationPolicy(cancellationPolicy)
                .cancellationDeadlineHours(request.getCancellationDeadlineHours() != null ? request.getCancellationDeadlineHours() : 24)
                .cancellationFeeType(cancellationFeeType)
                .cancellationFeeValue(request.getCancellationFeeValue() != null ? request.getCancellationFeeValue() : BigDecimal.ZERO)
                .taxesIncluded(Boolean.TRUE.equals(request.getTaxesIncluded()))
                .feesIncluded(Boolean.TRUE.equals(request.getFeesIncluded()))
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .status(status)
                .isDemoData(Boolean.TRUE.equals(roomType.getIsDemoData()))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        HotelRatePlan saved = ratePlanRepository.save(ratePlan);
        log.info("Partner {} created rate plan {} for room {} in hotel {}", userEmailOrAuthId, rateId, roomTypeId, hotelId);
        return mapToDto(saved);
    }

    /**
     * Partner-facing: Update existing rate plan.
     */
    @Transactional
    public HotelRatePlanDto updateRatePlan(String hotelId, String roomTypeId, String ratePlanId, UpdateRatePlanRequest request, String userEmailOrAuthId) {
        validateRoomTypeOwnership(hotelId, roomTypeId, userEmailOrAuthId);

        HotelRatePlan ratePlan = ratePlanRepository.findById(ratePlanId)
                .orElseThrow(() -> new ResourceNotFoundException("Rate plan not found: " + ratePlanId));

        if (!ratePlan.getRoomType().getId().equals(roomTypeId)) {
            throw new IllegalArgumentException("Rate plan " + ratePlanId + " does not belong to room " + roomTypeId);
        }

        if (request.getPlanName() != null && !request.getPlanName().trim().isEmpty()) {
            ratePlan.setPlanName(request.getPlanName().trim());
        }

        if (request.getMealPlan() != null) {
            ratePlan.setMealPlan(parseMealPlan(request.getMealPlan()));
        }

        if (request.getDescription() != null) {
            ratePlan.setDescription(request.getDescription().trim());
        }

        if (request.getBasePrice() != null) {
            if (request.getBasePrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Base price cannot be negative");
            }
            ratePlan.setBasePrice(request.getBasePrice());
        }

        if (request.getCurrency() != null && !request.getCurrency().trim().isEmpty()) {
            ratePlan.setCurrency(request.getCurrency().trim().toUpperCase());
        }

        if (request.getPriceUnit() != null && !request.getPriceUnit().trim().isEmpty()) {
            ratePlan.setPriceUnit(request.getPriceUnit().trim());
        }

        LocalDate newValidFrom = request.getValidFrom() != null ? request.getValidFrom() : ratePlan.getValidFrom();
        LocalDate newValidTo = request.getValidTo() != null ? request.getValidTo() : ratePlan.getValidTo();
        if (newValidFrom != null && newValidTo != null && newValidTo.isBefore(newValidFrom)) {
            throw new IllegalArgumentException("valid_to cannot be earlier than valid_from");
        }
        ratePlan.setValidFrom(request.getValidFrom());
        ratePlan.setValidTo(request.getValidTo());

        if (request.getCancellationPolicy() != null) {
            ratePlan.setCancellationPolicy(parseCancellationPolicy(request.getCancellationPolicy()));
        }

        if (request.getCancellationDeadlineHours() != null) {
            if (request.getCancellationDeadlineHours() < 0) {
                throw new IllegalArgumentException("Cancellation deadline hours cannot be negative");
            }
            ratePlan.setCancellationDeadlineHours(request.getCancellationDeadlineHours());
        }

        if (request.getCancellationFeeType() != null) {
            ratePlan.setCancellationFeeType(parseCancellationFeeType(request.getCancellationFeeType()));
        }

        if (request.getCancellationFeeValue() != null) {
            if (request.getCancellationFeeValue().compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Cancellation fee value cannot be negative");
            }
            if (ratePlan.getCancellationFeeType() == CancellationFeeType.PERCENTAGE &&
                    request.getCancellationFeeValue().compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new IllegalArgumentException("Percentage cancellation fee cannot exceed 100%");
            }
            ratePlan.setCancellationFeeValue(request.getCancellationFeeValue());
        }

        if (request.getTaxesIncluded() != null) {
            ratePlan.setTaxesIncluded(request.getTaxesIncluded());
        }

        if (request.getFeesIncluded() != null) {
            ratePlan.setFeesIncluded(request.getFeesIncluded());
        }

        if (request.getStatus() != null) {
            ratePlan.setStatus(parseStatus(request.getStatus()));
        }

        if (ratePlan.getStatus() == RatePlanStatus.ACTIVE) {
            validateNoOverlappingActiveRates(roomTypeId, ratePlan.getMealPlan(), ratePlan.getValidFrom(), ratePlan.getValidTo(), ratePlanId);
        }

        ratePlan.setUpdatedAt(Instant.now());
        HotelRatePlan saved = ratePlanRepository.save(ratePlan);
        log.info("Partner {} updated rate plan {} for room {} in hotel {}", userEmailOrAuthId, ratePlanId, roomTypeId, hotelId);
        return mapToDto(saved);
    }

    /**
     * Partner-facing: Activate rate plan.
     */
    @Transactional
    public HotelRatePlanDto activateRatePlan(String hotelId, String roomTypeId, String ratePlanId, String userEmailOrAuthId) {
        validateRoomTypeOwnership(hotelId, roomTypeId, userEmailOrAuthId);

        HotelRatePlan ratePlan = ratePlanRepository.findById(ratePlanId)
                .orElseThrow(() -> new ResourceNotFoundException("Rate plan not found: " + ratePlanId));

        if (!ratePlan.getRoomType().getId().equals(roomTypeId)) {
            throw new IllegalArgumentException("Rate plan " + ratePlanId + " does not belong to room " + roomTypeId);
        }

        validateNoOverlappingActiveRates(roomTypeId, ratePlan.getMealPlan(), ratePlan.getValidFrom(), ratePlan.getValidTo(), ratePlanId);

        ratePlan.setStatus(RatePlanStatus.ACTIVE);
        ratePlan.setUpdatedAt(Instant.now());
        HotelRatePlan saved = ratePlanRepository.save(ratePlan);
        log.info("Partner {} activated rate plan {}", userEmailOrAuthId, ratePlanId);
        return mapToDto(saved);
    }

    /**
     * Partner-facing: Deactivate rate plan.
     */
    @Transactional
    public HotelRatePlanDto deactivateRatePlan(String hotelId, String roomTypeId, String ratePlanId, String userEmailOrAuthId) {
        validateRoomTypeOwnership(hotelId, roomTypeId, userEmailOrAuthId);

        HotelRatePlan ratePlan = ratePlanRepository.findById(ratePlanId)
                .orElseThrow(() -> new ResourceNotFoundException("Rate plan not found: " + ratePlanId));

        if (!ratePlan.getRoomType().getId().equals(roomTypeId)) {
            throw new IllegalArgumentException("Rate plan " + ratePlanId + " does not belong to room " + roomTypeId);
        }

        ratePlan.setStatus(RatePlanStatus.INACTIVE);
        ratePlan.setUpdatedAt(Instant.now());
        HotelRatePlan saved = ratePlanRepository.save(ratePlan);
        log.info("Partner {} deactivated rate plan {}", userEmailOrAuthId, ratePlanId);
        return mapToDto(saved);
    }

    /**
     * Partner-facing: Delete rate plan.
     */
    @Transactional
    public void deleteRatePlan(String hotelId, String roomTypeId, String ratePlanId, String userEmailOrAuthId) {
        validateRoomTypeOwnership(hotelId, roomTypeId, userEmailOrAuthId);

        HotelRatePlan ratePlan = ratePlanRepository.findById(ratePlanId)
                .orElseThrow(() -> new ResourceNotFoundException("Rate plan not found: " + ratePlanId));

        if (!ratePlan.getRoomType().getId().equals(roomTypeId)) {
            throw new IllegalArgumentException("Rate plan " + ratePlanId + " does not belong to room " + roomTypeId);
        }

        ratePlanRepository.delete(ratePlan);
        log.info("Partner {} deleted rate plan {} from room {}", userEmailOrAuthId, ratePlanId, roomTypeId);
    }

    /**
     * Helper: Validates ownership of the room type through its parent hotel.
     */
    public HotelRoomType validateRoomTypeOwnership(String hotelId, String roomTypeId, String userEmailOrAuthId) {
        User partner = userRepository.findByEmail(userEmailOrAuthId)
                .or(() -> userRepository.findByAuthUserId(userEmailOrAuthId))
                .orElseThrow(() -> new AccessDeniedException("User not authenticated or registered"));

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found: " + hotelId));

        if (hotel.getOwner() == null) {
            throw new AccessDeniedException("This hotel is a dataset listing and does not belong to your partner account.");
        }

        User owner = hotel.getOwner();
        boolean isOwner = (owner.getEmail() != null && owner.getEmail().equalsIgnoreCase(userEmailOrAuthId)) ||
                (owner.getAuthUserId() != null && owner.getAuthUserId().equals(userEmailOrAuthId)) ||
                (owner.getId() != null && owner.getId().equals(userEmailOrAuthId));

        if (!isOwner) {
            throw new AccessDeniedException("Access denied: You do not own this hotel property");
        }

        HotelRoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Room type not found: " + roomTypeId));

        if (!roomType.getHotel().getId().equals(hotelId)) {
            throw new IllegalArgumentException("Room type " + roomTypeId + " does not belong to hotel " + hotelId);
        }

        return roomType;
    }

    /**
     * Helper: Validates that there are no overlapping active rate plans for the same room and meal plan.
     */
    private void validateNoOverlappingActiveRates(
            String roomTypeId,
            MealPlan mealPlan,
            LocalDate validFrom,
            LocalDate validTo,
            String excludeRatePlanId
    ) {
        List<HotelRatePlan> existingActivePlans = ratePlanRepository
                .findByRoomTypeIdAndMealPlanAndStatus(roomTypeId, mealPlan, RatePlanStatus.ACTIVE);

        for (HotelRatePlan existing : existingActivePlans) {
            if (excludeRatePlanId != null && existing.getId().equals(excludeRatePlanId)) {
                continue;
            }

            LocalDate exStart = existing.getValidFrom() != null ? existing.getValidFrom() : LocalDate.MIN;
            LocalDate exEnd = existing.getValidTo() != null ? existing.getValidTo() : LocalDate.MAX;

            LocalDate reqStart = validFrom != null ? validFrom : LocalDate.MIN;
            LocalDate reqEnd = validTo != null ? validTo : LocalDate.MAX;

            // Two intervals [s1, e1] and [s2, e2] overlap if s1 <= e2 and s2 <= e1
            if (!reqStart.isAfter(exEnd) && !exStart.isAfter(reqEnd)) {
                throw new IllegalArgumentException(
                        "An active " + mealPlan + " rate plan named '" + existing.getPlanName() +
                                "' already covers an overlapping validity period for this room type."
                );
            }
        }
    }

    private void validatePriceAndDates(BigDecimal basePrice, LocalDate validFrom, LocalDate validTo) {
        if (basePrice == null || basePrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Base price cannot be negative");
        }
        if (validFrom != null && validTo != null && validTo.isBefore(validFrom)) {
            throw new IllegalArgumentException("valid_to cannot be earlier than valid_from");
        }
    }

    private MealPlan parseMealPlan(String value) {
        if (value == null || value.trim().isEmpty()) {
            return MealPlan.EP;
        }
        try {
            return MealPlan.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unsupported meal plan: " + value + ". Supported values: EP, CP, MAP, AP");
        }
    }

    private CancellationPolicyType parseCancellationPolicy(String value) {
        if (value == null || value.trim().isEmpty()) {
            return CancellationPolicyType.FREE_CANCELLATION;
        }
        try {
            return CancellationPolicyType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unsupported cancellation policy: " + value +
                    ". Supported values: FREE_CANCELLATION, NON_REFUNDABLE, PARTIAL_REFUND, CUSTOM");
        }
    }

    private CancellationFeeType parseCancellationFeeType(String value) {
        if (value == null || value.trim().isEmpty()) {
            return CancellationFeeType.NONE;
        }
        try {
            return CancellationFeeType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unsupported cancellation fee type: " + value +
                    ". Supported values: NONE, PERCENTAGE, FIXED_AMOUNT, FIRST_NIGHT");
        }
    }

    private RatePlanStatus parseStatus(String value) {
        if (value == null || value.trim().isEmpty()) {
            return RatePlanStatus.ACTIVE;
        }
        try {
            return RatePlanStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unsupported status: " + value + ". Supported values: DRAFT, ACTIVE, INACTIVE");
        }
    }

    public HotelRatePlanDto mapToDto(HotelRatePlan plan) {
        return HotelRatePlanDto.builder()
                .id(plan.getId())
                .roomTypeId(plan.getRoomType().getId())
                .roomTypeName(plan.getRoomType().getRoomTypeName())
                .hotelId(plan.getRoomType().getHotel().getId())
                .hotelName(plan.getRoomType().getHotel().getHotelName())
                .planName(plan.getPlanName())
                .mealPlan(plan.getMealPlan().name())
                .mealPlanDisplayName(plan.getMealPlan().getDisplayName())
                .description(plan.getDescription())
                .basePrice(plan.getBasePrice())
                .currency(plan.getCurrency())
                .priceUnit(plan.getPriceUnit())
                .validFrom(plan.getValidFrom())
                .validTo(plan.getValidTo())
                .cancellationPolicy(plan.getCancellationPolicy().name())
                .cancellationPolicyDisplayName(plan.getCancellationPolicy().getDisplayName())
                .cancellationDeadlineHours(plan.getCancellationDeadlineHours())
                .cancellationFeeType(plan.getCancellationFeeType().name())
                .cancellationFeeValue(plan.getCancellationFeeValue())
                .taxesIncluded(plan.getTaxesIncluded())
                .feesIncluded(plan.getFeesIncluded())
                .sourceType(plan.getSourceType().name())
                .status(plan.getStatus().name())
                .isDemoData(plan.getIsDemoData())
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build();
    }
}
