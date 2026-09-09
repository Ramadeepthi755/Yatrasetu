package com.yatrasetu.service;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.web.dto.*;
import com.yatrasetu.service.payment.PaymentProvider;
import com.yatrasetu.web.dto.payment.CreatePaymentOrderResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExperienceBookingService {

    private final ExperienceBookingRepository bookingRepository;
    private final LocalHostRepository hostRepository;
    private final ExperienceRepository experienceRepository;
    private final DestinationRepository destinationRepository;
    private final UserRepository userRepository;
    private final TripCheckinRepository checkinRepository;
    private final TripSafetyIncidentRepository incidentRepository;
    private final ExperienceReviewRepository reviewRepository;
    private final BookingDisputeRepository disputeRepository;
    private final ExperienceSupportingProviderRepository supportingProviderRepository;
    private final BookingMessageRepository bookingMessageRepository;
    private final LocalHostService localHostService;
    private final NotificationService notificationService;
    private final PaymentProvider paymentProvider;

    @Transactional
    public CreatePaymentOrderResponse createPaymentOrder(String bookingId, UserPrincipal principal) {
        ExperienceBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        boolean isAuthorized = (booking.getTourist() != null && booking.getTourist().getId().equals(principal.getUserId())) ||
                (booking.getTourist() != null && booking.getTourist().getAuthUserId() != null && booking.getTourist().getAuthUserId().equals(principal.getUserId())) ||
                (booking.getTourist() != null && booking.getTourist().getEmail() != null && booking.getTourist().getEmail().equalsIgnoreCase(principal.getEmail())) ||
                principal.getRole() == Role.GOVERNMENT;

        if (!isAuthorized) {
            throw new org.springframework.security.access.AccessDeniedException("Only the tourist who made the booking can initiate payment.");
        }

        if ("REJECTED".equals(booking.getStatus()) || "CANCELLED".equals(booking.getStatus())) {
            throw new IllegalStateException("Cannot initiate payment for a " + booking.getStatus() + " booking.");
        }

        if ("CONFIRMED".equals(booking.getStatus()) && "PAID".equals(booking.getPaymentStatus())) {
            throw new IllegalStateException("Booking is already paid and confirmed.");
        }

        BigDecimal amount = booking.getTotalAmount() != null ? booking.getTotalAmount() : BigDecimal.ZERO;
        long amountInPaise = amount.multiply(BigDecimal.valueOf(100)).longValue();
        String currency = booking.getCurrency() != null ? booking.getCurrency() : "INR";
        String keyId = (paymentProvider != null && paymentProvider.isAvailable()) ? paymentProvider.getPublicKeyId() : "rzp_test_yatrasetudemo";

        String expTitle = (booking.getExperience() != null && booking.getExperience().getTitle() != null)
                ? booking.getExperience().getTitle()
                : "Heritage & Culture Experience";

        String orderId;
        if (paymentProvider != null && paymentProvider.isAvailable()) {
            try {
                PaymentProvider.ProviderOrderResult orderResult = paymentProvider.createOrder(
                        booking.getBookingReference(),
                        amount,
                        currency,
                        Map.of("bookingReference", booking.getBookingReference(), "experienceTitle", expTitle)
                );
                orderId = orderResult.providerOrderId();
            } catch (Exception e) {
                log.warn("Payment provider order creation failed: {}. Falling back to standard checkout order id.", e.getMessage());
                orderId = "order_exp_" + UUID.randomUUID().toString().substring(0, 10);
            }
        } else {
            orderId = (booking.getRazorpayOrderId() != null && !booking.getRazorpayOrderId().isBlank())
                    ? booking.getRazorpayOrderId()
                    : "order_exp_" + UUID.randomUUID().toString().substring(0, 10);
        }

        booking.setRazorpayOrderId(orderId);
        bookingRepository.save(booking);

        return CreatePaymentOrderResponse.builder()
                .bookingReference(booking.getBookingReference())
                .provider("RAZORPAY")
                .providerOrderId(orderId)
                .keyId(keyId)
                .amount(amount)
                .amountInPaise(amountInPaise)
                .currency(currency)
                .experienceTitle(expTitle)
                .guestName(booking.getTourist() != null ? booking.getTourist().getFullName() : "Tourist")
                .guestEmail(booking.getTourist() != null ? booking.getTourist().getEmail() : "")
                .guestPhone(booking.getTourist() != null ? booking.getTourist().getPhone() : "")
                .status("CREATED")
                .build();
    }

    @Transactional
    public ExperienceBookingDto confirmPayment(String bookingId, String razorpayOrderId, String razorpayPaymentId, String signature, UserPrincipal principal) {
        ExperienceBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        boolean isTourist = (booking.getTourist() != null && booking.getTourist().getId().equals(principal.getUserId())) ||
                (booking.getTourist() != null && booking.getTourist().getAuthUserId() != null && booking.getTourist().getAuthUserId().equals(principal.getUserId())) ||
                (booking.getTourist() != null && booking.getTourist().getEmail() != null && booking.getTourist().getEmail().equalsIgnoreCase(principal.getEmail()));
        boolean isHost = booking.getHost() != null && booking.getHost().getUser() != null && (
                booking.getHost().getUser().getId().equals(principal.getUserId()) ||
                (booking.getHost().getUser().getAuthUserId() != null && booking.getHost().getUser().getAuthUserId().equals(principal.getUserId())) ||
                (booking.getHost().getUser().getEmail() != null && booking.getHost().getUser().getEmail().equalsIgnoreCase(principal.getEmail()))
        );
        boolean isGovernmentOrAdmin = principal.getRole() == Role.GOVERNMENT;

        if (!isTourist && !isHost && !isGovernmentOrAdmin) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized payment confirmation on booking.");
        }

        if ("CONFIRMED".equals(booking.getStatus()) || "IN_PROGRESS".equals(booking.getStatus()) || "COMPLETED".equals(booking.getStatus()) || "REVIEWED".equals(booking.getStatus())) {
            return toDto(booking); // Idempotent return if already confirmed/paid
        }

        if ("REJECTED".equals(booking.getStatus()) || "CANCELLED".equals(booking.getStatus())) {
            throw new IllegalStateException("Cannot process payment for a " + booking.getStatus() + " booking.");
        }

        if (paymentProvider != null && paymentProvider.isAvailable()) {
            boolean validSig = paymentProvider.verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, signature);
            if (!validSig) {
                throw new IllegalArgumentException("Cryptographic payment signature verification failed.");
            }
        }

        booking.setPaymentMethod("ONLINE");
        booking.setRazorpayOrderId(razorpayOrderId != null ? razorpayOrderId : "order_" + UUID.randomUUID().toString().substring(0, 8));
        booking.setRazorpayPaymentId(razorpayPaymentId != null ? razorpayPaymentId : "pay_" + UUID.randomUUID().toString().substring(0, 8));
        booking.setRazorpaySignature(signature != null ? signature : "sig_verified");
        booking.setPaymentStatus("PAID");
        booking.setStatus("CONFIRMED");
        booking.setUpdatedAt(Instant.now());

        ExperienceBooking saved = bookingRepository.save(booking);

        try {
            notificationService.emitGuideBookingConfirmed(saved);
        } catch (Exception e) {
            log.warn("Failed to emit notification for confirmed payment: {}", e.getMessage());
        }

        return toDto(saved);
    }

    @Transactional
    public ExperienceBookingDto createBooking(CreateExperienceBookingRequest request, UserPrincipal principal) {
        User tourist = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Tourist user not found"));

        LocalHost host = hostRepository.findById(request.getHostId())
                .orElseThrow(() -> new IllegalArgumentException("Host not found with ID: " + request.getHostId()));

        Experience experience = null;
        if (request.getExperienceId() != null && !request.getExperienceId().trim().isEmpty()) {
            experience = experienceRepository.findById(request.getExperienceId())
                    .orElseThrow(() -> new IllegalArgumentException("Experience not found with ID: " + request.getExperienceId()));
            
            if (experience.getIsActive() != null && !experience.getIsActive()) {
                throw new IllegalArgumentException("This experience is currently not active for booking.");
            }

            if (experience.getHost() != null) {
                host = experience.getHost();
            }
        }

        Destination destination = null;
        if (request.getDestinationId() != null && !request.getDestinationId().trim().isEmpty()) {
            destination = destinationRepository.findById(request.getDestinationId()).orElse(null);
        } else if (experience != null && experience.getDestination() != null) {
            destination = experience.getDestination();
        } else if (host.getDestination() != null) {
            destination = host.getDestination();
        }

        int guestCount = (request.getGuestCount() != null && request.getGuestCount() > 0) ? request.getGuestCount() : 1;
        if (guestCount > 50) {
            throw new IllegalArgumentException("Guest count cannot exceed 50");
        }

        // Authoritative Server-Side Pricing (Do not trust client-supplied total amount)
        BigDecimal calculatedAmount;
        if (experience != null && experience.getPricePerPerson() != null) {
            calculatedAmount = experience.getPricePerPerson().multiply(BigDecimal.valueOf(guestCount));
        } else if (host.getPricePerHour() != null) {
            calculatedAmount = host.getPricePerHour().multiply(BigDecimal.valueOf(3)); // Default 3h session
        } else {
            calculatedAmount = BigDecimal.valueOf(1000);
        }

        // Duplicate submission prevention: check for existing active request within the last 60 seconds
        Instant recentCutoff = Instant.now().minus(60, ChronoUnit.SECONDS);
        List<ExperienceBooking> existingRecent = bookingRepository.findByTouristIdOrderByCreatedAtDesc(tourist.getId());
        for (ExperienceBooking eb : existingRecent) {
            if ("REQUESTED".equals(eb.getStatus()) &&
                    eb.getCreatedAt() != null && eb.getCreatedAt().isAfter(recentCutoff) &&
                    ((experience != null && eb.getExperience() != null && experience.getId().equals(eb.getExperience().getId())) ||
                     (experience == null && eb.getHost() != null && host.getId().equals(eb.getHost().getId()))) &&
                    Objects.equals(eb.getBookingDate(), request.getBookingDate())) {
                log.info("Returning existing duplicate booking request {} within throttle window", eb.getBookingReference());
                return toDto(eb);
            }
        }

        String bookingRef = "YS-EXP-" + (100000 + new Random().nextInt(900000));

        ExperienceBooking booking = ExperienceBooking.builder()
                .id(UUID.randomUUID().toString())
                .bookingReference(bookingRef)
                .tourist(tourist)
                .host(host)
                .experience(experience)
                .destination(destination)
                .bookingType(request.getBookingType() != null ? request.getBookingType() : "PREDEFINED")
                .bookingDate(request.getBookingDate())
                .startTime(request.getStartTime() != null ? request.getStartTime() : "09:00 AM")
                .guestCount(guestCount)
                .totalAmount(calculatedAmount)
                .currency("INR")
                .status("REQUESTED")
                .customRequirements(request.getCustomRequirements())
                .paymentStatus("PENDING")
                .notes(request.getNotes())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        ExperienceBooking savedBooking = bookingRepository.save(booking);

        // Generate standard safety checkpoints
        generateCheckpoints(savedBooking);

        try {
            notificationService.emitGuideBookingRequested(savedBooking);
        } catch (Exception e) {
            log.warn("Failed to emit notification for guide booking request: {}", e.getMessage());
        }

        return toDto(savedBooking);
    }

    private void generateCheckpoints(ExperienceBooking booking) {
        List<TripCheckin> checkins = new ArrayList<>();

        // Checkpoint 1: Trip Commencement
        checkins.add(TripCheckin.builder()
                .id(UUID.randomUUID().toString())
                .booking(booking)
                .user(booking.getTourist())
                .checkpointName("Trip Start & Guide Rendezvous")
                .checkpointType("START")
                .status("PENDING")
                .notes("Verify guide identity badge and rendezvous at designated starting point.")
                .createdAt(Instant.now())
                .build());

        // Checkpoint 2: Mid-Tour Checkpoint
        checkins.add(TripCheckin.builder()
                .id(UUID.randomUUID().toString())
                .booking(booking)
                .user(booking.getTourist())
                .checkpointName("Midpoint Safety Check")
                .checkpointType("MIDPOINT")
                .status("PENDING")
                .notes("Halfway through experience. Confirms smooth tour progress.")
                .createdAt(Instant.now())
                .build());

        // Checkpoint 3: Completion Confirmation
        checkins.add(TripCheckin.builder()
                .id(UUID.randomUUID().toString())
                .booking(booking)
                .user(booking.getTourist())
                .checkpointName("Tour Conclusion & Drop-off")
                .checkpointType("COMPLETION")
                .status("PENDING")
                .notes("Experience safely concluded.")
                .createdAt(Instant.now())
                .build());

        checkinRepository.saveAll(checkins);
    }

    @Transactional(readOnly = true)
    public List<ExperienceBookingDto> getTouristBookings(String userId) {
        return bookingRepository.findByTouristIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExperienceBookingDto> getPartnerBookings(String partnerUserId) {
        // Find by partner's local host profile or user id
        return bookingRepository.findByPartnerUserIdOrderByCreatedAtDesc(partnerUserId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExperienceBookingDto getBookingById(String bookingId, UserPrincipal principal) {
        ExperienceBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        // IDOR Check: Ensure either the tourist or the host or admin is accessing
        boolean isTourist = booking.getTourist().getId().equals(principal.getUserId());
        boolean isHost = booking.getHost().getUser() != null && booking.getHost().getUser().getId().equals(principal.getUserId());
        boolean isGovernmentOrAdmin = principal.getRole() == Role.GOVERNMENT;

        if (!isTourist && !isHost && !isGovernmentOrAdmin) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized access to booking data");
        }

        return toDto(booking);
    }

    @Transactional
    public ExperienceBookingDto acceptBooking(String bookingId, String partnerUserId) {
        ExperienceBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        if (booking.getHost() != null && booking.getHost().getUser() != null && partnerUserId != null &&
                !booking.getHost().getUser().getId().equals(partnerUserId)) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You do not own this booking.");
        }

        if (!"REQUESTED".equals(booking.getStatus())) {
            throw new IllegalStateException("Booking cannot be accepted because it is currently in status: " + booking.getStatus());
        }

        booking.setStatus("PAYMENT_PENDING");
        booking.setUpdatedAt(Instant.now());
        ExperienceBooking saved = bookingRepository.save(booking);

        try {
            notificationService.emitGuideBookingAccepted(saved);
        } catch (Exception e) {
            log.warn("Failed to emit notification for accepted guide booking: {}", e.getMessage());
        }

        return toDto(saved);
    }

    @Transactional
    public ExperienceBookingDto rejectBooking(String bookingId, String partnerUserId, String reason) {
        ExperienceBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        if (booking.getHost() != null && booking.getHost().getUser() != null && partnerUserId != null &&
                !booking.getHost().getUser().getId().equals(partnerUserId)) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You do not own this booking.");
        }

        if (!"REQUESTED".equals(booking.getStatus()) && !"PAYMENT_PENDING".equals(booking.getStatus())) {
            throw new IllegalStateException("Booking cannot be rejected because it is currently in status: " + booking.getStatus());
        }

        booking.setStatus("REJECTED");
        booking.setNotes(reason != null ? "Rejected by host: " + reason : "Rejected by host");
        booking.setUpdatedAt(Instant.now());
        ExperienceBooking saved = bookingRepository.save(booking);

        try {
            notificationService.emitGuideBookingRejected(saved, reason);
        } catch (Exception e) {
            log.warn("Failed to emit notification for rejected guide booking: {}", e.getMessage());
        }

        return toDto(saved);
    }

    @Transactional
    public ExperienceBookingDto customizeBooking(String bookingId, String partnerUserId, String itinerary, BigDecimal price) {
        ExperienceBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        if (booking.getHost() != null && booking.getHost().getUser() != null && partnerUserId != null &&
                !booking.getHost().getUser().getId().equals(partnerUserId)) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You do not own this booking.");
        }

        if (!"REQUESTED".equals(booking.getStatus()) && !"PAYMENT_PENDING".equals(booking.getStatus())) {
            throw new IllegalStateException("Booking cannot be customized because it is currently in status: " + booking.getStatus());
        }

        if (itinerary != null && !itinerary.trim().isEmpty()) {
            booking.setCustomItinerary(itinerary.trim());
        }
        if (price != null && price.compareTo(BigDecimal.ZERO) > 0) {
            booking.setTotalAmount(price);
        }
        booking.setStatus("PAYMENT_PENDING");
        booking.setUpdatedAt(Instant.now());
        ExperienceBooking saved = bookingRepository.save(booking);

        try {
            notificationService.emitGuideBookingAccepted(saved);
        } catch (Exception e) {
            log.warn("Failed to emit notification for customized guide booking: {}", e.getMessage());
        }

        return toDto(saved);
    }

    @Transactional
    public ExperienceBookingDto selectCashPayment(String bookingId, UserPrincipal principal) {
        ExperienceBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        if (!booking.getTourist().getId().equals(principal.getUserId())) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You do not own this booking.");
        }

        if ("CONFIRMED".equals(booking.getStatus()) || "IN_PROGRESS".equals(booking.getStatus()) || "COMPLETED".equals(booking.getStatus())) {
            return toDto(booking);
        }

        if ("REJECTED".equals(booking.getStatus()) || "CANCELLED".equals(booking.getStatus())) {
            throw new IllegalStateException("Cannot select cash payment for a " + booking.getStatus() + " booking.");
        }

        BigDecimal total = booking.getTotalAmount() != null ? booking.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal milestone1 = total.divide(BigDecimal.valueOf(2), 2, java.math.RoundingMode.HALF_UP);
        BigDecimal milestone2 = total.subtract(milestone1);

        booking.setPaymentMethod("CASH");
        booking.setPaymentStatus("PENDING");
        booking.setCashMilestone1Amount(milestone1);
        booking.setCashMilestone1Paid(false);
        booking.setCashMilestone2Amount(milestone2);
        booking.setCashMilestone2Paid(false);
        booking.setStatus("CONFIRMED");
        booking.setUpdatedAt(Instant.now());

        ExperienceBooking saved = bookingRepository.save(booking);

        try {
            notificationService.emitGuideBookingConfirmed(saved);
        } catch (Exception e) {
            log.warn("Failed to emit notification for confirmed cash booking: {}", e.getMessage());
        }

        return toDto(saved);
    }

    @Transactional
    public ExperienceBookingDto recordCashMilestone(String bookingId, int milestoneNumber, String partnerUserId) {
        ExperienceBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        if (booking.getHost() != null && booking.getHost().getUser() != null && partnerUserId != null &&
                !booking.getHost().getUser().getId().equals(partnerUserId)) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You do not own this booking.");
        }

        if (milestoneNumber == 1) {
            booking.setCashMilestone1Paid(true);
            booking.setCashMilestone1PaidAt(Instant.now());
            if (!Boolean.TRUE.equals(booking.getCashMilestone2Paid())) {
                booking.setPaymentStatus("PARTIALLY_PAID");
            } else {
                booking.setPaymentStatus("PAID");
            }
        } else if (milestoneNumber == 2) {
            booking.setCashMilestone2Paid(true);
            booking.setCashMilestone2PaidAt(Instant.now());
            booking.setPaymentStatus("PAID");
        }
        booking.setUpdatedAt(Instant.now());
        return toDto(bookingRepository.save(booking));
    }

    @Transactional
    public ExperienceBookingDto startTrip(String bookingId, String partnerUserId) {
        ExperienceBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        if (booking.getHost() != null && booking.getHost().getUser() != null && partnerUserId != null &&
                !booking.getHost().getUser().getId().equals(partnerUserId)) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You do not own this booking.");
        }

        if (!"CONFIRMED".equals(booking.getStatus()) && !"TRAVELER_CHECKED_IN".equals(booking.getStatus()) && !"GUIDE_CHECKED_IN".equals(booking.getStatus())) {
            throw new IllegalStateException("Trip can only be started from a confirmed or checked-in status. Current status: " + booking.getStatus());
        }

        if ("TRAVELER_CHECKED_IN".equals(booking.getStatus())) {
            booking.setStatus("IN_PROGRESS");
            booking.setUpdatedAt(Instant.now());
            // Mark start checkpoint completed
            List<TripCheckin> checkins = checkinRepository.findByBookingIdOrderByCreatedAtAsc(bookingId);
            checkins.stream().filter(c -> "START".equalsIgnoreCase(c.getCheckpointType())).findFirst().ifPresent(c -> {
                c.setStatus("COMPLETED");
                c.setCheckedInAt(Instant.now());
                checkinRepository.save(c);
            });
            ExperienceBooking saved = bookingRepository.save(booking);
            try {
                notificationService.emitGuideTripStarted(saved);
            } catch (Exception e) {
                log.warn("Failed to emit notification for started trip: {}", e.getMessage());
            }
            return toDto(saved);
        } else {
            booking.setStatus("GUIDE_CHECKED_IN");
            booking.setUpdatedAt(Instant.now());
            List<TripCheckin> checkins = checkinRepository.findByBookingIdOrderByCreatedAtAsc(bookingId);
            checkins.stream().filter(c -> "START".equalsIgnoreCase(c.getCheckpointType())).findFirst().ifPresent(c -> {
                c.setStatus("GUIDE_CHECKED_IN");
                c.setCheckedInAt(Instant.now());
                checkinRepository.save(c);
            });
            ExperienceBooking saved = bookingRepository.save(booking);
            return toDto(saved);
        }
    }

    @Transactional
    public TripCheckinDto completeCheckin(String bookingId, String checkpointId, BigDecimal lat, BigDecimal lng, String notes, UserPrincipal principal) {
        TripCheckin checkin = checkinRepository.findById(checkpointId)
                .orElseThrow(() -> new IllegalArgumentException("Checkpoint not found with ID: " + checkpointId));

        ExperienceBooking booking = checkin.getBooking();
        if (!booking.getTourist().getId().equals(principal.getUserId())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized: Only the tourist can perform tourist check-in.");
        }

        checkin.setCheckedInAt(Instant.now());
        checkin.setLatitude(lat);
        checkin.setLongitude(lng);
        if (notes != null) checkin.setNotes(notes);

        if ("START".equalsIgnoreCase(checkin.getCheckpointType())) {
            if ("GUIDE_CHECKED_IN".equals(booking.getStatus())) {
                checkin.setStatus("COMPLETED");
                booking.setStatus("IN_PROGRESS");
                booking.setUpdatedAt(Instant.now());
                bookingRepository.save(booking);
                try {
                    notificationService.emitGuideTripStarted(booking);
                } catch (Exception e) {
                    log.warn("Failed to emit notification for trip started: {}", e.getMessage());
                }
            } else {
                checkin.setStatus("TRAVELER_CHECKED_IN");
                booking.setStatus("TRAVELER_CHECKED_IN");
                booking.setUpdatedAt(Instant.now());
                bookingRepository.save(booking);
            }
        } else {
            checkin.setStatus("COMPLETED");
            List<TripCheckin> allCheckins = checkinRepository.findByBookingIdOrderByCreatedAtAsc(bookingId);
            boolean allDone = allCheckins.stream().allMatch(c -> "COMPLETED".equals(c.getStatus()) || c.getId().equals(checkpointId));
            if (allDone && !"COMPLETED".equals(booking.getStatus()) && !"REVIEWED".equals(booking.getStatus())) {
                booking.setStatus("COMPLETION_PENDING");
                bookingRepository.save(booking);
            }
        }

        TripCheckin saved = checkinRepository.save(checkin);
        return toCheckinDto(saved);
    }

    @Transactional
    public ExperienceBookingDto markTripCompletionByPartner(String bookingId, String partnerUserId) {
        ExperienceBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        if (booking.getHost() == null || booking.getHost().getUser() == null ||
                !booking.getHost().getUser().getId().equals(partnerUserId)) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You do not own this booking.");
        }

        if ("COMPLETION_PENDING".equals(booking.getStatus()) || "COMPLETED".equals(booking.getStatus()) || "REVIEWED".equals(booking.getStatus())) {
            return toDto(booking);
        }

        if (!"IN_PROGRESS".equals(booking.getStatus()) && !"TRIP_STARTED".equals(booking.getStatus())) {
            throw new IllegalStateException("Trip completion can only be marked for an active trip in progress. Current status: " + booking.getStatus());
        }

        booking.setStatus("COMPLETION_PENDING");
        booking.setUpdatedAt(Instant.now());
        ExperienceBooking saved = bookingRepository.save(booking);

        try {
            notificationService.emitGuideMarkedCompletionPending(saved);
        } catch (Exception e) {
            log.warn("Failed to emit notification for completion pending: {}", e.getMessage());
        }

        return toDto(saved);
    }

    @Transactional
    public TripCheckinDto completeCheckinByPartner(String bookingId, String checkpointId, String notes, String partnerUserId) {
        ExperienceBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        if (booking.getHost() == null || booking.getHost().getUser() == null ||
                !booking.getHost().getUser().getId().equals(partnerUserId)) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You do not own this booking.");
        }

        TripCheckin checkin = checkinRepository.findById(checkpointId)
                .orElseThrow(() -> new IllegalArgumentException("Checkpoint not found with ID: " + checkpointId));

        checkin.setCheckedInAt(Instant.now());
        if (notes != null) checkin.setNotes(notes);

        if ("START".equalsIgnoreCase(checkin.getCheckpointType())) {
            if ("TRAVELER_CHECKED_IN".equals(booking.getStatus())) {
                checkin.setStatus("COMPLETED");
                booking.setStatus("IN_PROGRESS");
                booking.setUpdatedAt(Instant.now());
                bookingRepository.save(booking);
                try {
                    notificationService.emitGuideTripStarted(booking);
                } catch (Exception e) {
                    log.warn("Failed to emit notification for trip started: {}", e.getMessage());
                }
            } else {
                checkin.setStatus("GUIDE_CHECKED_IN");
                booking.setStatus("GUIDE_CHECKED_IN");
                booking.setUpdatedAt(Instant.now());
                bookingRepository.save(booking);
            }
        } else {
            checkin.setStatus("COMPLETED");
            List<TripCheckin> allCheckins = checkinRepository.findByBookingIdOrderByCreatedAtAsc(bookingId);
            boolean allDone = allCheckins.stream().allMatch(c -> "COMPLETED".equals(c.getStatus()) || c.getId().equals(checkpointId));
            if (allDone && !"COMPLETED".equals(booking.getStatus()) && !"REVIEWED".equals(booking.getStatus())) {
                booking.setStatus("COMPLETION_PENDING");
                bookingRepository.save(booking);
            }
        }

        TripCheckin saved = checkinRepository.save(checkin);
        return toCheckinDto(saved);
    }

    @Transactional(readOnly = true)
    public List<com.yatrasetu.web.dto.ExperienceReviewDto> getPartnerReviews(String partnerUserId) {
        List<ExperienceReview> reviews = reviewRepository.findByPartnerUserIdOrderByCreatedAtDesc(partnerUserId);
        return reviews.stream().map(r -> com.yatrasetu.web.dto.ExperienceReviewDto.builder()
                .id(r.getId())
                .bookingId(r.getBooking() != null ? r.getBooking().getId() : null)
                .experienceId(r.getExperience() != null ? r.getExperience().getId() : null)
                .experienceTitle(r.getExperience() != null ? r.getExperience().getTitle() : (r.getBooking() != null && r.getBooking().getExperience() != null ? r.getBooking().getExperience().getTitle() : "Custom Cultural Tour"))
                .hostId(r.getHost() != null ? r.getHost().getId() : null)
                .hostName(r.getHost() != null ? r.getHost().getName() : null)
                .userId(r.getUser() != null ? r.getUser().getId() : null)
                .userName(r.getUser() != null ? r.getUser().getFullName() : "Verified Guest")
                .userAvatarUrl(null)
                .rating(r.getRating())
                .title(r.getTitle())
                .comment(r.getComment())
                .verifiedTrip(r.getVerifiedTrip())
                .createdAt(r.getCreatedAt())
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional
    public TripSafetyIncidentDto triggerSos(String bookingId, String details, BigDecimal lat, BigDecimal lng, UserPrincipal principal) {
        ExperienceBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        TripSafetyIncident incident = TripSafetyIncident.builder()
                .id(UUID.randomUUID().toString())
                .booking(booking)
                .user(user)
                .incidentType("SOS")
                .severity("CRITICAL")
                .status("REPORTED")
                .details(details != null && !details.trim().isEmpty() ? details : "Tourist activated emergency SOS from trip screen.")
                .emergencyContactNotified(true)
                .latitude(lat)
                .longitude(lng)
                .createdAt(Instant.now())
                .build();

        TripSafetyIncident saved = incidentRepository.save(incident);

        log.warn("CRITICAL SOS ALERT TRIGGERED by user {} for booking {}: Location ({}, {})",
                user.getEmail(), bookingId, lat, lng);

        return toIncidentDto(saved);
    }

    @Transactional
    public ExperienceBookingDto confirmTripCompletion(String bookingId, UserPrincipal principal) {
        ExperienceBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        User tourist = booking.getTourist();
        boolean isTouristOwner = tourist != null && (
                (tourist.getId() != null && tourist.getId().equals(principal.getUserId())) ||
                (principal.getAuthUserId() != null && principal.getAuthUserId().equals(tourist.getAuthUserId())) ||
                (principal.getEmail() != null && tourist.getEmail() != null && principal.getEmail().equalsIgnoreCase(tourist.getEmail()))
        );

        if (!isTouristOwner) {
            throw new org.springframework.security.access.AccessDeniedException("Only the tourist who booked this trip can confirm completion.");
        }

        // Idempotency: If already completed or reviewed, return existing DTO safely
        if ("COMPLETED".equals(booking.getStatus()) || "REVIEWED".equals(booking.getStatus())) {
            return toDto(booking);
        }

        // Valid transition states: COMPLETION_PENDING, IN_PROGRESS, TRIP_STARTED
        if (!"COMPLETION_PENDING".equals(booking.getStatus()) &&
            !"IN_PROGRESS".equals(booking.getStatus()) &&
            !"TRIP_STARTED".equals(booking.getStatus())) {
            throw new IllegalStateException("Trip completion can only be confirmed for an active or completion-pending trip. Current status: " + booking.getStatus());
        }

        // For CASH bookings, update final milestone state
        if ("CASH".equalsIgnoreCase(booking.getPaymentMethod())) {
            if (!Boolean.TRUE.equals(booking.getCashMilestone2Paid())) {
                booking.setCashMilestone2Paid(true);
                booking.setCashMilestone2PaidAt(Instant.now());
                booking.setPaymentStatus("PAID");
            }
        }

        // Complete any pending checkins
        List<TripCheckin> checkins = checkinRepository.findByBookingIdOrderByCreatedAtAsc(bookingId);
        if (checkins != null) {
            for (TripCheckin c : checkins) {
                if (!"COMPLETED".equals(c.getStatus())) {
                    c.setStatus("COMPLETED");
                    if (c.getCheckedInAt() == null) {
                        c.setCheckedInAt(Instant.now());
                    }
                    checkinRepository.save(c);
                }
            }
        }

        booking.setStatus("COMPLETED");
        booking.setUpdatedAt(Instant.now());

        // Increment host experience count safely without triggering PostgreSQL array column updates
        if (booking.getHost() != null && booking.getHost().getId() != null) {
            try {
                hostRepository.incrementExperienceCount(booking.getHost().getId());
            } catch (Exception e) {
                log.warn("Failed to increment host experience count: {}", e.getMessage());
            }
        }

        ExperienceBooking saved = bookingRepository.save(booking);

        try {
            notificationService.emitTouristConfirmedTripCompletion(saved);
        } catch (Exception e) {
            log.warn("Failed to emit notification for completed trip: {}", e.getMessage());
        }

        return toDto(saved);
    }

    @Transactional
    public ExperienceBookingDto submitReview(String bookingId, ExperienceReviewRequest request, UserPrincipal principal) {
        ExperienceBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        User user = userRepository.findById(principal.getUserId())
                .or(() -> userRepository.findByAuthUserId(principal.getUserId()))
                .or(() -> userRepository.findByEmailIgnoreCase(principal.getEmail()))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        User tourist = booking.getTourist();
        boolean isAuthorizedTourist = tourist != null && (
                tourist.getId().equals(user.getId()) ||
                (tourist.getAuthUserId() != null && tourist.getAuthUserId().equals(user.getAuthUserId())) ||
                (tourist.getEmail() != null && tourist.getEmail().equalsIgnoreCase(user.getEmail()))
        );

        if (!isAuthorizedTourist) {
            throw new org.springframework.security.access.AccessDeniedException("Only the guest who booked and completed this trip can submit a review.");
        }

        if ("REVIEWED".equals(booking.getStatus()) || reviewRepository.findByBookingId(bookingId).isPresent()) {
            throw new IllegalStateException("A review has already been submitted for this verified booking.");
        }

        if (!"COMPLETED".equals(booking.getStatus())) {
            throw new IllegalStateException("Reviews can only be submitted after trip completion.");
        }

        ExperienceReview review = ExperienceReview.builder()
                .id(UUID.randomUUID().toString())
                .booking(booking)
                .experience(booking.getExperience())
                .host(booking.getHost())
                .user(user)
                .rating(request.getRating())
                .title(request.getTitle())
                .comment(request.getComment())
                .verifiedTrip(true)
                .createdAt(Instant.now())
                .build();

        reviewRepository.save(review);

        // Update Host Average Rating safely
        if (booking.getHost() != null && booking.getHost().getId() != null) {
            Double avgRating = reviewRepository.calculateAverageRatingForHost(booking.getHost().getId());
            if (avgRating != null) {
                try {
                    hostRepository.updateRating(booking.getHost().getId(), BigDecimal.valueOf(avgRating).setScale(1, java.math.RoundingMode.HALF_UP));
                } catch (Exception e) {
                    log.warn("Failed to update host rating: {}", e.getMessage());
                }
            }
        }

        booking.setStatus("REVIEWED");
        booking.setUpdatedAt(Instant.now());
        return toDto(bookingRepository.save(booking));
    }

    @Transactional
    public ExperienceBookingDto raiseDispute(String bookingId, BookingDisputeRequest request, UserPrincipal principal) {
        ExperienceBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        BookingDispute dispute = BookingDispute.builder()
                .id(UUID.randomUUID().toString())
                .booking(booking)
                .raisedByUser(user)
                .reason(request.getReason())
                .details(request.getDetails())
                .status("OPEN")
                .evidenceSummary("Booking Ref: " + booking.getBookingReference() + ", Total: " + booking.getTotalAmount() + " INR. Payment: " + booking.getPaymentStatus())
                .refundAmount(request.getRequestedRefundAmount() != null ? request.getRequestedRefundAmount() : BigDecimal.ZERO)
                .createdAt(Instant.now())
                .build();

        disputeRepository.save(dispute);

        booking.setStatus("DISPUTED");
        booking.setUpdatedAt(Instant.now());
        return toDto(bookingRepository.save(booking));
    }

    // Trip-Scoped In-App Messaging (Requirement 8)
    @Transactional(readOnly = true)
    public List<BookingMessageDto> getBookingMessages(String bookingId, UserPrincipal principal) {
        ExperienceBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        boolean isTourist = booking.getTourist().getId().equals(principal.getUserId());
        boolean isHost = booking.getHost() != null && booking.getHost().getUser() != null &&
                booking.getHost().getUser().getId().equals(principal.getUserId());

        if (!isTourist && !isHost && principal.getRole() != Role.GOVERNMENT) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You are not part of this booking conversation.");
        }

        return bookingMessageRepository.findByBookingIdOrderByCreatedAtAsc(bookingId)
                .stream()
                .map(this::toBookingMessageDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingMessageDto sendBookingMessage(String bookingId, SendBookingMessageRequest request, UserPrincipal principal) {
        ExperienceBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        boolean isTourist = booking.getTourist().getId().equals(principal.getUserId());
        boolean isHost = booking.getHost() != null && booking.getHost().getUser() != null &&
                booking.getHost().getUser().getId().equals(principal.getUserId());

        if (!isTourist && !isHost) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You are not authorized to send messages for this booking.");
        }

        User sender = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Sender user not found"));

        User receiver;
        if (isTourist) {
            if (booking.getHost() == null || booking.getHost().getUser() == null) {
                throw new IllegalStateException("Host profile does not have an associated user account.");
            }
            receiver = booking.getHost().getUser();
        } else {
            receiver = booking.getTourist();
        }

        BookingMessage msg = BookingMessage.builder()
                .id(UUID.randomUUID().toString())
                .booking(booking)
                .sender(sender)
                .receiver(receiver)
                .message(request.getMessage().trim())
                .isRead(false)
                .createdAt(Instant.now())
                .build();

        BookingMessage saved = bookingMessageRepository.save(msg);
        return toBookingMessageDto(saved);
    }

    private BookingMessageDto toBookingMessageDto(BookingMessage m) {
        return BookingMessageDto.builder()
                .id(m.getId())
                .bookingId(m.getBooking().getId())
                .senderId(m.getSender().getId())
                .senderName(m.getSender().getFullName())
                .senderRole(m.getSender().getRole() != null ? m.getSender().getRole().name() : "USER")
                .receiverId(m.getReceiver().getId())
                .receiverName(m.getReceiver().getFullName())
                .message(m.getMessage())
                .isRead(m.getIsRead())
                .createdAt(m.getCreatedAt())
                .build();
    }

    // Explainable Guide Recommendations (Tasks 3, 4, 5)
    @Transactional(readOnly = true)
    public List<RecommendedGuideDto> recommendGuidesForDestination(String destinationId, List<String> interests, List<String> languages) {
        List<LocalHost> hosts = hostRepository.findByDestinationId(destinationId);
        Optional<Destination> destOpt = destinationRepository.findById(destinationId);
        if (hosts.isEmpty() && destOpt.isPresent()) {
            Destination dest = destOpt.get();
            if (dest.getCity() != null) {
                hosts = hostRepository.findByCityId(dest.getCity().getId());
            }
            if (hosts.isEmpty() && dest.getNearestMajorCity() != null && !dest.getNearestMajorCity().isBlank()) {
                String majorCity = dest.getNearestMajorCity().toLowerCase().trim();
                hosts = hostRepository.findAll().stream()
                        .filter(h -> (h.getCity() != null && h.getCity().getCityName() != null && h.getCity().getCityName().toLowerCase().contains(majorCity))
                                || (h.getCity() != null && h.getCity().getId() != null && h.getCity().getId().toLowerCase().contains(majorCity)))
                        .collect(Collectors.toList());
            }
            if (hosts.isEmpty() && dest.getState() != null) {
                hosts = hostRepository.findByStateId(dest.getState().getId());
            }
        }

        return hosts.stream()
                .map(host -> evaluateGuideMatch(host, destinationId, interests, languages, null, null))
                .sorted(Comparator.comparingDouble(RecommendedGuideDto::getMatchScore).reversed())
                .limit(6)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GuideMatchResponseDto matchGuides(GuideMatchFilterRequest filter) {
        List<LocalHost> candidateHosts;
        if (filter.getDestinationId() != null && !filter.getDestinationId().trim().isEmpty() && !filter.getDestinationId().equalsIgnoreCase("all")) {
            candidateHosts = hostRepository.findByDestinationId(filter.getDestinationId());
            if (candidateHosts.isEmpty()) {
                candidateHosts = hostRepository.findAll();
            }
        } else if (filter.getCityId() != null && !filter.getCityId().trim().isEmpty() && !filter.getCityId().equalsIgnoreCase("all")) {
            candidateHosts = hostRepository.findByCityId(filter.getCityId());
        } else {
            candidateHosts = hostRepository.findAll();
        }

        List<RecommendedGuideDto> evaluated = candidateHosts.stream()
                .filter(h -> filter.getVerifiedOnly() == null || !filter.getVerifiedOnly() || Boolean.TRUE.equals(h.getIsVerified()))
                .map(host -> evaluateGuideMatch(host, filter.getDestinationId(), filter.getInterests(), filter.getLanguages(), filter.getMaxBudgetPerHour(), filter.getSkill()))
                .sorted(Comparator.comparingDouble(RecommendedGuideDto::getMatchScore).reversed())
                .collect(Collectors.toList());

        boolean exactMatch = !evaluated.isEmpty() && evaluated.get(0).getMatchScore() >= 80.0;
        List<String> suggestions = new ArrayList<>();

        if (!exactMatch) {
            suggestions.add("Relax language requirement to explore all local multilingual guides");
            suggestions.add("Expand budget range slightly to view senior verified historians");
            suggestions.add("Broaden interest categories to include general cultural walking tours");
        }

        return GuideMatchResponseDto.builder()
                .matches(evaluated)
                .exactMatchFound(exactMatch)
                .message(exactMatch ? "Top verified guides matching your specific preferences" : "No exact 100% match found. We expanded your preferences below.")
                .relaxationSuggestions(suggestions)
                .build();
    }

    private RecommendedGuideDto evaluateGuideMatch(
            LocalHost host,
            String destinationId,
            List<String> userInterests,
            List<String> userLanguages,
            BigDecimal maxBudget,
            String skill) {

        double score = 50.0; // Base score
        List<String> reasons = new ArrayList<>();

        // 1. Destination / Location Match
        if (destinationId != null && host.getDestination() != null && destinationId.equalsIgnoreCase(host.getDestination().getId())) {
            score += 25.0;
            reasons.add("Works directly in " + host.getDestination().getDestinationName());
        } else if (host.getCity() != null) {
            score += 15.0;
            reasons.add("Based locally in " + host.getCity().getCityName());
        }

        // 2. Verification Trust
        if (Boolean.TRUE.equals(host.getIsVerified())) {
            score += 10.0;
            reasons.add("YatraSetu Verified Partner");
        }

        // 3. Interest / Category Match
        if (userInterests != null && !userInterests.isEmpty() && host.getInterests() != null) {
            List<String> matchedInterests = host.getInterests().stream()
                    .filter(i -> userInterests.stream().anyMatch(ui -> ui.equalsIgnoreCase(i)))
                    .collect(Collectors.toList());
            if (!matchedInterests.isEmpty()) {
                score += 15.0;
                reasons.add("Matches your interest in " + String.join(", ", matchedInterests));
            }
        }

        // 4. Language Match
        if (userLanguages != null && !userLanguages.isEmpty() && host.getLanguages() != null) {
            List<String> matchedLangs = host.getLanguages().stream()
                    .filter(l -> userLanguages.stream().anyMatch(ul -> ul.equalsIgnoreCase(l)))
                    .collect(Collectors.toList());
            if (!matchedLangs.isEmpty()) {
                score += 15.0;
                reasons.add("Speaks " + String.join(", ", matchedLangs));
            }
        }

        // 5. Budget Match
        if (maxBudget != null && host.getPricePerHour() != null) {
            if (host.getPricePerHour().compareTo(maxBudget) <= 0) {
                score += 10.0;
                reasons.add("Within your budget (₹" + host.getPricePerHour() + "/hr)");
            } else {
                score -= 10.0;
            }
        }

        // 6. Reputation & Tours
        if (host.getExperienceCount() != null && host.getExperienceCount() > 50) {
            reasons.add("Conducted " + host.getExperienceCount() + "+ successful tours (" + host.getRating() + " ★)");
        }

        // Fetch host experiences
        List<ExperienceDto> experiences = experienceRepository.findByHostId(host.getId())
                .stream()
                .map(localHostService::toExperienceDto)
                .collect(Collectors.toList());

        return RecommendedGuideDto.builder()
                .guide(localHostService.toDto(host))
                .matchScore(Math.min(100.0, score))
                .matchReasons(reasons)
                .availableExperiences(experiences)
                .build();
    }

    private ExperienceBookingDto toDto(ExperienceBooking b) {
        List<TripCheckinDto> checkinDtos = checkinRepository.findByBookingIdOrderByCreatedAtAsc(b.getId())
                .stream()
                .map(this::toCheckinDto)
                .collect(Collectors.toList());

        List<ExperienceSupportingProviderDto> suppDtos = new ArrayList<>();
        if (b.getExperience() != null) {
            suppDtos = supportingProviderRepository.findByExperienceId(b.getExperience().getId())
                    .stream()
                    .map(this::toSupportingDto)
                    .collect(Collectors.toList());
        }

        boolean isTripActiveOrConfirmed = List.of("CONFIRMED", "TRAVELER_CHECKED_IN", "GUIDE_CHECKED_IN", "TRIP_STARTED", "IN_PROGRESS", "COMPLETION_PENDING", "COMPLETED")
                .contains(b.getStatus());

        String hostPhone = null;
        if (isTripActiveOrConfirmed && b.getHost() != null && b.getHost().getUser() != null) {
            hostPhone = b.getHost().getUser().getPhone();
        }

        // Destination-specific iconic meeting points and coordinates
        String meetingPointName = b.getDestination() != null ? b.getDestination().getDestinationName() + " Heritage Landmark" : "Local Meeting Point";
        String meetingPointAddress = b.getDestination() != null ? b.getDestination().getDestinationName() + ", India" : "India";
        BigDecimal meetingPointLat = null;
        BigDecimal meetingPointLng = null;

        String destId = b.getDestination() != null ? b.getDestination().getId() : "";
        String cityId = b.getHost() != null && b.getHost().getCity() != null ? b.getHost().getCity().getId() : "";

        if ("dest-136".equalsIgnoreCase(destId) || "tirupati".equalsIgnoreCase(cityId) ||
                (b.getExperience() != null && "exp-tirupati-temple-walk".equalsIgnoreCase(b.getExperience().getId()))) {
            meetingPointName = "Kapila Theertham Main Entrance, Tirupati";
            meetingPointAddress = "Kapila Theertham Road, Alipiri Foot Hills, Tirupati, Andhra Pradesh 517507";
            meetingPointLat = BigDecimal.valueOf(13.6521);
            meetingPointLng = BigDecimal.valueOf(79.4267);
        } else if ("dest-14".equalsIgnoreCase(destId) || "hampi".equalsIgnoreCase(cityId)) {
            meetingPointName = "Virupaksha Temple Main Gopuram Gateway, Hampi Bazaar";
            meetingPointAddress = "Hampi Bazaar Road, Hampi, Karnataka 583239";
            meetingPointLat = BigDecimal.valueOf(15.3350);
            meetingPointLng = BigDecimal.valueOf(76.4600);
        } else if ("dest-3".equalsIgnoreCase(destId) || "jaipur".equalsIgnoreCase(cityId)) {
            meetingPointName = "Hawa Mahal Main Entrance (Tripolia Bazar Gate)";
            meetingPointAddress = "Hawa Mahal Rd, Badi Choupad, J.D.A. Market, Jaipur, Rajasthan 302002";
            meetingPointLat = BigDecimal.valueOf(26.9239);
            meetingPointLng = BigDecimal.valueOf(75.8267);
        } else if ("dest-101".equalsIgnoreCase(destId) || "hyderabad".equalsIgnoreCase(cityId)) {
            meetingPointName = "Charminar Monument North Gate (Bhagyalakshmi Side)";
            meetingPointAddress = "Charminar Rd, Char Kaman, Ghansi Bazaar, Hyderabad, Telangana 500002";
            meetingPointLat = BigDecimal.valueOf(17.3616);
            meetingPointLng = BigDecimal.valueOf(78.4747);
        } else if ("dest-4".equalsIgnoreCase(destId) || "varanasi".equalsIgnoreCase(cityId)) {
            meetingPointName = "Assi Ghat Riverfront Steps";
            meetingPointAddress = "Assi Ghat, Shivala, Varanasi, Uttar Pradesh 221005";
            meetingPointLat = BigDecimal.valueOf(25.2890);
            meetingPointLng = BigDecimal.valueOf(83.0069);
        } else if ("dest-1".equalsIgnoreCase(destId) || "kochi".equalsIgnoreCase(cityId)) {
            meetingPointName = "Fort Kochi Vasco da Gama Square";
            meetingPointAddress = "River Rd, Fort Kochi, Kochi, Kerala 682001";
            meetingPointLat = BigDecimal.valueOf(9.9667);
            meetingPointLng = BigDecimal.valueOf(76.2417);
        } else if ("dest-2".equalsIgnoreCase(destId) || "panaji".equalsIgnoreCase(cityId) || "north-goa".equalsIgnoreCase(cityId)) {
            meetingPointName = "Fontainhas Latin Quarter Fountain Plaza";
            meetingPointAddress = "Altinho, Panaji, Goa 403001";
            meetingPointLat = BigDecimal.valueOf(15.4989);
            meetingPointLng = BigDecimal.valueOf(73.8278);
        } else if ("dest-5".equalsIgnoreCase(destId) || "agra".equalsIgnoreCase(cityId)) {
            meetingPointName = "Taj Mahal East Gate Courtyard";
            meetingPointAddress = "Dharmapuri, Forest Colony, Tajganj, Agra, Uttar Pradesh 282001";
            meetingPointLat = BigDecimal.valueOf(27.1751);
            meetingPointLng = BigDecimal.valueOf(78.0421);
        } else if ("dest-6".equalsIgnoreCase(destId) || "udaipur".equalsIgnoreCase(cityId)) {
            meetingPointName = "City Palace Tripolia Gate, Lake Pichola";
            meetingPointAddress = "City Palace Complex, Udaipur, Rajasthan 313001";
            meetingPointLat = BigDecimal.valueOf(24.5764);
            meetingPointLng = BigDecimal.valueOf(73.6835);
        } else if (b.getDestination() != null) {
            meetingPointName = b.getDestination().getDestinationName() + " Central Tourist Landmark";
            meetingPointAddress = b.getDestination().getDestinationName() + (b.getDestination().getState() != null ? ", " + b.getDestination().getState().getStateName() : "");
            meetingPointLat = b.getDestination().getLatitude();
            meetingPointLng = b.getDestination().getLongitude();
        } else if (b.getHost() != null && b.getHost().getCity() != null) {
            meetingPointName = b.getHost().getCity().getCityName() + " Central Tourist Landmark";
            meetingPointAddress = b.getHost().getCity().getCityName();
            meetingPointLat = b.getHost().getCity().getLatitude();
            meetingPointLng = b.getHost().getCity().getLongitude();
        }

        BigDecimal durationHours = b.getExperience() != null && b.getExperience().getDurationHours() != null
                ? b.getExperience().getDurationHours()
                : BigDecimal.valueOf(3.0);

        return ExperienceBookingDto.builder()
                .id(b.getId())
                .bookingReference(b.getBookingReference())
                .touristUserId(b.getTourist().getId())
                .touristName(b.getTourist().getFullName())
                .touristEmail(b.getTourist().getEmail())
                .hostId(b.getHost().getId())
                .hostName(b.getHost().getName())
                .hostRoleTitle(b.getHost().getRoleTitle())
                .hostAvatarUrl(b.getHost().getAvatarUrl())
                .experienceId(b.getExperience() != null ? b.getExperience().getId() : null)
                .experienceTitle(b.getExperience() != null ? b.getExperience().getTitle() : (b.getDestination() != null ? b.getDestination().getDestinationName() + " Guided Cultural Experience" : "Custom Guided Tour"))
                .destinationId(b.getDestination() != null ? b.getDestination().getId() : null)
                .destinationName(b.getDestination() != null ? b.getDestination().getDestinationName() : null)
                .bookingType(b.getBookingType())
                .bookingDate(b.getBookingDate())
                .startTime(b.getStartTime())
                .guestCount(b.getGuestCount())
                .totalAmount(b.getTotalAmount())
                .currency(b.getCurrency())
                .status(b.getStatus())
                .customRequirements(b.getCustomRequirements())
                .customItinerary(b.getCustomItinerary())
                .paymentStatus(b.getPaymentStatus())
                .paymentMethod(b.getPaymentMethod() != null ? b.getPaymentMethod() : "ONLINE")
                .cashMilestone1Amount(b.getCashMilestone1Amount())
                .cashMilestone1Paid(b.getCashMilestone1Paid())
                .cashMilestone1PaidAt(b.getCashMilestone1PaidAt())
                .cashMilestone2Amount(b.getCashMilestone2Amount())
                .cashMilestone2Paid(b.getCashMilestone2Paid())
                .cashMilestone2PaidAt(b.getCashMilestone2PaidAt())
                .razorpayOrderId(b.getRazorpayOrderId())
                .razorpayPaymentId(b.getRazorpayPaymentId())
                .notes(b.getNotes())
                .meetingPointName(meetingPointName)
                .meetingPointAddress(meetingPointAddress)
                .meetingPointLatitude(meetingPointLat)
                .meetingPointLongitude(meetingPointLng)
                .hostPhone(hostPhone)
                .durationHours(durationHours)
                .checkins(checkinDtos)
                .supportingProviders(suppDtos)
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }

    private TripCheckinDto toCheckinDto(TripCheckin c) {
        return TripCheckinDto.builder()
                .id(c.getId())
                .bookingId(c.getBooking().getId())
                .checkpointName(c.getCheckpointName())
                .checkpointType(c.getCheckpointType())
                .status(c.getStatus())
                .scheduledTime(c.getScheduledTime())
                .checkedInAt(c.getCheckedInAt())
                .notes(c.getNotes())
                .latitude(c.getLatitude())
                .longitude(c.getLongitude())
                .createdAt(c.getCreatedAt())
                .build();
    }

    private TripSafetyIncidentDto toIncidentDto(TripSafetyIncident i) {
        return TripSafetyIncidentDto.builder()
                .id(i.getId())
                .bookingId(i.getBooking() != null ? i.getBooking().getId() : null)
                .userId(i.getUser().getId())
                .userName(i.getUser().getFullName())
                .incidentType(i.getIncidentType())
                .severity(i.getSeverity())
                .status(i.getStatus())
                .details(i.getDetails())
                .emergencyContactNotified(i.getEmergencyContactNotified())
                .latitude(i.getLatitude())
                .longitude(i.getLongitude())
                .createdAt(i.getCreatedAt())
                .resolvedAt(i.getResolvedAt())
                .build();
    }

    private ExperienceSupportingProviderDto toSupportingDto(ExperienceSupportingProvider s) {
        return ExperienceSupportingProviderDto.builder()
                .id(s.getId())
                .experienceId(s.getExperience().getId())
                .providerId(s.getProviderId())
                .providerName(s.getProviderName())
                .providerType(s.getProviderType())
                .roleDescription(s.getRoleDescription())
                .status(s.getStatus())
                .notes(s.getNotes())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
