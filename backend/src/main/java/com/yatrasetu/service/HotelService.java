package com.yatrasetu.service;

import com.yatrasetu.domain.*;
import com.yatrasetu.repository.CityRepository;
import com.yatrasetu.repository.DestinationRepository;
import com.yatrasetu.repository.HotelRepository;
import com.yatrasetu.repository.UserRepository;
import com.yatrasetu.web.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HotelService {

    private final HotelRepository hotelRepository;
    private final DestinationRepository destinationRepository;
    private final CityRepository cityRepository;
    private final UserRepository userRepository;

    // ==========================================
    // PUBLIC HOTEL DISCOVERY
    // ==========================================

    @Transactional(readOnly = true)
    public Page<HotelDto> getAllHotels(
            String cityId,
            String destinationId,
            String category,
            BigDecimal minRating,
            BigDecimal maxPrice,
            Boolean isPartnerProperty,
            String search,
            Pageable pageable) {

        String cleanedCity = (cityId != null && !cityId.trim().isEmpty() && !cityId.equalsIgnoreCase("all")) ? cityId.trim() : null;
        String cleanedDest = (destinationId != null && !destinationId.trim().isEmpty() && !destinationId.equalsIgnoreCase("all")) ? destinationId.trim() : null;
        String cleanedCat = (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("all")) ? category.trim() : null;
        String cleanedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        String targetCityId = null;
        if (cleanedDest != null) {
            var destOpt = destinationRepository.findById(cleanedDest);
            if (destOpt.isPresent() && destOpt.get().getCity() != null) {
                targetCityId = destOpt.get().getCity().getId();
            }
        }

        return hotelRepository.findWithFilters(
                cleanedCity,
                cleanedDest,
                targetCityId,
                cleanedCat,
                minRating,
                maxPrice,
                isPartnerProperty,
                cleanedSearch,
                pageable
        ).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<HotelDto> getHotelById(String id) {
        return hotelRepository.findById(id).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<HotelDto> getHotelsByDestination(String destinationId) {
        List<Hotel> hotels = hotelRepository.findByDestinationId(destinationId);
        if (hotels.isEmpty()) {
            var destOpt = destinationRepository.findById(destinationId);
            if (destOpt.isPresent()) {
                var dest = destOpt.get();
                if (dest.getCity() != null) {
                    hotels = hotelRepository.findByCityId(dest.getCity().getId());
                }
                if (hotels.isEmpty() && dest.getLatitude() != null && dest.getLongitude() != null) {
                    hotels = hotelRepository.findNearestHotels(dest.getLatitude().doubleValue(), dest.getLongitude().doubleValue(), 12);
                }
            }
        }
        return hotels.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HotelDto> getHotelsByCity(String cityId) {
        return hotelRepository.findByCityId(cityId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getCategories() {
        return hotelRepository.findDistinctCategories();
    }

    // ==========================================
    // PARTNER HOTEL ONBOARDING & MANAGEMENT
    // ==========================================

    @Transactional(readOnly = true)
    public List<HotelDto> getMyHotels(String userId) {
        User user = resolvePartnerUser(userId);
        return hotelRepository.findByOwnerId(user.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HotelDto getMyHotelById(String userId, String hotelId) {
        User user = resolvePartnerUser(userId);
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new NoSuchElementException("Hotel not found with id: " + hotelId));

        if (hotel.getOwner() == null || !hotel.getOwner().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not own this hotel property");
        }

        return toDto(hotel);
    }

    @Transactional
    public HotelDto createPartnerHotel(String userId, CreateHotelRequest request) {
        User user = resolvePartnerUser(userId);

        // 1. Geographic Validation
        City city = cityRepository.findById(request.getCityId())
                .orElseThrow(() -> new IllegalArgumentException("City not found with id: " + request.getCityId()));

        Destination destination = null;
        if (request.getDestinationId() != null && !request.getDestinationId().trim().isEmpty()) {
            destination = destinationRepository.findById(request.getDestinationId().trim())
                    .orElseThrow(() -> new IllegalArgumentException("Destination not found with id: " + request.getDestinationId()));

            // Validate destination belongs to same state or city if defined
            if (destination.getCity() != null && !destination.getCity().getId().equalsIgnoreCase(city.getId())) {
                log.warn("Destination city {} differs from requested hotel city {}", destination.getCity().getId(), city.getId());
            }
        }

        // Validate coordinates if provided
        validateCoordinates(request.getLatitude(), request.getLongitude());

        // 2. Duplicate property check
        boolean duplicateExists = hotelRepository.existsByHotelNameIgnoreCaseAndCityId(request.getHotelName().trim(), city.getId());
        if (duplicateExists) {
            log.info("Note: Property with similar name '{}' already exists in city '{}'", request.getHotelName(), city.getId());
        }

        String hotelId = "htl-partner-" + UUID.randomUUID().toString().substring(0, 8);

        Hotel hotel = Hotel.builder()
                .id(hotelId)
                .hotelName(request.getHotelName().trim())
                .owner(user)
                .city(city)
                .destination(destination)
                .category(request.getCategory() != null ? request.getCategory() : "Mid-Range")
                .pricePerNight(request.getPricePerNight())
                .amenities(request.getAmenities() != null ? request.getAmenities() : new ArrayList<>())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .contactPhone(request.getContactPhone())
                .contactEmail(request.getContactEmail())
                .officialWebsite(request.getOfficialWebsite())
                .checkInTime(request.getCheckInTime())
                .checkOutTime(request.getCheckOutTime())
                .hotelRating(BigDecimal.valueOf(4.5))
                .isPartnerProperty(true)
                .inventoryType("PARTNER_PMS")
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .verificationStatus(HotelVerificationStatus.UNVERIFIED)
                .isDemoData(false)
                .isActive(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        Hotel saved = hotelRepository.save(hotel);
        log.info("Partner {} created hotel property {} [{}]", user.getId(), saved.getId(), saved.getHotelName());
        return toDto(saved);
    }

    @Transactional
    public HotelDto updatePartnerHotel(String userId, String hotelId, UpdateHotelRequest request) {
        User user = resolvePartnerUser(userId);
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new NoSuchElementException("Hotel not found with id: " + hotelId));

        if (hotel.getOwner() == null || !hotel.getOwner().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not own this hotel property");
        }

        // Geographic Validation
        City city = cityRepository.findById(request.getCityId())
                .orElseThrow(() -> new IllegalArgumentException("City not found with id: " + request.getCityId()));

        Destination destination = null;
        if (request.getDestinationId() != null && !request.getDestinationId().trim().isEmpty()) {
            destination = destinationRepository.findById(request.getDestinationId().trim())
                    .orElseThrow(() -> new IllegalArgumentException("Destination not found with id: " + request.getDestinationId()));
        }

        validateCoordinates(request.getLatitude(), request.getLongitude());

        // Check if critical verified fields changed -> triggers re-verification!
        boolean criticalFieldChanged = !hotel.getHotelName().equalsIgnoreCase(request.getHotelName().trim())
                || (hotel.getCity() != null && !hotel.getCity().getId().equalsIgnoreCase(city.getId()))
                || (hotel.getAddress() != null && !hotel.getAddress().equalsIgnoreCase(request.getAddress()))
                || (hotel.getCategory() != null && !hotel.getCategory().equalsIgnoreCase(request.getCategory()));

        if (hotel.getVerificationStatus() == HotelVerificationStatus.VERIFIED && criticalFieldChanged) {
            hotel.setVerificationStatus(HotelVerificationStatus.PENDING_REVIEW);
            hotel.setVerificationNotes("Re-verification required following partner update to critical property details.");
            log.info("Hotel {} reset to PENDING_REVIEW due to modification of verified fields by partner {}", hotel.getId(), user.getId());
        }

        hotel.setHotelName(request.getHotelName().trim());
        hotel.setCity(city);
        hotel.setDestination(destination);
        hotel.setCategory(request.getCategory());
        hotel.setPricePerNight(request.getPricePerNight());
        hotel.setAddress(request.getAddress());
        hotel.setAmenities(request.getAmenities() != null ? request.getAmenities() : new ArrayList<>());
        hotel.setLatitude(request.getLatitude());
        hotel.setLongitude(request.getLongitude());
        hotel.setContactPhone(request.getContactPhone());
        hotel.setContactEmail(request.getContactEmail());
        hotel.setOfficialWebsite(request.getOfficialWebsite());
        hotel.setCheckInTime(request.getCheckInTime());
        hotel.setCheckOutTime(request.getCheckOutTime());
        hotel.setUpdatedAt(Instant.now());

        Hotel saved = hotelRepository.save(hotel);
        log.info("Partner {} updated hotel property {}", user.getId(), saved.getId());
        return toDto(saved);
    }

    @Transactional
    public HotelDto submitHotelForVerification(String userId, String hotelId) {
        User user = resolvePartnerUser(userId);
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new NoSuchElementException("Hotel not found with id: " + hotelId));

        if (hotel.getOwner() == null || !hotel.getOwner().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not own this hotel property");
        }

        hotel.setVerificationStatus(HotelVerificationStatus.PENDING_REVIEW);
        hotel.setUpdatedAt(Instant.now());

        Hotel saved = hotelRepository.save(hotel);
        log.info("Partner {} submitted hotel {} for verification", user.getId(), saved.getId());
        return toDto(saved);
    }

    @Transactional
    public void deletePartnerHotel(String userId, String hotelId) {
        User user = resolvePartnerUser(userId);
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new NoSuchElementException("Hotel not found with id: " + hotelId));

        if (hotel.getOwner() == null || !hotel.getOwner().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not own this hotel property");
        }

        hotelRepository.delete(hotel);
        log.info("Partner {} deleted hotel property {}", user.getId(), hotelId);
    }

    // ==========================================
    // GOVERNMENT HOTEL VERIFICATION WORKFLOW
    // ==========================================

    @Transactional(readOnly = true)
    public List<HotelDto> getPendingVerificationHotels() {
        return hotelRepository.findByVerificationStatus(HotelVerificationStatus.PENDING_REVIEW)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HotelDto getHotelForGovernmentReview(String hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new NoSuchElementException("Hotel not found with id: " + hotelId));
        return toDto(hotel);
    }

    @Transactional
    public HotelDto verifyHotel(String verifierUserId, String hotelId, HotelVerificationRequest request) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new NoSuchElementException("Hotel not found with id: " + hotelId));

        String decision = request.getDecision() != null ? request.getDecision().toUpperCase().trim() : "";

        switch (decision) {
            case "APPROVED":
            case "VERIFIED":
                hotel.setVerificationStatus(HotelVerificationStatus.VERIFIED);
                hotel.setVerifiedBy(verifierUserId);
                hotel.setVerifiedAt(Instant.now());
                hotel.setVerificationNotes(request.getNotes() != null ? request.getNotes() : "Approved by YatraSetu authorized verification.");
                hotel.setIsPartnerProperty(true);
                hotel.setRejectionReason(null);
                log.info("Government official {} approved hotel property {}", verifierUserId, hotelId);
                break;

            case "REJECTED":
                hotel.setVerificationStatus(HotelVerificationStatus.REJECTED);
                hotel.setVerifiedBy(verifierUserId);
                hotel.setVerifiedAt(Instant.now());
                hotel.setRejectionReason(request.getRejectionReason() != null ? request.getRejectionReason() : "Submission does not meet verification requirements.");
                hotel.setVerificationNotes(request.getNotes());
                log.info("Government official {} rejected hotel property {}", verifierUserId, hotelId);
                break;

            case "SUSPENDED":
                hotel.setVerificationStatus(HotelVerificationStatus.SUSPENDED);
                hotel.setVerifiedBy(verifierUserId);
                hotel.setVerifiedAt(Instant.now());
                hotel.setVerificationNotes(request.getNotes() != null ? request.getNotes() : "Property suspended pending review.");
                log.info("Government official {} suspended hotel property {}", verifierUserId, hotelId);
                break;

            default:
                throw new IllegalArgumentException("Invalid verification decision: " + request.getDecision() + ". Expected APPROVED, REJECTED, or SUSPENDED.");
        }

        hotel.setUpdatedAt(Instant.now());
        Hotel saved = hotelRepository.save(hotel);
        return toDto(saved);
    }

    // ==========================================
    // HELPERS & DTO CONVERTER
    // ==========================================

    private User resolvePartnerUser(String userId) {
        User user = userRepository.findById(userId)
                .or(() -> userRepository.findByAuthUserId(userId))
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + userId));

        if (user.getRole() != Role.PARTNER && user.getRole() != Role.GOVERNMENT) {
            throw new AccessDeniedException("User does not have PARTNER role privileges");
        }

        return user;
    }

    private void validateCoordinates(BigDecimal lat, BigDecimal lng) {
        if (lat != null && lng != null) {
            double latitude = lat.doubleValue();
            double longitude = lng.doubleValue();
            if (latitude < -90.0 || latitude > 90.0 || longitude < -180.0 || longitude > 180.0) {
                throw new IllegalArgumentException(String.format("Invalid coordinates: lat=%f, lng=%f", latitude, longitude));
            }
        }
    }

    public HotelDto toDto(Hotel h) {
        String stateId = null;
        String stateName = null;
        if (h.getCity() != null && h.getCity().getState() != null) {
            stateId = h.getCity().getState().getId();
            stateName = h.getCity().getState().getStateName();
        } else if (h.getDestination() != null && h.getDestination().getState() != null) {
            stateId = h.getDestination().getState().getId();
            stateName = h.getDestination().getState().getStateName();
        }

        return HotelDto.builder()
                .id(h.getId())
                .hotelName(h.getHotelName())
                .ownerId(h.getOwner() != null ? h.getOwner().getId() : null)
                .ownerName(h.getOwner() != null ? h.getOwner().getFullName() : null)
                .cityId(h.getCity() != null ? h.getCity().getId() : null)
                .cityName(h.getCity() != null ? h.getCity().getCityName() : null)
                .stateId(stateId)
                .stateName(stateName)
                .destinationId(h.getDestination() != null ? h.getDestination().getId() : null)
                .destinationName(h.getDestination() != null ? h.getDestination().getDestinationName() : null)
                .hotelRating(h.getHotelRating())
                .pricePerNight(h.getPricePerNight())
                .amenities(h.getAmenities())
                .category(h.getCategory())
                .address(h.getAddress())
                .latitude(h.getLatitude())
                .longitude(h.getLongitude())
                .isPartnerProperty(h.getIsPartnerProperty())
                .inventoryType(h.getInventoryType() != null ? h.getInventoryType() : "DATASET_PROPERTY")
                .sourceType(h.getSourceType() != null ? h.getSourceType().name() : "DATASET")
                .sourceLabel(ProvenanceUtil.getLabel(h.getSourceType(), h.getIsPartnerProperty()))
                .verificationStatus(h.getVerificationStatus() != null ? h.getVerificationStatus().name() : HotelVerificationStatus.UNVERIFIED.name())
                .verificationNotes(h.getVerificationNotes())
                .verifiedBy(h.getVerifiedBy())
                .verifiedAt(h.getVerifiedAt())
                .rejectionReason(h.getRejectionReason())
                .contactPhone(h.getContactPhone())
                .contactEmail(h.getContactEmail())
                .officialWebsite(h.getOfficialWebsite())
                .checkInTime(h.getCheckInTime())
                .checkOutTime(h.getCheckOutTime())
                .isDemoData(h.getIsDemoData())
                .isActive(h.getIsActive())
                .createdAt(h.getCreatedAt())
                .updatedAt(h.getUpdatedAt())
                .build();
    }
}
