package com.yatrasetu.service;

import com.yatrasetu.config.ConflictException;
import com.yatrasetu.config.ResourceNotFoundException;
import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.web.dto.CancelHotelBookingRequest;
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
    private final HotelBookingStatusHistoryRepository statusHistoryRepository;
    private final HotelRepository hotelRepository;
    private final HotelRoomTypeRepository roomTypeRepository;
    private final HotelInventoryRepository inventoryRepository;
    private final HotelRatePlanRepository ratePlanRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private final com.yatrasetu.service.document.HotelBookingVoucherService voucherService;

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

        // 7. Generate Unique Booking Reference and Snapshots
        String bookingReference = generateUniqueBookingReference();
        String bookingId = "bk-" + UUID.randomUUID().toString().substring(0, 12);
        Instant now = Instant.now();
        Instant expiresAt = now.plus(Duration.ofMinutes(pendingExpiryMinutes));

        String policySnapshot = ratePlan.getCancellationPolicy() != null
                ? ratePlan.getCancellationPolicy().name()
                : "CANCELLATION_POLICY_UNAVAILABLE";
        Integer deadlineHours = ratePlan.getCancellationDeadlineHours();

        String paymentMethod = (request.getPaymentMethod() != null && !request.getPaymentMethod().isBlank())
                ? request.getPaymentMethod().trim().toUpperCase()
                : "ONLINE";

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
                .bookingStatus(HotelBookingStatus.REQUESTED)
                .paymentStatus(HotelPaymentStatus.UNPAID)
                .paymentMethod(paymentMethod)
                .sourceType(SourceType.PARTNER_SUBMITTED)
                .idempotencyKey(request.getIdempotencyKey() != null ? request.getIdempotencyKey().trim() : null)
                .expiresAt(expiresAt)
                .cancellationPolicySnapshot(policySnapshot)
                .cancellationDeadlineHours(deadlineHours)
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

        // 9. Record Initial Status History
        statusHistoryRepository.save(HotelBookingStatusHistory.builder()
                .id("hist-" + UUID.randomUUID().toString().substring(0, 12))
                .booking(savedBooking)
                .previousStatus(null)
                .newStatus(HotelBookingStatus.REQUESTED)
                .reason("BOOKING_REQUESTED")
                .actorUser(traveler)
                .createdAt(now)
                .build());

        // 10. Emit Multi-Party In-App Notifications (Hotel Provider + Traveler)
        try {
            notificationService.emitHotelBookingRequested(savedBooking);
        } catch (Exception e) {
            log.warn("Failed to create in-app notification for booking {}: {}", bookingReference, e.getMessage());
        }

        log.info("Created real hotel booking {} (Id: {}) for traveler {} at hotel {} with status REQUESTED",
                bookingReference, bookingId, traveler.getEmail(), hotel.getHotelName());

        return mapToDto(savedBooking, true);
    }

    /**
     * Retrieve single booking details with RBAC & Lazy Expiry evaluation.
     */
    @Transactional
    public HotelBookingDto getBookingByReference(String bookingReference, String userIdOrEmail) {
        User user = resolveUser(userIdOrEmail);

        HotelBooking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingReference));

        // Lazy expiry check
        booking = checkAndExpireIfStale(booking);

        boolean isTraveler = booking.getTraveler().getId().equals(user.getId());
        boolean isOwner = booking.getHotel().getOwner() != null && booking.getHotel().getOwner().getId().equals(user.getId());
        boolean isGovernment = user.getRole() == Role.GOVERNMENT;

        if (!isTraveler && !isOwner && !isGovernment) {
            throw new AccessDeniedException("You do not have permission to view booking " + bookingReference);
        }

        return mapToDto(booking, isTraveler);
    }

    /**
     * Retrieve authoritative booking confirmation summary with status timeline and voucher availability.
     */
    @Transactional
    public com.yatrasetu.web.dto.BookingConfirmationDto getBookingConfirmation(String bookingReference, String userIdOrEmail) {
        User user = resolveUser(userIdOrEmail);

        HotelBooking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingReference));

        booking = checkAndExpireIfStale(booking);

        boolean isTraveler = booking.getTraveler().getId().equals(user.getId());
        boolean isOwner = booking.getHotel().getOwner() != null && booking.getHotel().getOwner().getId().equals(user.getId());
        boolean isGovernment = user.getRole() == Role.GOVERNMENT;

        if (!isTraveler && !isOwner && !isGovernment) {
            throw new AccessDeniedException("You do not have permission to view confirmation for booking " + bookingReference);
        }

        List<HotelBookingStatusHistory> histories = statusHistoryRepository.findByBookingIdOrderByCreatedAtAsc(booking.getId());
        List<HotelBookingDto.BookingStatusHistoryDto> timeline = histories.stream()
                .map(h -> HotelBookingDto.BookingStatusHistoryDto.builder()
                        .id(h.getId())
                        .previousStatus(h.getPreviousStatus() != null ? h.getPreviousStatus().name() : null)
                        .newStatus(h.getNewStatus().name())
                        .reason(h.getReason())
                        .actorUserId(h.getActorUser() != null ? h.getActorUser().getId() : null)
                        .createdAt(h.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        boolean voucherAvailable = booking.getBookingStatus() == HotelBookingStatus.CONFIRMED &&
                booking.getPaymentStatus() == HotelPaymentStatus.PAID;

        Instant confirmedAt = histories.stream()
                .filter(h -> h.getNewStatus() == HotelBookingStatus.CONFIRMED)
                .map(HotelBookingStatusHistory::getCreatedAt)
                .findFirst()
                .orElse(null);

        String pricingDisclosure;
        if (booking.getTaxesAmount().compareTo(BigDecimal.ZERO) == 0 && booking.getFeesAmount().compareTo(BigDecimal.ZERO) == 0) {
            pricingDisclosure = "Taxes and service fees are not currently configured/included in this baseline tariff.";
        } else {
            pricingDisclosure = "Taxes and fees are calculated according to partner pricing policy.";
        }

        return com.yatrasetu.web.dto.BookingConfirmationDto.builder()
                .bookingReference(booking.getBookingReference())
                .confirmationNumber(booking.getBookingReference())
                .bookingStatus(booking.getBookingStatus().name())
                .paymentStatus(booking.getPaymentStatus().name())
                .confirmationDate(confirmedAt)
                .createdAt(booking.getCreatedAt())
                .hotelId(booking.getHotel().getId())
                .hotelName(booking.getHotel().getHotelName())
                .hotelCity(booking.getHotel().getCity() != null ? booking.getHotel().getCity().getCityName() : null)
                .hotelState(booking.getHotel().getCity() != null && booking.getHotel().getCity().getState() != null
                        ? booking.getHotel().getCity().getState().getStateName() : null)
                .hotelAddress(booking.getHotel().getAddress())
                .isPartnerProperty(Boolean.TRUE.equals(booking.getHotel().getIsPartnerProperty()))
                .roomTypeId(booking.getRoomType().getId())
                .roomTypeName(booking.getRoomType().getRoomTypeName())
                .ratePlanId(booking.getRatePlan().getId())
                .ratePlanName(booking.getRatePlan().getPlanName())
                .mealPlan(booking.getRatePlan().getMealPlan() != null ? booking.getRatePlan().getMealPlan().name() : "EP")
                .checkIn(booking.getCheckIn())
                .checkOut(booking.getCheckOut())
                .numberOfNights(booking.getNumberOfNights())
                .numberOfRooms(booking.getNumberOfRooms())
                .adults(booking.getAdults())
                .children(booking.getChildren())
                .guestName(booking.getGuestName())
                .guestEmail(isTraveler ? booking.getGuestEmail() : maskEmail(booking.getGuestEmail()))
                .guestPhone(isTraveler ? booking.getGuestPhone() : maskPhone(booking.getGuestPhone()))
                .specialRequests(booking.getSpecialRequests())
                .currency(booking.getCurrency())
                .pricePerNight(booking.getPricePerNight())
                .subtotal(booking.getSubtotal())
                .taxesAmount(booking.getTaxesAmount())
                .feesAmount(booking.getFeesAmount())
                .totalAmount(booking.getTotalAmount())
                .pricingDisclosure(pricingDisclosure)
                .cancellationPolicySnapshot(booking.getCancellationPolicySnapshot())
                .cancellationDeadlineHours(booking.getCancellationDeadlineHours())
                .statusTimeline(timeline)
                .voucherAvailable(voucherAvailable)
                .voucherDownloadUrl(voucherAvailable ? "/api/v1/bookings/" + booking.getBookingReference() + "/voucher" : null)
                .dataProvenance("Authoritative YatraSetu Hotel Platform Record")
                .build();
    }

    /**
     * Generate authoritative PDF booking voucher (Traveler or Property Owner only).
     */
    @Transactional
    public byte[] generateBookingVoucher(String bookingReference, String userIdOrEmail) {
        User user = resolveUser(userIdOrEmail);

        HotelBooking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingReference));

        boolean isTraveler = booking.getTraveler().getId().equals(user.getId());
        boolean isOwner = booking.getHotel().getOwner() != null && booking.getHotel().getOwner().getId().equals(user.getId());

        if (!isTraveler && !isOwner) {
            throw new AccessDeniedException("Only the booking traveler or hotel property owner can download this voucher.");
        }

        if (booking.getBookingStatus() != HotelBookingStatus.CONFIRMED ||
                booking.getPaymentStatus() != HotelPaymentStatus.PAID) {
            throw new ConflictException("Confirmation voucher is available only for CONFIRMED and PAID bookings.");
        }

        return voucherService.generateBookingVoucherPdf(booking);
    }

    /**
     * Traveler: View all bookings for the authenticated user (for My Trips integration).
     */
    @Transactional
    public List<HotelBookingDto> getMyBookings(String userIdOrEmail) {
        User traveler = resolveUser(userIdOrEmail);

        List<HotelBooking> bookings = bookingRepository.findByTravelerIdOrderByCreatedAtDesc(traveler.getId());
        List<HotelBookingDto> dtos = new ArrayList<>();
        for (HotelBooking b : bookings) {
            HotelBooking evaluated = checkAndExpireIfStale(b);
            dtos.add(mapToDto(evaluated, true));
        }
        return dtos;
    }

    /**
     * Partner: View all bookings for a hotel owned by the partner.
     */
    @Transactional
    public List<HotelBookingDto> getPartnerHotelBookings(String hotelId, String userIdOrEmail) {
        return getPartnerHotelBookings(hotelId, null, userIdOrEmail);
    }

    @Transactional
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

        List<HotelBookingDto> dtos = new ArrayList<>();
        for (HotelBooking b : bookings) {
            HotelBooking evaluated = checkAndExpireIfStale(b);
            dtos.add(mapToDto(evaluated, false));
        }
        return dtos;
    }

    /**
     * Partner: View all hotel bookings across all properties owned by the authenticated partner.
     */
    @Transactional
    public List<HotelBookingDto> getAllPartnerHotelBookings(String userIdOrEmail) {
        User partner = resolveUser(userIdOrEmail);
        List<HotelBooking> bookings = bookingRepository.findByHotelOwnerIdOrderByCreatedAtDesc(partner.getId());
        List<HotelBookingDto> dtos = new ArrayList<>();
        for (HotelBooking b : bookings) {
            HotelBooking evaluated = checkAndExpireIfStale(b);
            dtos.add(mapToDto(evaluated, false));
        }
        return dtos;
    }

    /**
     * Partner: Accept a hotel booking request.
     * If ONLINE payment: status becomes ACCEPTED / PENDING_PAYMENT, tourist is notified to complete payment.
     * If PAY_AT_HOTEL: status becomes CONFIRMED, payment remains UNPAID, secure QR token is generated.
     */
    @Transactional
    public HotelBookingDto acceptHotelBooking(String bookingReference, String partnerUserIdOrEmail) {
        User partner = resolveUser(partnerUserIdOrEmail);
        HotelBooking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingReference));

        if (booking.getHotel().getOwner() == null || !booking.getHotel().getOwner().getId().equals(partner.getId())) {
            throw new AccessDeniedException("You do not own the hotel property for booking " + bookingReference);
        }

        if (booking.getBookingStatus() != HotelBookingStatus.REQUESTED) {
            throw new IllegalStateException("Only REQUESTED bookings can be accepted. Current status: " + booking.getBookingStatus());
        }

        Instant now = Instant.now();
        HotelBookingStatus previousStatus = booking.getBookingStatus();

        if ("PAY_AT_HOTEL".equalsIgnoreCase(booking.getPaymentMethod())) {
            // Confirm immediately for Pay-at-Hotel
            booking.setBookingStatus(HotelBookingStatus.CONFIRMED);
            booking.setQrToken(generateSecureQrToken());
            booking.setUpdatedAt(now);
            HotelBooking saved = bookingRepository.save(booking);

            statusHistoryRepository.save(HotelBookingStatusHistory.builder()
                    .id("hist-" + UUID.randomUUID().toString().substring(0, 12))
                    .booking(saved)
                    .previousStatus(previousStatus)
                    .newStatus(HotelBookingStatus.CONFIRMED)
                    .reason("PARTNER_ACCEPTED_PAY_AT_HOTEL")
                    .actorUser(partner)
                    .createdAt(now)
                    .build());

            notificationService.emitBookingConfirmationNotifications(saved);
            log.info("Partner accepted Pay-at-Hotel booking {}, status -> CONFIRMED with QR", bookingReference);
            return mapToDto(saved, false);
        } else {
            // Online payment pending
            booking.setBookingStatus(HotelBookingStatus.ACCEPTED);
            booking.setUpdatedAt(now);
            HotelBooking saved = bookingRepository.save(booking);

            statusHistoryRepository.save(HotelBookingStatusHistory.builder()
                    .id("hist-" + UUID.randomUUID().toString().substring(0, 12))
                    .booking(saved)
                    .previousStatus(previousStatus)
                    .newStatus(HotelBookingStatus.ACCEPTED)
                    .reason("PARTNER_ACCEPTED_ONLINE_PAYMENT_PENDING")
                    .actorUser(partner)
                    .createdAt(now)
                    .build());

            notificationService.emitHotelBookingAccepted(saved);
            log.info("Partner accepted Online Payment booking {}, status -> ACCEPTED", bookingReference);
            return mapToDto(saved, false);
        }
    }

    /**
     * Partner: Reject a hotel booking request with a mandatory/optional reason.
     */
    @Transactional
    public HotelBookingDto rejectHotelBooking(String bookingReference, String reason, String partnerUserIdOrEmail) {
        User partner = resolveUser(partnerUserIdOrEmail);
        HotelBooking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingReference));

        if (booking.getHotel().getOwner() == null || !booking.getHotel().getOwner().getId().equals(partner.getId())) {
            throw new AccessDeniedException("You do not own the hotel property for booking " + bookingReference);
        }

        if (booking.getBookingStatus() != HotelBookingStatus.REQUESTED &&
            booking.getBookingStatus() != HotelBookingStatus.ACCEPTED &&
            booking.getBookingStatus() != HotelBookingStatus.PENDING_PAYMENT) {
            throw new IllegalStateException("Cannot reject booking in status: " + booking.getBookingStatus());
        }

        Instant now = Instant.now();
        HotelBookingStatus previousStatus = booking.getBookingStatus();
        String rejectionReason = (reason != null && !reason.isBlank()) ? reason.trim() : "Declined by property partner";

        booking.setBookingStatus(HotelBookingStatus.REJECTED);
        booking.setRejectionReason(rejectionReason);
        booking.setCancellationReason(rejectionReason);
        booking.setUpdatedAt(now);
        HotelBooking saved = bookingRepository.save(booking);

        // Release inventory allocations
        allocationRepository.updateAllocationStatusByBookingId(
                booking.getId(), BookingAllocationStatus.ACTIVE, BookingAllocationStatus.RELEASED);

        statusHistoryRepository.save(HotelBookingStatusHistory.builder()
                .id("hist-" + UUID.randomUUID().toString().substring(0, 12))
                .booking(saved)
                .previousStatus(previousStatus)
                .newStatus(HotelBookingStatus.REJECTED)
                .reason("PARTNER_REJECTED: " + rejectionReason)
                .actorUser(partner)
                .createdAt(now)
                .build());

        notificationService.emitHotelBookingRejected(saved, rejectionReason);
        log.info("Partner rejected booking {} (Reason: {})", bookingReference, rejectionReason);
        return mapToDto(saved, false);
    }

    /**
     * Partner: Verify guest check-in QR token / booking reference.
     */
    @Transactional(readOnly = true)
    public HotelBookingDto verifyQrAndGetBooking(String qrTokenOrRef, String partnerUserIdOrEmail) {
        User partner = resolveUser(partnerUserIdOrEmail);
        if (qrTokenOrRef == null || qrTokenOrRef.isBlank()) {
            throw new IllegalArgumentException("QR check-in token or booking reference is required");
        }

        String cleanedToken = qrTokenOrRef.trim();
        HotelBooking booking = bookingRepository.findByQrToken(cleanedToken)
                .or(() -> bookingRepository.findByBookingReference(cleanedToken))
                .orElseThrow(() -> new ResourceNotFoundException("No active booking found for the provided check-in token."));

        if (booking.getHotel().getOwner() == null || !booking.getHotel().getOwner().getId().equals(partner.getId())) {
            throw new AccessDeniedException("This reservation does not belong to your hotel property.");
        }

        if (booking.getBookingStatus() != HotelBookingStatus.CONFIRMED && booking.getBookingStatus() != HotelBookingStatus.CHECKED_IN) {
            throw new ConflictException("Booking is in status " + booking.getBookingStatus() + ". Check-in requires CONFIRMED status.");
        }

        return mapToDto(booking, true); // Include guest details for physical ID verification
    }

    /**
     * Partner: Confirm guest check-in at reception after physical/QR verification.
     */
    @Transactional
    public HotelBookingDto checkinGuest(String qrTokenOrRef, String partnerUserIdOrEmail) {
        User partner = resolveUser(partnerUserIdOrEmail);
        if (qrTokenOrRef == null || qrTokenOrRef.isBlank()) {
            throw new IllegalArgumentException("QR check-in token or booking reference is required");
        }

        String cleanedToken = qrTokenOrRef.trim();
        HotelBooking booking = bookingRepository.findByQrToken(cleanedToken)
                .or(() -> bookingRepository.findByBookingReference(cleanedToken))
                .orElseThrow(() -> new ResourceNotFoundException("No active booking found for check-in: " + qrTokenOrRef));

        if (booking.getHotel().getOwner() == null || !booking.getHotel().getOwner().getId().equals(partner.getId())) {
            throw new AccessDeniedException("This reservation does not belong to your hotel property.");
        }

        if (booking.getBookingStatus() == HotelBookingStatus.CHECKED_IN) {
            log.info("Booking {} is already checked-in. Returning idempotent response.", booking.getBookingReference());
            return mapToDto(booking, true);
        }

        if (booking.getBookingStatus() != HotelBookingStatus.CONFIRMED) {
            throw new IllegalStateException("Booking must be in CONFIRMED status to perform check-in. Current: " + booking.getBookingStatus());
        }

        Instant now = Instant.now();
        HotelBookingStatus previousStatus = booking.getBookingStatus();

        booking.setBookingStatus(HotelBookingStatus.CHECKED_IN);
        booking.setCheckedInAt(now);
        booking.setUpdatedAt(now);
        HotelBooking saved = bookingRepository.save(booking);

        statusHistoryRepository.save(HotelBookingStatusHistory.builder()
                .id("hist-" + UUID.randomUUID().toString().substring(0, 12))
                .booking(saved)
                .previousStatus(previousStatus)
                .newStatus(HotelBookingStatus.CHECKED_IN)
                .reason("HOTEL_RECEPTION_CHECKIN_CONFIRMED")
                .actorUser(partner)
                .createdAt(now)
                .build());

        notificationService.emitHotelCheckinConfirmed(saved);
        log.info("Hotel check-in confirmed for booking {} by partner {}", saved.getBookingReference(), partner.getEmail());
        return mapToDto(saved, true);
    }

    /**
     * Partner: Complete stay / check-out guest at departure.
     */
    @Transactional
    public HotelBookingDto checkoutGuest(String bookingReference, String partnerUserIdOrEmail) {
        User partner = resolveUser(partnerUserIdOrEmail);
        HotelBooking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingReference));

        if (booking.getHotel().getOwner() == null || !booking.getHotel().getOwner().getId().equals(partner.getId())) {
            throw new AccessDeniedException("This reservation does not belong to your hotel property.");
        }

        if (booking.getBookingStatus() == HotelBookingStatus.CHECKED_OUT || booking.getBookingStatus() == HotelBookingStatus.COMPLETED) {
            return mapToDto(booking, true);
        }

        if (booking.getBookingStatus() != HotelBookingStatus.CHECKED_IN) {
            throw new IllegalStateException("Cannot check-out a reservation that is not currently CHECKED_IN. Current: " + booking.getBookingStatus());
        }

        Instant now = Instant.now();
        HotelBookingStatus previousStatus = booking.getBookingStatus();

        booking.setBookingStatus(HotelBookingStatus.CHECKED_OUT);
        booking.setCheckedOutAt(now);
        booking.setUpdatedAt(now);
        HotelBooking saved = bookingRepository.save(booking);

        // Release inventory allocations
        allocationRepository.updateAllocationStatusByBookingId(
                booking.getId(), BookingAllocationStatus.ACTIVE, BookingAllocationStatus.RELEASED);

        statusHistoryRepository.save(HotelBookingStatusHistory.builder()
                .id("hist-" + UUID.randomUUID().toString().substring(0, 12))
                .booking(saved)
                .previousStatus(previousStatus)
                .newStatus(HotelBookingStatus.CHECKED_OUT)
                .reason("HOTEL_STAY_COMPLETED_CHECKOUT")
                .actorUser(partner)
                .createdAt(now)
                .build());

        notificationService.emitHotelStayCompleted(saved);
        log.info("Hotel stay completed / checked out for booking {}", bookingReference);
        return mapToDto(saved, true);
    }

    /**
     * Traveler: Submit verified hotel review after completed stay.
     */
    @Transactional
    public HotelBookingDto submitHotelReview(String bookingReference, BigDecimal rating, String comment, String travelerUserIdOrEmail) {
        User traveler = resolveUser(travelerUserIdOrEmail);
        HotelBooking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingReference));

        if (!booking.getTraveler().getId().equals(traveler.getId())) {
            throw new AccessDeniedException("Only the booking traveler can review this stay.");
        }

        if (booking.getBookingStatus() != HotelBookingStatus.CHECKED_OUT && booking.getBookingStatus() != HotelBookingStatus.COMPLETED) {
            throw new IllegalStateException("Reviews can only be submitted after a verified stay is completed.");
        }

        if (booking.getReviewedAt() != null) {
            throw new ConflictException("You have already submitted a review for this reservation.");
        }

        if (rating == null || rating.compareTo(BigDecimal.ONE) < 0 || rating.compareTo(BigDecimal.valueOf(5)) > 0) {
            throw new IllegalArgumentException("Rating must be between 1.0 and 5.0");
        }

        Instant now = Instant.now();
        booking.setReviewRating(rating);
        booking.setReviewComment(comment != null ? comment.trim() : "");
        booking.setReviewedAt(now);
        booking.setUpdatedAt(now);
        HotelBooking saved = bookingRepository.save(booking);

        // Update hotel's average rating in database
        try {
            Hotel hotel = booking.getHotel();
            if (hotel != null) {
                BigDecimal currentRating = hotel.getHotelRating() != null ? hotel.getHotelRating() : BigDecimal.valueOf(4.5);
                BigDecimal newRating = currentRating.add(rating).divide(BigDecimal.valueOf(2), 1, java.math.RoundingMode.HALF_UP);
                hotel.setHotelRating(newRating);
                hotelRepository.save(hotel);
            }
        } catch (Exception e) {
            log.warn("Failed to update aggregate hotel rating: {}", e.getMessage());
        }

        log.info("Traveler {} submitted verified review for hotel booking {}", traveler.getEmail(), bookingReference);
        return mapToDto(saved, true);
    }

    public String generateSecureQrToken() {
        return "YATRASETU-HOTEL-CHECKIN:" + UUID.randomUUID().toString().replace("-", "").toUpperCase();
    }

    /**
     * Configurable Option A: Transactional and idempotent expiration of stale PENDING_PAYMENT reservations.
     */
    @Transactional
    public int expirePendingBookings() {
        Instant cutoff = Instant.now();
        List<HotelBooking> expiredList = bookingRepository.findExpiredPendingBookings(HotelBookingStatus.PENDING_PAYMENT, cutoff);
        List<HotelBooking> expiredRequested = bookingRepository.findExpiredPendingBookings(HotelBookingStatus.REQUESTED, cutoff);
        List<HotelBooking> allExpired = new ArrayList<>(expiredList);
        allExpired.addAll(expiredRequested);

        int count = 0;
        for (HotelBooking booking : allExpired) {
            if (booking.getBookingStatus() != HotelBookingStatus.PENDING_PAYMENT && booking.getBookingStatus() != HotelBookingStatus.REQUESTED) {
                continue; // Idempotency check
            }
            expireSingleBooking(booking);
            count++;
        }
        return count;
    }

    /**
     * Internal helper to expire a single pending booking, release allocations, record history, and emit notification.
     */
    private HotelBooking expireSingleBooking(HotelBooking booking) {
        HotelBookingStatus previousStatus = booking.getBookingStatus();
        booking.validateTransition(HotelBookingStatus.EXPIRED);

        booking.setBookingStatus(HotelBookingStatus.EXPIRED);
        booking.setCancellationReason("Reservation expired due to payment timeout.");
        booking.setCancellationReasonCode(CancellationReasonCode.PAYMENT_TIMEOUT);
        booking.setUpdatedAt(Instant.now());
        HotelBooking saved = bookingRepository.save(booking);

        allocationRepository.updateAllocationStatusByBookingId(
                booking.getId(), BookingAllocationStatus.ACTIVE, BookingAllocationStatus.RELEASED);

        statusHistoryRepository.save(HotelBookingStatusHistory.builder()
                .id("hist-" + UUID.randomUUID().toString().substring(0, 12))
                .booking(saved)
                .previousStatus(previousStatus)
                .newStatus(HotelBookingStatus.EXPIRED)
                .reason("SYSTEM_EXPIRY")
                .actorUser(null)
                .createdAt(Instant.now())
                .build());

        try {
            notificationRepository.save(Notification.builder()
                    .id("notif-" + UUID.randomUUID().toString().substring(0, 12))
                    .user(booking.getTraveler())
                    .title("Reservation Expired")
                    .message("Your reservation " + booking.getBookingReference() + " at " + booking.getHotel().getHotelName() + " has expired because payment was not completed within the timeout window.")
                    .category("BOOKING_EXPIRED")
                    .referenceLink("/trips")
                    .read(false)
                    .createdAt(Instant.now())
                    .build());
        } catch (Exception e) {
            log.warn("Failed to create in-app notification for expired booking {}: {}", booking.getBookingReference(), e.getMessage());
        }

        log.info("Expired pending booking {} and released its inventory allocations", booking.getBookingReference());
        return saved;
    }

    /**
     * Evaluates lazy expiration for a single booking if past expiry time.
     */
    private HotelBooking checkAndExpireIfStale(HotelBooking booking) {
        if (booking.getBookingStatus() == HotelBookingStatus.PENDING_PAYMENT &&
                booking.getExpiresAt() != null &&
                booking.getExpiresAt().isBefore(Instant.now())) {
            return expireSingleBooking(booking);
        }
        return booking;
    }

    /**
     * Cancel an existing booking and release all associated active allocations (Traveler only).
     */
    @Transactional
    public HotelBookingDto cancelBooking(String bookingReference, String userIdOrEmail) {
        return cancelBooking(bookingReference, new CancelHotelBookingRequest("Cancelled by traveler", CancellationReasonCode.TRAVELER_REQUEST), userIdOrEmail);
    }

    @Transactional
    public HotelBookingDto cancelBooking(String bookingReference, String reason, String userIdOrEmail) {
        return cancelBooking(bookingReference, new CancelHotelBookingRequest(reason, CancellationReasonCode.TRAVELER_REQUEST), userIdOrEmail);
    }

    @Transactional
    public HotelBookingDto cancelBooking(String bookingReference, CancelHotelBookingRequest request, String userIdOrEmail) {
        User user = resolveUser(userIdOrEmail);

        HotelBooking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingReference));

        // Lazy expiry check
        booking = checkAndExpireIfStale(booking);

        boolean isTraveler = booking.getTraveler().getId().equals(user.getId());

        if (!isTraveler) {
            throw new AccessDeniedException("Only the booking owner (traveler) can cancel this reservation: " + bookingReference);
        }

        // Idempotency: If already cancelled, return existing safe representation
        if (booking.getBookingStatus() == HotelBookingStatus.CANCELLED) {
            log.info("Booking {} is already CANCELLED. Returning idempotent response.", bookingReference);
            return mapToDto(booking, true);
        }

        // State Machine validation: Expired bookings cannot be cancelled into CANCELLED
        if (booking.getBookingStatus() == HotelBookingStatus.EXPIRED) {
            throw new IllegalStateException("Cannot cancel an expired reservation: " + bookingReference);
        }

        HotelBookingStatus previousStatus = booking.getBookingStatus();
        booking.validateTransition(HotelBookingStatus.CANCELLED);

        // Sanitize reason and reason code
        String reason = (request != null && request.getReason() != null && !request.getReason().isBlank())
                ? request.getReason().trim()
                : "Cancelled by traveler";
        if (reason.length() > 255) {
            reason = reason.substring(0, 255);
        }

        CancellationReasonCode reasonCode = (request != null && request.getReasonCode() != null)
                ? request.getReasonCode()
                : CancellationReasonCode.TRAVELER_REQUEST;

        booking.setBookingStatus(HotelBookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        booking.setCancellationReasonCode(reasonCode);
        booking.setCancelledAt(Instant.now());
        booking.setUpdatedAt(Instant.now());

        HotelBooking updated = bookingRepository.save(booking);

        // Release per-night allocations safely
        allocationRepository.updateAllocationStatusByBookingId(
                booking.getId(), BookingAllocationStatus.ACTIVE, BookingAllocationStatus.RELEASED);

        // Record immutable status audit history
        statusHistoryRepository.save(HotelBookingStatusHistory.builder()
                .id("hist-" + UUID.randomUUID().toString().substring(0, 12))
                .booking(updated)
                .previousStatus(previousStatus)
                .newStatus(HotelBookingStatus.CANCELLED)
                .reason(reason)
                .actorUser(user)
                .createdAt(Instant.now())
                .build());

        // Emit In-App Notification
        try {
            notificationRepository.save(Notification.builder()
                    .id("notif-" + UUID.randomUUID().toString().substring(0, 12))
                    .user(user)
                    .title("Booking Cancelled")
                    .message("Your booking " + bookingReference + " at " + booking.getHotel().getHotelName() + " has been cancelled. Any held inventory has been released.")
                    .category("BOOKING_CANCELLED")
                    .referenceLink("/trips")
                    .read(false)
                    .createdAt(Instant.now())
                    .build());
        } catch (Exception e) {
            log.warn("Failed to create in-app notification for cancelled booking {}: {}", bookingReference, e.getMessage());
        }

        log.info("Cancelled booking {} and released allocations (reason: {})", bookingReference, reason);
        return mapToDto(updated, true);
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

        List<HotelBookingStatusHistory> histories = statusHistoryRepository.findByBookingIdOrderByCreatedAtAsc(b.getId());
        List<HotelBookingDto.BookingStatusHistoryDto> historyDtos = histories.stream()
                .map(h -> HotelBookingDto.BookingStatusHistoryDto.builder()
                        .id(h.getId())
                        .previousStatus(h.getPreviousStatus() != null ? h.getPreviousStatus().name() : null)
                        .newStatus(h.getNewStatus().name())
                        .reason(h.getReason())
                        .actorUserId(h.getActorUser() != null ? h.getActorUser().getId() : null)
                        .createdAt(h.getCreatedAt())
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
                .cancellationReasonCode(b.getCancellationReasonCode() != null ? b.getCancellationReasonCode().name() : null)
                .cancellationPolicySnapshot(b.getCancellationPolicySnapshot())
                .cancellationDeadlineHours(b.getCancellationDeadlineHours())
                .qrToken(b.getQrToken())
                .paymentMethod(b.getPaymentMethod())
                .rejectionReason(b.getRejectionReason())
                .checkedInAt(b.getCheckedInAt())
                .checkedOutAt(b.getCheckedOutAt())
                .reviewRating(b.getReviewRating())
                .reviewComment(b.getReviewComment())
                .reviewedAt(b.getReviewedAt())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .allocations(allocDtos)
                .statusHistory(historyDtos)
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
