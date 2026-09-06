package com.yatrasetu.service;

import com.yatrasetu.config.ResourceNotFoundException;
import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.web.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HotelAvailabilityService {

    private final HotelRepository hotelRepository;
    private final HotelRoomTypeRepository roomTypeRepository;
    private final HotelInventoryRepository inventoryRepository;
    private final HotelRatePlanRepository ratePlanRepository;
    private final HotelRatePlanService ratePlanService;

    /**
     * Traveler/Public availability query:
     * Deterministically calculates date-specific room availability for a requested stay window.
     * Check-in date is inclusive; Check-out date is exclusive.
     *
     * Architectural Boundary Note (Phase 22.5):
     * AVAILABLE_UNITS(date) = TOTAL_UNITS(date) - BLOCKED_UNITS(date) - FUTURE_RESERVED_UNITS(date)
     * Because the booking and reservation engine is introduced in Phase 22.6, FUTURE_RESERVED_UNITS = 0.
     */
    @Transactional(readOnly = true)
    public HotelAvailabilityDto getHotelAvailability(
            String hotelId,
            String roomTypeId,
            LocalDate checkIn,
            LocalDate checkOut,
            Integer guests) {

        validateDateRange(checkIn, checkOut);

        if (guests != null && guests < 1) {
            throw new IllegalArgumentException("Guests count must be at least 1");
        }

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found: " + hotelId));

        int totalNights = (int) ChronoUnit.DAYS.between(checkIn, checkOut);

        // 1. Check for inactive or suspended properties
        if (Boolean.FALSE.equals(hotel.getIsActive()) ||
                hotel.getVerificationStatus() == HotelVerificationStatus.REJECTED ||
                hotel.getVerificationStatus() == HotelVerificationStatus.SUSPENDED) {
            return buildUnavailableResponse(hotel, checkIn, checkOut, totalNights,
                    "Property is not currently active for live availability.");
        }

        // 2. DATASET properties: Do NOT generate synthetic inventory. Honestly return UNAVAILABLE_DATA.
        boolean isPartnerProperty = Boolean.TRUE.equals(hotel.getIsPartnerProperty()) && hotel.getOwner() != null;
        if (!isPartnerProperty || hotel.getVerificationStatus() != HotelVerificationStatus.VERIFIED) {
            return buildUnavailableResponse(hotel, checkIn, checkOut, totalNights,
                    "Live availability is not currently provided for this dataset property.");
        }

        // 3. Resolve active room types for verified partner hotel
        List<HotelRoomType> roomTypes;
        if (roomTypeId != null && !roomTypeId.isBlank()) {
            HotelRoomType specificRoom = roomTypeRepository.findById(roomTypeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Room type not found: " + roomTypeId));

            if (!specificRoom.getHotel().getId().equals(hotelId)) {
                throw new IllegalArgumentException("Room type " + roomTypeId + " does not belong to hotel " + hotelId);
            }
            if (Boolean.FALSE.equals(specificRoom.getIsActive())) {
                return buildUnavailableResponse(hotel, checkIn, checkOut, totalNights,
                        "Requested room type is currently inactive.");
            }
            roomTypes = List.of(specificRoom);
        } else {
            roomTypes = roomTypeRepository.findByHotelIdAndIsActiveTrueOrderByCreatedAtAsc(hotelId);
        }

        if (roomTypes.isEmpty()) {
            return buildUnavailableResponse(hotel, checkIn, checkOut, totalNights,
                    "No active room configurations found for this property.");
        }

        // Optional filtering by guest capacity
        if (guests != null) {
            roomTypes = roomTypes.stream()
                    .filter(r -> r.getMaxOccupancy() != null && r.getMaxOccupancy() >= guests)
                    .collect(Collectors.toList());
            if (roomTypes.isEmpty()) {
                return buildUnavailableResponse(hotel, checkIn, checkOut, totalNights,
                        "No rooms available that accommodate " + guests + " guests.");
            }
        }

        List<String> roomTypeIds = roomTypes.stream().map(HotelRoomType::getId).collect(Collectors.toList());
        LocalDate searchEndDate = checkOut.minusDays(1); // Check-out date is excluded from night evaluation

        // 4. Batch queries to prevent N+1 performance degradation across multi-night stays
        List<HotelInventory> dateSpecificList = inventoryRepository.findByRoomTypeIdInAndInventoryDateBetween(
                roomTypeIds, checkIn, searchEndDate);
        List<HotelInventory> baselineList = inventoryRepository.findByRoomTypeIdInAndInventoryDateIsNull(roomTypeIds);
        List<HotelRatePlan> activeRatePlans = ratePlanRepository.findByRoomTypeIdInAndStatus(
                roomTypeIds, RatePlanStatus.ACTIVE);

        // Map date-specific inventory: roomTypeId -> (inventoryDate -> HotelInventory)
        Map<String, Map<LocalDate, HotelInventory>> dateInventoryMap = new HashMap<>();
        for (HotelInventory inv : dateSpecificList) {
            if (inv.getRoomType() != null && inv.getInventoryDate() != null) {
                dateInventoryMap
                        .computeIfAbsent(inv.getRoomType().getId(), k -> new HashMap<>())
                        .put(inv.getInventoryDate(), inv);
            }
        }

        // Map baseline inventory: roomTypeId -> HotelInventory
        Map<String, HotelInventory> baselineInventoryMap = new HashMap<>();
        for (HotelInventory inv : baselineList) {
            if (inv.getRoomType() != null) {
                baselineInventoryMap.put(inv.getRoomType().getId(), inv);
            }
        }

        // Map active rate plans: roomTypeId -> List<HotelRatePlanDto>
        Map<String, List<HotelRatePlanDto>> ratePlanMap = new HashMap<>();
        for (HotelRatePlan rp : activeRatePlans) {
            if (rp.getRoomType() != null) {
                ratePlanMap
                        .computeIfAbsent(rp.getRoomType().getId(), k -> new ArrayList<>())
                        .add(ratePlanService.mapToDto(rp));
            }
        }

        // 5. Calculate availability for each room type across every night
        List<HotelAvailabilityDto.RoomTypeAvailabilityDto> roomAvailabilityList = new ArrayList<>();
        boolean hasAnyAvailableRoom = false;
        boolean allRoomsSoldOut = true;

        for (HotelRoomType room : roomTypes) {
            String rId = room.getId();
            HotelInventory baseInv = baselineInventoryMap.get(rId);
            Map<LocalDate, HotelInventory> dateOverrides = dateInventoryMap.getOrDefault(rId, Collections.emptyMap());

            List<HotelAvailabilityDto.NightlyAvailabilityDto> nightlyList = new ArrayList<>();
            int minAvailableAcrossStay = Integer.MAX_VALUE;

            for (LocalDate d = checkIn; d.isBefore(checkOut); d = d.plusDays(1)) {
                int totalUnits;
                int blockedUnits;
                boolean isDateOverride;

                if (dateOverrides.containsKey(d)) {
                    HotelInventory dateInv = dateOverrides.get(d);
                    totalUnits = dateInv.getTotalUnits() != null ? dateInv.getTotalUnits() : 0;
                    blockedUnits = dateInv.getBlockedUnits() != null ? dateInv.getBlockedUnits() : 0;
                    isDateOverride = true;
                } else if (baseInv != null) {
                    totalUnits = baseInv.getTotalUnits() != null ? baseInv.getTotalUnits() : room.getBaseInventoryUnits();
                    blockedUnits = baseInv.getBlockedUnits() != null ? baseInv.getBlockedUnits() : 0;
                    isDateOverride = false;
                } else {
                    totalUnits = room.getBaseInventoryUnits() != null ? room.getBaseInventoryUnits() : 1;
                    blockedUnits = 0;
                    isDateOverride = false;
                }

                // Defensive bounds clamping
                totalUnits = Math.max(0, totalUnits);
                blockedUnits = Math.max(0, blockedUnits);
                if (blockedUnits > totalUnits) {
                    blockedUnits = totalUnits;
                }

                int nightAvailable = totalUnits - blockedUnits;
                minAvailableAcrossStay = Math.min(minAvailableAcrossStay, nightAvailable);

                nightlyList.add(HotelAvailabilityDto.NightlyAvailabilityDto.builder()
                        .date(d)
                        .totalUnits(totalUnits)
                        .blockedUnits(blockedUnits)
                        .availableUnits(nightAvailable)
                        .isDateOverride(isDateOverride)
                        .build());
            }

            int overallAvailableUnits = minAvailableAcrossStay == Integer.MAX_VALUE ? 0 : minAvailableAcrossStay;
            HotelAvailabilityStatus roomStatus;
            boolean isAvailable;

            if (overallAvailableUnits <= 0) {
                roomStatus = HotelAvailabilityStatus.SOLD_OUT;
                isAvailable = false;
            } else if (overallAvailableUnits <= 2) {
                roomStatus = HotelAvailabilityStatus.LIMITED;
                isAvailable = true;
                hasAnyAvailableRoom = true;
                allRoomsSoldOut = false;
            } else {
                roomStatus = HotelAvailabilityStatus.AVAILABLE;
                isAvailable = true;
                hasAnyAvailableRoom = true;
                allRoomsSoldOut = false;
            }

            roomAvailabilityList.add(HotelAvailabilityDto.RoomTypeAvailabilityDto.builder()
                    .roomTypeId(room.getId())
                    .roomTypeName(room.getRoomTypeName())
                    .description(room.getDescription())
                    .maxOccupancy(room.getMaxOccupancy())
                    .bedConfiguration(room.getBedConfiguration())
                    .roomSizeSqft(room.getRoomSizeSqft())
                    .amenities(room.getAmenities() != null ? room.getAmenities() : List.of())
                    .isAccessible(room.getIsAccessible())
                    .baseInventoryUnits(room.getBaseInventoryUnits())
                    .status(roomStatus)
                    .isAvailable(isAvailable)
                    .availableUnits(overallAvailableUnits)
                    .nightly(nightlyList)
                    .ratePlans(ratePlanMap.getOrDefault(room.getId(), List.of()))
                    .provenance("PARTNER_SUBMITTED")
                    .build());
        }

        HotelAvailabilityStatus overallHotelStatus;
        if (hasAnyAvailableRoom) {
            overallHotelStatus = HotelAvailabilityStatus.AVAILABLE;
        } else if (allRoomsSoldOut) {
            overallHotelStatus = HotelAvailabilityStatus.SOLD_OUT;
        } else {
            overallHotelStatus = HotelAvailabilityStatus.UNAVAILABLE_DATA;
        }

        return HotelAvailabilityDto.builder()
                .hotelId(hotel.getId())
                .hotelName(hotel.getHotelName())
                .checkIn(checkIn)
                .checkOut(checkOut)
                .totalNights(totalNights)
                .isPartnerProperty(true)
                .isLiveAvailability(true)
                .status(overallHotelStatus)
                .provenance("PARTNER_SUBMITTED")
                .note("Date-specific availability is calculated from verified partner-managed inventory.")
                .rooms(roomAvailabilityList)
                .build();
    }

    private void validateDateRange(LocalDate checkIn, LocalDate checkOut) {
        if (checkIn == null || checkOut == null) {
            throw new IllegalArgumentException("Check-in and check-out dates are required");
        }
        if (!checkOut.isAfter(checkIn)) {
            throw new IllegalArgumentException("Check-out date (" + checkOut + ") must be strictly after check-in date (" + checkIn + ")");
        }
        long daysBetween = ChronoUnit.DAYS.between(checkIn, checkOut);
        if (daysBetween > 60) {
            throw new IllegalArgumentException("Search date range cannot exceed 60 nights (requested " + daysBetween + " nights)");
        }
    }

    private HotelAvailabilityDto buildUnavailableResponse(
            Hotel hotel,
            LocalDate checkIn,
            LocalDate checkOut,
            int totalNights,
            String note) {
        return HotelAvailabilityDto.builder()
                .hotelId(hotel.getId())
                .hotelName(hotel.getHotelName())
                .checkIn(checkIn)
                .checkOut(checkOut)
                .totalNights(totalNights)
                .isPartnerProperty(Boolean.TRUE.equals(hotel.getIsPartnerProperty()))
                .isLiveAvailability(false)
                .status(HotelAvailabilityStatus.UNAVAILABLE_DATA)
                .provenance(hotel.getSourceType() != null ? hotel.getSourceType().name() : "DATASET")
                .note(note)
                .rooms(List.of())
                .build();
    }
}
