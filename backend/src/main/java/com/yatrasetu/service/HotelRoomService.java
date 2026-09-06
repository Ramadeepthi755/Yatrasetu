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
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HotelRoomService {

    private final HotelRoomTypeRepository roomTypeRepository;
    private final HotelInventoryRepository inventoryRepository;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;

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
