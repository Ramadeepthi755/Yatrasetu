package com.yatrasetu.service;

import com.yatrasetu.config.ResourceNotFoundException;
import com.yatrasetu.domain.*;
import com.yatrasetu.repository.HotelInventoryRepository;
import com.yatrasetu.repository.HotelRepository;
import com.yatrasetu.repository.HotelRoomTypeRepository;
import com.yatrasetu.repository.UserRepository;
import com.yatrasetu.web.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HotelRoomService {

    private final HotelRoomTypeRepository roomTypeRepository;
    private final HotelInventoryRepository inventoryRepository;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final com.yatrasetu.repository.HotelBookingAllocationRepository allocationRepository;

    /**
     * Traveler-facing: Get active room types for a publicly visible hotel.
     */
    @Transactional(readOnly = true)
    public List<HotelRoomTypeDto> getPublicRoomTypes(String hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found: " + hotelId));

        if (Boolean.FALSE.equals(hotel.getIsActive()) ||
                hotel.getVerificationStatus() == HotelVerificationStatus.REJECTED ||
                hotel.getVerificationStatus() == HotelVerificationStatus.SUSPENDED) {
            log.info("Hotel {} is not publicly visible or suspended; returning empty room list", hotelId);
            return List.of();
        }

        return roomTypeRepository.findByHotelIdAndIsActiveTrueOrderByCreatedAtAsc(hotelId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Partner-facing: Get all room types for own hotel.
     */
    @Transactional(readOnly = true)
    public List<HotelRoomTypeDto> getPartnerRoomTypes(String hotelId, String userEmailOrAuthId) {
        Hotel hotel = validateHotelOwnership(hotelId, userEmailOrAuthId);
        return roomTypeRepository.findByHotelIdOrderByCreatedAtAsc(hotel.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Partner-facing: Get specific room type by ID.
     */
    @Transactional(readOnly = true)
    public HotelRoomTypeDto getPartnerRoomTypeById(String hotelId, String roomTypeId, String userEmailOrAuthId) {
        validateHotelOwnership(hotelId, userEmailOrAuthId);
        HotelRoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Room type not found: " + roomTypeId));

        if (!roomType.getHotel().getId().equals(hotelId)) {
            throw new IllegalArgumentException("Room type " + roomTypeId + " does not belong to hotel " + hotelId);
        }

        return mapToDto(roomType);
    }

    /**
     * Partner-facing: Create a new room type with duplicate protection and initial inventory.
     */
    @Transactional
    public HotelRoomTypeDto createRoomType(String hotelId, CreateRoomTypeRequest request, String userEmailOrAuthId) {
        Hotel hotel = validateHotelOwnership(hotelId, userEmailOrAuthId);

        // Duplicate name protection for the same hotel
        roomTypeRepository.findByHotelIdAndNormalizedName(hotelId, request.getRoomTypeName())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "A room type named '" + request.getRoomTypeName() + "' already exists for this property."
                    );
                });

        if (request.getBaseInventoryUnits() != null && request.getBaseInventoryUnits() < 0) {
            throw new IllegalArgumentException("Base inventory units cannot be negative");
        }
        if (request.getMaxOccupancy() != null && request.getMaxOccupancy() < 1) {
            throw new IllegalArgumentException("Maximum occupancy must be at least 1 guest");
        }

        String roomId = "room-" + UUID.randomUUID().toString().substring(0, 8);
        HotelRoomType roomType = HotelRoomType.builder()
                .id(roomId)
                .hotel(hotel)
                .roomTypeName(request.getRoomTypeName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .maxOccupancy(request.getMaxOccupancy() != null ? request.getMaxOccupancy() : 2)
                .bedConfiguration(request.getBedConfiguration() != null ? request.getBedConfiguration().trim() : null)
                .roomSizeSqft(request.getRoomSizeSqft())
                .amenities(request.getAmenities() != null ? request.getAmenities() : List.of())
                .isAccessible(Boolean.TRUE.equals(request.getIsAccessible()))
                .baseInventoryUnits(request.getBaseInventoryUnits() != null ? request.getBaseInventoryUnits() : 1)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .isDemoData(Boolean.TRUE.equals(hotel.getIsDemoData()))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        HotelRoomType saved = roomTypeRepository.save(roomType);

        // Initialize baseline inventory record
        HotelInventory baseInventory = HotelInventory.builder()
                .id("inv-" + UUID.randomUUID().toString().substring(0, 8))
                .roomType(saved)
                .inventoryDate(null) // Baseline capacity
                .totalUnits(saved.getBaseInventoryUnits())
                .blockedUnits(0)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        inventoryRepository.save(baseInventory);

        log.info("Partner {} created room type {} [units={}] for hotel {}",
                userEmailOrAuthId, saved.getId(), saved.getBaseInventoryUnits(), hotelId);

        return mapToDto(saved);
    }

    /**
     * Partner-facing: Update room type details.
     */
    @Transactional
    public HotelRoomTypeDto updateRoomType(String hotelId, String roomTypeId, UpdateRoomTypeRequest request, String userEmailOrAuthId) {
        validateHotelOwnership(hotelId, userEmailOrAuthId);

        HotelRoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Room type not found: " + roomTypeId));

        if (!roomType.getHotel().getId().equals(hotelId)) {
            throw new IllegalArgumentException("Room type " + roomTypeId + " does not belong to hotel " + hotelId);
        }

        if (request.getRoomTypeName() != null && !request.getRoomTypeName().isBlank()) {
            String newName = request.getRoomTypeName().trim();
            roomTypeRepository.findByHotelIdAndNormalizedNameExcluding(hotelId, newName, roomTypeId)
                    .ifPresent(existing -> {
                        throw new IllegalArgumentException(
                                "Another room type named '" + newName + "' already exists for this property."
                        );
                    });
            roomType.setRoomTypeName(newName);
        }

        if (request.getDescription() != null) {
            roomType.setDescription(request.getDescription().trim());
        }
        if (request.getMaxOccupancy() != null) {
            if (request.getMaxOccupancy() < 1) {
                throw new IllegalArgumentException("Maximum occupancy must be at least 1");
            }
            roomType.setMaxOccupancy(request.getMaxOccupancy());
        }
        if (request.getBedConfiguration() != null) {
            roomType.setBedConfiguration(request.getBedConfiguration().trim());
        }
        if (request.getRoomSizeSqft() != null) {
            roomType.setRoomSizeSqft(request.getRoomSizeSqft());
        }
        if (request.getAmenities() != null) {
            roomType.setAmenities(request.getAmenities());
        }
        if (request.getIsAccessible() != null) {
            roomType.setIsAccessible(request.getIsAccessible());
        }
        if (request.getIsActive() != null) {
            roomType.setIsActive(request.getIsActive());
        }
        if (request.getBaseInventoryUnits() != null) {
            if (request.getBaseInventoryUnits() < 0) {
                throw new IllegalArgumentException("Base inventory units cannot be negative");
            }
            roomType.setBaseInventoryUnits(request.getBaseInventoryUnits());
            // Sync baseline inventory record
            inventoryRepository.findByRoomTypeIdAndInventoryDateIsNull(roomTypeId)
                    .ifPresentOrElse(
                            inv -> {
                                inv.setTotalUnits(request.getBaseInventoryUnits());
                                if (inv.getBlockedUnits() > request.getBaseInventoryUnits()) {
                                    inv.setBlockedUnits(request.getBaseInventoryUnits());
                                }
                                inv.setUpdatedAt(Instant.now());
                                inventoryRepository.save(inv);
                            },
                            () -> {
                                HotelInventory newInv = HotelInventory.builder()
                                        .id("inv-" + UUID.randomUUID().toString().substring(0, 8))
                                        .roomType(roomType)
                                        .inventoryDate(null)
                                        .totalUnits(request.getBaseInventoryUnits())
                                        .blockedUnits(0)
                                        .sourceType(SourceType.PARTNER_SUBMITTED)
                                        .createdAt(Instant.now())
                                        .updatedAt(Instant.now())
                                        .build();
                                inventoryRepository.save(newInv);
                            }
                    );
        }

        roomType.setUpdatedAt(Instant.now());
        HotelRoomType saved = roomTypeRepository.save(roomType);
        log.info("Partner {} updated room type {} for hotel {}", userEmailOrAuthId, roomTypeId, hotelId);
        return mapToDto(saved);
    }

    /**
     * Partner-facing: Delete room type.
     */
    @Transactional
    public void deleteRoomType(String hotelId, String roomTypeId, String userEmailOrAuthId) {
        validateHotelOwnership(hotelId, userEmailOrAuthId);

        HotelRoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Room type not found: " + roomTypeId));

        if (!roomType.getHotel().getId().equals(hotelId)) {
            throw new IllegalArgumentException("Room type " + roomTypeId + " does not belong to hotel " + hotelId);
        }

        long activeCount = allocationRepository.countByRoomTypeIdAndStatus(roomTypeId, BookingAllocationStatus.ACTIVE);
        if (activeCount > 0) {
            throw new IllegalStateException("Cannot delete room type with active reservations (" + activeCount + " active reservations found). Please deactivate the room type instead.");
        }

        inventoryRepository.deleteByRoomTypeId(roomTypeId);
        roomTypeRepository.delete(roomType);
        log.info("Partner {} deleted room type {} from hotel {}", userEmailOrAuthId, roomTypeId, hotelId);
    }

    /**
     * Partner-facing: Get inventory records for a room type.
     */
    @Transactional(readOnly = true)
    public List<HotelInventoryDto> getRoomInventory(String hotelId, String roomTypeId, String userEmailOrAuthId) {
        validateHotelOwnership(hotelId, userEmailOrAuthId);

        HotelRoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Room type not found: " + roomTypeId));

        if (!roomType.getHotel().getId().equals(hotelId)) {
            throw new IllegalArgumentException("Room type " + roomTypeId + " does not belong to hotel " + hotelId);
        }

        return inventoryRepository.findByRoomTypeIdOrderByInventoryDateAsc(roomTypeId)
                .stream()
                .map(this::mapToInventoryDto)
                .collect(Collectors.toList());
    }

    /**
     * Partner-facing: Update/Set physical inventory capacity.
     */
    @Transactional
    public HotelInventoryDto updateRoomInventory(String hotelId, String roomTypeId, UpdateInventoryRequest request, String userEmailOrAuthId) {
        validateHotelOwnership(hotelId, userEmailOrAuthId);

        HotelRoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Room type not found: " + roomTypeId));

        if (!roomType.getHotel().getId().equals(hotelId)) {
            throw new IllegalArgumentException("Room type " + roomTypeId + " does not belong to hotel " + hotelId);
        }

        if (request.getTotalUnits() == null || request.getTotalUnits() < 0) {
            throw new IllegalArgumentException("Total units cannot be negative");
        }
        int blocked = request.getBlockedUnits() != null ? request.getBlockedUnits() : 0;
        if (blocked < 0) {
            throw new IllegalArgumentException("Blocked units cannot be negative");
        }
        if (blocked > request.getTotalUnits()) {
            throw new IllegalArgumentException("Blocked units (" + blocked + ") cannot exceed total units (" + request.getTotalUnits() + ")");
        }

        // Safety: ensure physical inventory is not reduced below current active reservations
        if (request.getInventoryDate() != null) {
            List<Object[]> activeAllocs = allocationRepository.findActiveReservedUnitsByRoomTypeIdAndDateRange(
                    roomTypeId, request.getInventoryDate(), request.getInventoryDate(), BookingAllocationStatus.ACTIVE);
            int reserved = 0;
            if (!activeAllocs.isEmpty()) {
                Number sum = (Number) activeAllocs.get(0)[1];
                reserved = sum != null ? sum.intValue() : 0;
            }
            if (request.getTotalUnits() < reserved) {
                throw new IllegalArgumentException("Total units (" + request.getTotalUnits() +
                        ") cannot be reduced below active reservations (" + reserved + ") for date " + request.getInventoryDate());
            }
        }

        HotelInventory inventory;
        if (request.getInventoryDate() != null) {
            inventory = inventoryRepository.findByRoomTypeIdAndInventoryDate(roomTypeId, request.getInventoryDate())
                    .orElseGet(() -> HotelInventory.builder()
                            .id("inv-" + UUID.randomUUID().toString().substring(0, 8))
                            .roomType(roomType)
                            .inventoryDate(request.getInventoryDate())
                            .sourceType(SourceType.PARTNER_SUBMITTED)
                            .createdAt(Instant.now())
                            .build());
        } else {
            inventory = inventoryRepository.findByRoomTypeIdAndInventoryDateIsNull(roomTypeId)
                    .orElseGet(() -> HotelInventory.builder()
                            .id("inv-" + UUID.randomUUID().toString().substring(0, 8))
                            .roomType(roomType)
                            .inventoryDate(null)
                            .sourceType(SourceType.PARTNER_SUBMITTED)
                            .createdAt(Instant.now())
                            .build());
            // Sync base units on room type
            roomType.setBaseInventoryUnits(request.getTotalUnits());
            roomTypeRepository.save(roomType);
        }

        inventory.setTotalUnits(request.getTotalUnits());
        inventory.setBlockedUnits(blocked);
        inventory.setUpdatedAt(Instant.now());

        HotelInventory saved = inventoryRepository.save(inventory);
        log.info("Partner {} updated inventory for room {} [total={}, blocked={}]",
                userEmailOrAuthId, roomTypeId, saved.getTotalUnits(), saved.getBlockedUnits());

        return mapToInventoryDto(saved);
    }

    /**
     * Partner-facing: Bulk Update/Set date-specific inventory across a date range.
     */
    @Transactional
    public List<HotelInventoryDto> updateBulkRoomInventory(
            String hotelId,
            String roomTypeId,
            BulkInventoryUpdateRequest request,
            String userEmailOrAuthId) {

        validateHotelOwnership(hotelId, userEmailOrAuthId);

        HotelRoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Room type not found: " + roomTypeId));

        if (!roomType.getHotel().getId().equals(hotelId)) {
            throw new IllegalArgumentException("Room type " + roomTypeId + " does not belong to hotel " + hotelId);
        }

        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new IllegalArgumentException("Start date and end date are required for bulk inventory update");
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date (" + request.getEndDate() + ") cannot be before start date (" + request.getStartDate() + ")");
        }

        long daysCount = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        if (daysCount > 90) {
            throw new IllegalArgumentException("Bulk inventory update range cannot exceed 90 days (requested " + daysCount + " days)");
        }

        if (request.getTotalUnits() == null || request.getTotalUnits() < 0) {
            throw new IllegalArgumentException("Total units cannot be negative");
        }

        int blocked = request.getBlockedUnits() != null ? request.getBlockedUnits() : 0;
        if (blocked < 0) {
            throw new IllegalArgumentException("Blocked units cannot be negative");
        }
        if (blocked > request.getTotalUnits()) {
            throw new IllegalArgumentException("Blocked units (" + blocked + ") cannot exceed total units (" + request.getTotalUnits() + ")");
        }

        // Safety: verify total units against active reservations on each date in the range
        List<Object[]> activeAllocs = allocationRepository.findActiveReservedUnitsByRoomTypeIdAndDateRange(
                roomTypeId, request.getStartDate(), request.getEndDate(), BookingAllocationStatus.ACTIVE);
        Map<LocalDate, Integer> reservedMap = new HashMap<>();
        for (Object[] row : activeAllocs) {
            LocalDate date = (LocalDate) row[0];
            Number sum = (Number) row[1];
            reservedMap.put(date, sum != null ? sum.intValue() : 0);
        }

        for (LocalDate d = request.getStartDate(); !d.isAfter(request.getEndDate()); d = d.plusDays(1)) {
            int reserved = reservedMap.getOrDefault(d, 0);
            if (request.getTotalUnits() < reserved) {
                throw new IllegalArgumentException("Total units (" + request.getTotalUnits() +
                        ") cannot be reduced below active reservations (" + reserved + ") on " + d);
            }
        }

        // Fetch existing date-specific records in range
        List<HotelInventory> existingList = inventoryRepository.findByRoomTypeIdAndInventoryDateBetween(
                roomTypeId, request.getStartDate(), request.getEndDate());
        Map<LocalDate, HotelInventory> existingMap = new HashMap<>();
        for (HotelInventory inv : existingList) {
            if (inv.getInventoryDate() != null) {
                existingMap.put(inv.getInventoryDate(), inv);
            }
        }

        List<HotelInventory> toSave = new ArrayList<>();
        for (LocalDate d = request.getStartDate(); !d.isAfter(request.getEndDate()); d = d.plusDays(1)) {
            HotelInventory inv = existingMap.get(d);
            if (inv == null) {
                inv = HotelInventory.builder()
                        .id("inv-" + UUID.randomUUID().toString().substring(0, 8))
                        .roomType(roomType)
                        .inventoryDate(d)
                        .sourceType(SourceType.PARTNER_SUBMITTED)
                        .createdAt(Instant.now())
                        .build();
            }
            inv.setTotalUnits(request.getTotalUnits());
            inv.setBlockedUnits(blocked);
            inv.setUpdatedAt(Instant.now());
            toSave.add(inv);
        }

        List<HotelInventory> savedList = inventoryRepository.saveAll(toSave);
        log.info("Partner {} bulk-updated {} days inventory for room {} [total={}, blocked={}]",
                userEmailOrAuthId, savedList.size(), roomTypeId, request.getTotalUnits(), blocked);

        return savedList.stream().map(this::mapToInventoryDto).collect(Collectors.toList());
    }

    /**
     * Partner-facing: Get authoritative inventory calendar with total, blocked, reserved, and available units.
     */
    @Transactional(readOnly = true)
    public List<HotelInventoryCalendarDto> getPartnerHotelInventoryCalendar(
            String hotelId,
            String roomTypeId,
            LocalDate startDate,
            LocalDate endDate,
            String userEmailOrAuthId) {

        validateHotelOwnership(hotelId, userEmailOrAuthId);

        HotelRoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Room type not found: " + roomTypeId));

        if (!roomType.getHotel().getId().equals(hotelId)) {
            throw new IllegalArgumentException("Room type " + roomTypeId + " does not belong to hotel " + hotelId);
        }

        LocalDate start = (startDate != null) ? startDate : LocalDate.now();
        LocalDate end = (endDate != null) ? endDate : start.plusDays(29);

        if (end.isBefore(start)) {
            throw new IllegalArgumentException("End date (" + end + ") cannot be before start date (" + start + ")");
        }

        long daysCount = ChronoUnit.DAYS.between(start, end) + 1;
        if (daysCount > 90) {
            throw new IllegalArgumentException("Calendar range cannot exceed 90 days (requested " + daysCount + " days)");
        }

        // Fetch date-specific records
        List<HotelInventory> dateRecords = inventoryRepository.findByRoomTypeIdAndInventoryDateBetween(roomTypeId, start, end);
        Map<LocalDate, HotelInventory> dateMap = new HashMap<>();
        for (HotelInventory inv : dateRecords) {
            if (inv.getInventoryDate() != null) {
                dateMap.put(inv.getInventoryDate(), inv);
            }
        }

        // Fetch baseline inventory record
        Optional<HotelInventory> baselineOpt = inventoryRepository.findByRoomTypeIdAndInventoryDateIsNull(roomTypeId);
        int defaultTotalUnits = baselineOpt.map(HotelInventory::getTotalUnits)
                .orElseGet(() -> roomType.getBaseInventoryUnits() != null ? roomType.getBaseInventoryUnits() : 0);
        int defaultBlockedUnits = baselineOpt.map(HotelInventory::getBlockedUnits).orElse(0);

        // Fetch active allocations
        List<Object[]> activeAllocs = allocationRepository.findActiveReservedUnitsByRoomTypeIdAndDateRange(
                roomTypeId, start, end, BookingAllocationStatus.ACTIVE);
        Map<LocalDate, Integer> reservedMap = new HashMap<>();
        for (Object[] row : activeAllocs) {
            LocalDate date = (LocalDate) row[0];
            Number sum = (Number) row[1];
            reservedMap.put(date, sum != null ? sum.intValue() : 0);
        }

        List<HotelInventoryCalendarDto> calendarList = new ArrayList<>();
        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            HotelInventory inv = dateMap.get(d);
            int total = (inv != null && inv.getTotalUnits() != null) ? inv.getTotalUnits() : defaultTotalUnits;
            int blocked = (inv != null && inv.getBlockedUnits() != null) ? inv.getBlockedUnits() : defaultBlockedUnits;
            int reserved = reservedMap.getOrDefault(d, 0);
            int available = Math.max(0, total - blocked - reserved);

            calendarList.add(HotelInventoryCalendarDto.builder()
                    .date(d)
                    .roomTypeId(roomTypeId)
                    .roomTypeName(roomType.getRoomTypeName())
                    .totalUnits(total)
                    .blockedUnits(blocked)
                    .reservedUnits(reserved)
                    .availableUnits(available)
                    .isDateSpecific(inv != null)
                    .build());
        }

        return calendarList;
    }

    /**
     * Helper: Validate that the authenticated user owns the parent hotel.
     */
    private Hotel validateHotelOwnership(String hotelId, String userEmailOrAuthId) {
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
            throw new AccessDeniedException("You do not have permission to manage room types for this property.");
        }

        return hotel;
    }

    public HotelRoomTypeDto mapToDto(HotelRoomType r) {
        return HotelRoomTypeDto.builder()
                .id(r.getId())
                .hotelId(r.getHotel() != null ? r.getHotel().getId() : null)
                .hotelName(r.getHotel() != null ? r.getHotel().getHotelName() : null)
                .roomTypeName(r.getRoomTypeName())
                .description(r.getDescription())
                .maxOccupancy(r.getMaxOccupancy())
                .bedConfiguration(r.getBedConfiguration())
                .roomSizeSqft(r.getRoomSizeSqft())
                .amenities(r.getAmenities() != null ? r.getAmenities() : List.of())
                .isAccessible(r.getIsAccessible())
                .baseInventoryUnits(r.getBaseInventoryUnits())
                .sourceType(r.getSourceType() != null ? r.getSourceType().name() : "PARTNER_SUBMITTED")
                .isActive(r.getIsActive())
                .isDemoData(r.getIsDemoData())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }

    public HotelInventoryDto mapToInventoryDto(HotelInventory i) {
        return HotelInventoryDto.builder()
                .id(i.getId())
                .roomTypeId(i.getRoomType() != null ? i.getRoomType().getId() : null)
                .roomTypeName(i.getRoomType() != null ? i.getRoomType().getRoomTypeName() : null)
                .hotelId(i.getRoomType() != null && i.getRoomType().getHotel() != null ? i.getRoomType().getHotel().getId() : null)
                .inventoryDate(i.getInventoryDate())
                .totalUnits(i.getTotalUnits())
                .blockedUnits(i.getBlockedUnits())
                .sourceType(i.getSourceType() != null ? i.getSourceType().name() : "PARTNER_SUBMITTED")
                .createdAt(i.getCreatedAt())
                .updatedAt(i.getUpdatedAt())
                .build();
    }
}
