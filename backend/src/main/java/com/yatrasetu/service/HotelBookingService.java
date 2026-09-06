package com.yatrasetu.service;

import com.yatrasetu.config.ConflictException;
import com.yatrasetu.config.ResourceNotFoundException;
import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.web.dto.CreateHotelBookingRequest;
import com.yatrasetu.web.dto.HotelBookingDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HotelBookingService {

    private final HotelBookingRepository bookingRepository;
    private final HotelBookingAllocationRepository allocationRepository;
    private final HotelRepository hotelRepository;
    private final HotelRoomTypeRepository roomTypeRepository;
    private final HotelInventoryRepository inventoryRepository;
    private final HotelRatePlanRepository ratePlanRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    @Value("${app.hotel.booking.pending-expiry-minutes:30}")
    private long pendingExpiryMinutes = 30;

    private static final String ALPHANUMERIC = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Transactionally create a real hotel booking with atomic availability verification
     * and immutable commercial price snapshot.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public HotelBookingDto createBooking(String hotelId, CreateHotelBookingRequest request, String userIdOrEmail) {
        User traveler = resolveUser(userIdOrEmail);

        validateBookingDates(request.getCheckIn(), request.getCheckOut());

        if (request.getNumberOfRooms() == null || request.getNumberOfRooms() < 1) {
            throw new IllegalArgumentException("Number of rooms must be at least 1");
        }

        // 1. Durable Idempotency Check
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            Optional<HotelBooking> existing = bookingRepository.findByIdempotencyKey(request.getIdempotencyKey().trim());
            if (existing.isPresent()) {
                HotelBooking b = existing.get();
                // If the same key is reused for identical parameters, safely return existing booking
                if (b.getTraveler().getId().equals(traveler.getId()) &&
                        b.getHotel().getId().equals(hotelId) &&
                        b.getRoomType().getId().equals(request.getRoomTypeId()) &&
                        b.getRatePlan().getId().equals(request.getRatePlanId()) &&
                        b.getCheckIn().equals(request.getCheckIn()) &&
                        b.getCheckOut().equals(request.getCheckOut()) &&
                        b.getNumberOfRooms().equals(request.getNumberOfRooms())) {
                    log.info("Returning idempotent booking {} for key {}", b.getBookingReference(), request.getIdempotencyKey());
                    return mapToDto(b, true);
                } else {
                    throw new ConflictException("Idempotency key was previously used for a different booking request.");
                }
            }
        }

        // 2. Fetch and Validate Hotel Eligibility
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found: " + hotelId));

        if (Boolean.FALSE.equals(hotel.getIsActive()) ||
                hotel.getVerificationStatus() == HotelVerificationStatus.REJECTED ||
                hotel.getVerificationStatus() == HotelVerificationStatus.SUSPENDED) {
            throw new IllegalArgumentException("Hotel is currently inactive or not eligible for booking.");
        }

        // DATASET hotel safety: 1,007 dataset catalog hotels MUST NOT be booked
        boolean isPartnerProperty = Boolean.TRUE.equals(hotel.getIsPartnerProperty()) && hotel.getOwner() != null;
        if (!isPartnerProperty || hotel.getVerificationStatus() != HotelVerificationStatus.VERIFIED) {
            throw new IllegalArgumentException("Live booking is not currently available for this dataset property.");
        }

        // Partners cannot create traveler bookings for themselves
        if (traveler.getId().equals(hotel.getOwner().getId())) {
            throw new IllegalArgumentException("Partners cannot create bookings for their own property.");
        }

        // 3. Fetch and Validate Room Type (Acquire authoritative DB row-level lock)
        HotelRoomType roomType = roomTypeRepository.findByIdWithLock(request.getRoomTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Room type not found: " + request.getRoomTypeId()));

        if (!roomType.getHotel().getId().equals(hotel.getId())) {
            throw new IllegalArgumentException("Room type " + request.getRoomTypeId() + " does not belong to hotel " + hotelId);
        }

        if (Boolean.FALSE.equals(roomType.getIsActive())) {
            throw new IllegalArgumentException("Requested room type is currently inactive.");
        }

        // Max occupancy validation
        int totalGuests = (request.getAdults() != null ? request.getAdults() : 1) +
                (request.getChildren() != null ? request.getChildren() : 0);
        int maxAllowed = (roomType.getMaxOccupancy() != null ? roomType.getMaxOccupancy() : 2) * request.getNumberOfRooms();
        if (totalGuests > maxAllowed) {
            throw new IllegalArgumentException("Total guests (" + totalGuests + ") exceeds maximum capacity (" + maxAllowed + ") for " + request.getNumberOfRooms() + " room(s).");
        }

        // 4. Fetch and Validate Rate Plan
        HotelRatePlan ratePlan = ratePlanRepository.findById(request.getRatePlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Rate plan not found: " + request.getRatePlanId()));

        if (!ratePlan.getRoomType().getId().equals(roomType.getId())) {
            throw new IllegalArgumentException("Rate plan " + request.getRatePlanId() + " does not belong to room type " + roomType.getId());
        }

        if (ratePlan.getStatus() != RatePlanStatus.ACTIVE) {
            throw new IllegalArgumentException("Requested rate plan is currently inactive.");
        }

        if (ratePlan.getValidFrom() != null && request.getCheckIn().isBefore(ratePlan.getValidFrom())) {
            throw new IllegalArgumentException("Stay check-in date is prior to rate plan validity start date.");
        }

        if (ratePlan.getValidTo() != null && request.getCheckOut().isAfter(ratePlan.getValidTo())) {
            throw new IllegalArgumentException("Stay check-out date is after rate plan validity end date.");
        }

        int numberOfNights = (int) ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
        LocalDate searchEndDate = request.getCheckOut().minusDays(1);

        // 5. Authoritative Server-Side Availability Recheck (Inside DB Transaction)
        List<HotelInventory> dateSpecificList = inventoryRepository.findByRoomTypeIdAndInventoryDateBetween(
                roomType.getId(), request.getCheckIn(), searchEndDate);
        Optional<HotelInventory> baselineOpt = inventoryRepository.findByRoomTypeIdAndInventoryDateIsNull(roomType.getId());

        Map<LocalDate, HotelInventory> dateOverrides = new HashMap<>();
        for (HotelInventory inv : dateSpecificList) {
            if (inv.getInventoryDate() != null) {
                dateOverrides.put(inv.getInventoryDate(), inv);
            }
        }

        HotelInventory baseInv = baselineOpt.orElse(null);

        // Fetch currently active reservation allocations for this room type across the stay window
        List<Object[]> activeAllocations = allocationRepository.findActiveReservedUnitsByRoomTypeIdAndDateRange(
                roomType.getId(), request.getCheckIn(), searchEndDate, BookingAllocationStatus.ACTIVE);

        Map<LocalDate, Integer> reservedUnitsMap = new HashMap<>();
        for (Object[] row : activeAllocations) {
            LocalDate date = (LocalDate) row[0];
            Number sum = (Number) row[1];
            reservedUnitsMap.put(date, sum != null ? sum.intValue() : 0);
        }

        // Verify capacity for EVERY night
        for (LocalDate d = request.getCheckIn(); d.isBefore(request.getCheckOut()); d = d.plusDays(1)) {
            int totalUnits;
            int blockedUnits;

            if (dateOverrides.containsKey(d)) {
                HotelInventory dateInv = dateOverrides.get(d);
                totalUnits = dateInv.getTotalUnits() != null ? dateInv.getTotalUnits() : 0;
                blockedUnits = dateInv.getBlockedUnits() != null ? dateInv.getBlockedUnits() : 0;
            } else if (baseInv != null) {
                totalUnits = baseInv.getTotalUnits() != null ? baseInv.getTotalUnits() : roomType.getBaseInventoryUnits();
                blockedUnits = baseInv.getBlockedUnits() != null ? baseInv.getBlockedUnits() : 0;
            } else {
                totalUnits = roomType.getBaseInventoryUnits() != null ? roomType.getBaseInventoryUnits() : 1;
                blockedUnits = 0;
            }

            totalUnits = Math.max(0, totalUnits);
            blockedUnits = Math.max(0, blockedUnits);
            if (blockedUnits > totalUnits) {
                blockedUnits = totalUnits;
            }

            int reservedUnits = reservedUnitsMap.getOrDefault(d, 0);
            int availableUnits = Math.max(0, totalUnits - blockedUnits - reservedUnits);

            if (availableUnits < request.getNumberOfRooms()) {
                throw new ConflictException("Insufficient room availability on " + d + " for room type '" +
                        roomType.getRoomTypeName() + "' (requested: " + request.getNumberOfRooms() +
                        ", available: " + availableUnits + ").");
            }
        }

        // 6. Calculate Commercial Price Snapshot (Immutable)
        BigDecimal pricePerNight = ratePlan.getBasePrice();
        if (pricePerNight == null || pricePerNight.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Rate plan base price is invalid or unconfigured.");
        }

        BigDecimal subtotal = pricePerNight
                .multiply(BigDecimal.valueOf(numberOfNights))
                .multiply(BigDecimal.valueOf(request.getNumberOfRooms()));

        // Honest Tax & Fee Calculation (No invented GST or fabricated percentages)
        BigDecimal taxesAmount = BigDecimal.ZERO;
        BigDecimal feesAmount = BigDecimal.ZERO;
        BigDecimal totalAmount = subtotal.add(taxesAmount).add(feesAmount);

        // 7. Generate Unique Booking Reference
        String bookingReference = generateUniqueBookingReference();
        String bookingId = "bk-" + UUID.randomUUID().toString().substring(0, 12);
        Instant now = Instant.now();
        Instant expiresAt = now.plus(Duration.ofMinutes(pendingExpiryMinutes));

        HotelBooking booking = HotelBooking.builder()
                .id(bookingId)
                .bookingReference(bookingReference)
                .traveler(traveler)
                .hotel(hotel)
                .roomType(roomType)
                .ratePlan(ratePlan)
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .numberOfRooms(request.getNumberOfRooms())
                .numberOfNights(numberOfNights)
                .adults(request.getAdults())
                .children(request.getChildren() != null ? request.getChildren() : 0)
                .guestName(request.getGuestName().trim())
                .guestEmail(request.getGuestEmail().trim())
                .guestPhone(request.getGuestPhone().trim())
                .specialRequests(request.getSpecialRequests() != null ? request.getSpecialRequests().trim() : null)
                .currency(ratePlan.getCurrency() != null ? ratePlan.getCurrency() : "INR")
                .pricePerNight(pricePerNight)
                .subtotal(subtotal)
                .taxesAmount(taxesAmount)
                .feesAmount(feesAmount)
                .totalAmount(totalAmount)
                .bookingStatus(HotelBookingStatus.PENDING_PAYMENT)
                .paymentStatus(HotelPaymentStatus.UNPAID)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .idempotencyKey(request.getIdempotencyKey() != null ? request.getIdempotencyKey().trim() : null)
                .expiresAt(expiresAt)
                .createdAt(now)
                .updatedAt(now)
                .build();

        HotelBooking savedBooking = bookingRepository.save(booking);

        // 8. Create Per-Night Active Reservation Allocations
        List<HotelBookingAllocation> allocations = new ArrayList<>();
        for (LocalDate d = request.getCheckIn(); d.isBefore(request.getCheckOut()); d = d.plusDays(1)) {
            HotelBookingAllocation allocation = HotelBookingAllocation.builder()
                    .id("alloc-" + UUID.randomUUID().toString().substring(0, 12))
                    .booking(savedBooking)
                    .roomType(roomType)
                    .allocationDate(d)
                    .allocatedUnits(request.getNumberOfRooms())
                    .status(BookingAllocationStatus.ACTIVE)
                    .createdAt(now)
                    .build();
            allocations.add(allocation);
        }
        allocationRepository.saveAll(allocations);

        // 9. Emit In-App Notification to Traveler
        try {
            notificationRepository.save(Notification.builder()
                    .id("notif-" + UUID.randomUUID().toString().substring(0, 12))
                    .user(traveler)
                    .title("Hotel Booking Created")
                    .message("Your booking " + bookingReference + " at " + hotel.getHotelName() + " has been created. Payment is currently pending.")
                    .category("BOOKING")
                    .referenceLink("/trips")
                    .read(false)
                    .createdAt(now)
                    .build());
        } catch (Exception e) {
            log.warn("Failed to create in-app notification for booking {}: {}", bookingReference, e.getMessage());
        }

        log.info("Created real hotel booking {} (Id: {}) for traveler {} at hotel {}",
                bookingReference, bookingId, traveler.getEmail(), hotel.getHotelName());

        return mapToDto(savedBooking, true);
    }

    /**
     * Retrieve single booking details with RBAC.
     */
    @Transactional(readOnly = true)
    public HotelBookingDto getBookingByReference(String bookingReference, String userIdOrEmail) {
        User user = resolveUser(userIdOrEmail);

        HotelBooking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingReference));

        boolean isTraveler = booking.getTraveler().getId().equals(user.getId());
        boolean isOwner = booking.getHotel().getOwner() != null && booking.getHotel().getOwner().getId().equals(user.getId());
        boolean isGovernment = user.getRole() == Role.GOVERNMENT;

        if (!isTraveler && !isOwner && !isGovernment) {
            throw new AccessDeniedException("You do not have permission to view booking " + bookingReference);
        }

        return mapToDto(booking, isTraveler);
    }

    /**
     * Traveler: View all bookings for the authenticated user (for My Trips integration).
     */
    @Transactional(readOnly = true)
    public List<HotelBookingDto> getMyBookings(String userIdOrEmail) {
        User traveler = resolveUser(userIdOrEmail);

        List<HotelBooking> bookings = bookingRepository.findByTravelerIdOrderByCreatedAtDesc(traveler.getId());
        return bookings.stream().map(b -> mapToDto(b, true)).collect(Collectors.toList());
    }

    /**
     * Partner: View all bookings for a hotel owned by the partner.
     */
    @Transactional(readOnly = true)
    public List<HotelBookingDto> getPartnerHotelBookings(String hotelId, String userIdOrEmail) {
        return getPartnerHotelBookings(hotelId, null, userIdOrEmail);
    }

    @Transactional(readOnly = true)
    public List<HotelBookingDto> getPartnerHotelBookings(String hotelId, HotelBookingStatus statusFilter, String userIdOrEmail) {
        User partner = resolveUser(userIdOrEmail);

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found: " + hotelId));

        if (hotel.getOwner() == null || !hotel.getOwner().getId().equals(partner.getId())) {
            throw new AccessDeniedException("You do not have permission to access bookings for hotel " + hotelId);
        }

        List<HotelBooking> bookings;
        if (statusFilter != null) {
            bookings = bookingRepository.findByHotelIdAndBookingStatusOrderByCreatedAtDesc(hotelId, statusFilter);
        } else {
            bookings = bookingRepository.findByHotelIdOrderByCreatedAtDesc(hotelId);
        }

        return bookings.stream().map(b -> mapToDto(b, false)).collect(Collectors.toList());
    }

    /**
     * Configurable Option A: Transactional and idempotent expiration of stale PENDING_PAYMENT reservations.
     */
    @Transactional
    public int expirePendingBookings() {
        Instant cutoff = Instant.now();
        List<HotelBooking> expiredList = bookingRepository.findExpiredPendingBookings(HotelBookingStatus.PENDING_PAYMENT, cutoff);

        int count = 0;
        for (HotelBooking booking : expiredList) {
            booking.setBookingStatus(HotelBookingStatus.EXPIRED);
            booking.setUpdatedAt(Instant.now());
            bookingRepository.save(booking);

            allocationRepository.updateAllocationStatusByBookingId(
                    booking.getId(), BookingAllocationStatus.ACTIVE, BookingAllocationStatus.RELEASED);
            count++;
            log.info("Expired pending booking {} and released its inventory allocations", booking.getBookingReference());
        }
        return count;
    }

    /**
     * Cancel an existing booking and release all associated active allocations.
     */
    @Transactional
    public HotelBookingDto cancelBooking(String bookingReference, String userIdOrEmail) {
        return cancelBooking(bookingReference, "Cancelled by user", userIdOrEmail);
    }

    @Transactional
    public HotelBookingDto cancelBooking(String bookingReference, String reason, String userIdOrEmail) {
        User user = resolveUser(userIdOrEmail);

        HotelBooking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingReference));

        boolean isTraveler = booking.getTraveler().getId().equals(user.getId());
        boolean isOwner = booking.getHotel().getOwner() != null && booking.getHotel().getOwner().getId().equals(user.getId());

        if (!isTraveler && !isOwner) {
            throw new AccessDeniedException("You do not have permission to cancel booking " + bookingReference);
        }

        if (booking.getBookingStatus() == HotelBookingStatus.CANCELLED || booking.getBookingStatus() == HotelBookingStatus.EXPIRED) {
            return mapToDto(booking, isTraveler);
        }

        booking.setBookingStatus(HotelBookingStatus.CANCELLED);
        booking.setCancellationReason(reason != null ? reason.trim() : "Cancelled by user");
        booking.setCancelledAt(Instant.now());
        booking.setUpdatedAt(Instant.now());

        HotelBooking updated = bookingRepository.save(booking);

        allocationRepository.updateAllocationStatusByBookingId(
                booking.getId(), BookingAllocationStatus.ACTIVE, BookingAllocationStatus.RELEASED);

        log.info("Cancelled booking {} and released allocations", bookingReference);
        return mapToDto(updated, isTraveler);
    }

    private User resolveUser(String userIdOrEmail) {
        if (userIdOrEmail == null || userIdOrEmail.isBlank()) {
            throw new AccessDeniedException("Authentication required.");
        }
        return userRepository.findById(userIdOrEmail)
                .or(() -> userRepository.findByEmail(userIdOrEmail))
                .orElseThrow(() -> new ResourceNotFoundException("User not found for identifier: " + userIdOrEmail));
    }

    private void validateBookingDates(LocalDate checkIn, LocalDate checkOut) {
        if (checkIn == null || checkOut == null) {
            throw new IllegalArgumentException("Check-in and check-out dates are required");
        }
        if (!checkOut.isAfter(checkIn)) {
            throw new IllegalArgumentException("Check-out date (" + checkOut + ") must be strictly after check-in date (" + checkIn + ")");
        }
        if (checkIn.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Check-in date cannot be in the past");
        }
        long daysBetween = ChronoUnit.DAYS.between(checkIn, checkOut);
        if (daysBetween > 60) {
            throw new IllegalArgumentException("Booking duration cannot exceed 60 nights");
        }
    }

    private String generateUniqueBookingReference() {
        int year = LocalDate.now().getYear();
        for (int i = 0; i < 10; i++) {
            StringBuilder sb = new StringBuilder(6);
            for (int j = 0; j < 6; j++) {
                sb.append(ALPHANUMERIC.charAt(secureRandom.nextInt(ALPHANUMERIC.length())));
            }
            String candidate = "YTS-" + year + "-" + sb.toString();
            if (bookingRepository.findByBookingReference(candidate).isEmpty()) {
                return candidate;
            }
        }
        return "YTS-" + year + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public HotelBookingDto mapToDto(HotelBooking b, boolean includePrivatePii) {
        List<HotelBookingAllocation> allocs = allocationRepository.findByBookingId(b.getId());
        List<HotelBookingDto.BookingAllocationDto> allocDtos = allocs.stream()
                .map(a -> HotelBookingDto.BookingAllocationDto.builder()
                        .id(a.getId())
                        .allocationDate(a.getAllocationDate())
                        .allocatedUnits(a.getAllocatedUnits())
                        .status(a.getStatus().name())
                        .build())
                .collect(Collectors.toList());

        String pricingDisclosure;
        if (b.getTaxesAmount().compareTo(BigDecimal.ZERO) == 0 && b.getFeesAmount().compareTo(BigDecimal.ZERO) == 0) {
            pricingDisclosure = "Taxes and service fees are not currently configured/included in this baseline tariff.";
        } else {
            pricingDisclosure = "Taxes and fees are calculated according to partner pricing policy.";
        }

        return HotelBookingDto.builder()
                .id(b.getId())
                .bookingReference(b.getBookingReference())
                .travelerId(b.getTraveler() != null ? b.getTraveler().getId() : null)
                .guestName(b.getGuestName())
                .guestEmail(includePrivatePii ? b.getGuestEmail() : maskEmail(b.getGuestEmail()))
                .guestPhone(includePrivatePii ? b.getGuestPhone() : maskPhone(b.getGuestPhone()))
                .specialRequests(b.getSpecialRequests())
                .hotelId(b.getHotel() != null ? b.getHotel().getId() : null)
                .hotelName(b.getHotel() != null ? b.getHotel().getHotelName() : null)
                .hotelCity(b.getHotel() != null && b.getHotel().getCity() != null ? b.getHotel().getCity().getCityName() : null)
                .hotelState(b.getHotel() != null && b.getHotel().getCity() != null && b.getHotel().getCity().getState() != null
                        ? b.getHotel().getCity().getState().getStateName() : null)
                .hotelAddress(b.getHotel() != null ? b.getHotel().getAddress() : null)
                .roomTypeId(b.getRoomType() != null ? b.getRoomType().getId() : null)
                .roomTypeName(b.getRoomType() != null ? b.getRoomType().getRoomTypeName() : null)
                .ratePlanId(b.getRatePlan() != null ? b.getRatePlan().getId() : null)
                .ratePlanName(b.getRatePlan() != null ? b.getRatePlan().getPlanName() : null)
                .mealPlan(b.getRatePlan() != null && b.getRatePlan().getMealPlan() != null ? b.getRatePlan().getMealPlan().name() : null)
                .checkIn(b.getCheckIn())
                .checkOut(b.getCheckOut())
                .numberOfRooms(b.getNumberOfRooms())
                .numberOfNights(b.getNumberOfNights())
                .adults(b.getAdults())
                .children(b.getChildren())
                .currency(b.getCurrency())
                .pricePerNight(b.getPricePerNight())
                .subtotal(b.getSubtotal())
                .taxesAmount(b.getTaxesAmount())
                .feesAmount(b.getFeesAmount())
                .totalAmount(b.getTotalAmount())
                .pricingDisclosure(pricingDisclosure)
                .bookingStatus(b.getBookingStatus())
                .paymentStatus(b.getPaymentStatus())
                .sourceType(b.getSourceType() != null ? b.getSourceType().name() : "PARTNER_SUBMITTED")
                .idempotencyKey(b.getIdempotencyKey())
                .expiresAt(b.getExpiresAt())
                .cancelledAt(b.getCancelledAt())
                .cancellationReason(b.getCancellationReason())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .allocations(allocDtos)
                .build();
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***";
        int at = email.indexOf('@');
        if (at <= 2) return "*@" + email.substring(at + 1);
        return email.substring(0, 2) + "***@" + email.substring(at + 1);
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) return "******";
        return "******" + phone.substring(phone.length() - 4);
    }
}
