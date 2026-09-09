package com.yatrasetu.service;

import com.yatrasetu.config.ResourceNotFoundException;
import com.yatrasetu.domain.HotelBooking;
import com.yatrasetu.domain.Notification;
import com.yatrasetu.domain.User;
import com.yatrasetu.repository.HotelBookingRepository;
import com.yatrasetu.repository.NotificationRepository;
import com.yatrasetu.repository.UserRepository;
import com.yatrasetu.web.dto.NotificationDto;
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
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final HotelBookingRepository bookingRepository;
    private final com.yatrasetu.repository.LocalHostRepository localHostRepository;

    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(String userIdOrEmail, boolean unreadOnly) {
        User user = resolveUser(userIdOrEmail);
        List<Notification> notifications;
        if (unreadOnly) {
            notifications = notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(user.getId());
        } else {
            notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        }
        return notifications.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String userIdOrEmail) {
        User user = resolveUser(userIdOrEmail);
        return notificationRepository.countByUserIdAndReadFalse(user.getId());
    }

    @Transactional
    public NotificationDto markAsRead(String notificationId, String userIdOrEmail) {
        User user = resolveUser(userIdOrEmail);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not have permission to modify this notification");
        }

        if (!notification.isRead()) {
            notification.setRead(true);
            notification = notificationRepository.saveAndFlush(notification);
        }
        return mapToDto(notification);
    }

    @Transactional
    public int markAllAsRead(String userIdOrEmail) {
        User user = resolveUser(userIdOrEmail);
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(user.getId());
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAllAndFlush(unread);
        return unread.size();
    }

    /**
     * Idempotently create in-app notifications for traveler and property owner on booking confirmation.
     * Guaranteed non-blocking: failure to emit notification does not abort booking confirmation.
     */
    @Transactional
    public void emitBookingConfirmationNotifications(String bookingReference) {
        if (bookingReference == null) return;
        bookingRepository.findByBookingReference(bookingReference).ifPresent(this::emitBookingConfirmationNotifications);
    }

    /**
     * Idempotently create in-app notifications for traveler and property owner on booking confirmation.
     * Guaranteed non-blocking: failure to emit notification does not abort booking confirmation.
     */
    @Transactional
    public void emitBookingConfirmationNotifications(HotelBooking booking) {
        if (booking == null) {
            return;
        }

        // Safely re-fetch booking within transaction if lazy associations may be uninitialized
        HotelBooking loadedBooking = booking;
        if (booking.getId() != null) {
            loadedBooking = bookingRepository.findById(booking.getId()).orElse(booking);
        }

        if (loadedBooking.getTraveler() == null) {
            return;
        }

        String ref = loadedBooking.getBookingReference();
        String hotelName = loadedBooking.getHotel() != null ? loadedBooking.getHotel().getHotelName() : "Hotel";

        // 1. Traveler Notification (Deduplication Check)
        try {
            List<Notification> travelerNotifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(loadedBooking.getTraveler().getId());
            boolean travelerAlreadyNotified = travelerNotifs.stream()
                    .anyMatch(n -> "BOOKING_CONFIRMED".equals(n.getCategory()) && n.getMessage().contains(ref));

            if (!travelerAlreadyNotified) {
                notificationRepository.save(Notification.builder()
                        .id("notif-" + UUID.randomUUID().toString().substring(0, 12))
                        .user(loadedBooking.getTraveler())
                        .title("Booking Confirmed: " + ref)
                        .message("Your hotel booking " + ref + " at " + hotelName + " is confirmed. Payment verified.")
                        .category("BOOKING_CONFIRMED")
                        .referenceLink("/bookings/" + ref + "/confirmation")
                        .read(false)
                        .createdAt(Instant.now())
                        .build());
                log.info("Emitted traveler confirmation notification for booking {}", ref);
            }
        } catch (Exception e) {
            log.warn("Failed to create traveler notification for confirmed booking {}: {}", ref, e.getMessage());
        }

        // 2. Partner Notification (Deduplication Check)
        try {
            if (loadedBooking.getHotel() != null && loadedBooking.getHotel().getOwner() != null) {
                User partner = loadedBooking.getHotel().getOwner();
                List<Notification> partnerNotifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(partner.getId());
                boolean partnerAlreadyNotified = partnerNotifs.stream()
                        .anyMatch(n -> "PARTNER_BOOKING_CONFIRMED".equals(n.getCategory()) && n.getMessage().contains(ref));

                if (!partnerAlreadyNotified) {
                    notificationRepository.save(Notification.builder()
                            .id("notif-" + UUID.randomUUID().toString().substring(0, 12))
                            .user(partner)
                            .title("New Confirmed Booking: " + ref)
                            .message("New confirmed reservation " + ref + " received for " + hotelName + " (" +
                                    loadedBooking.getCheckIn() + " to " + loadedBooking.getCheckOut() + ", " +
                                    loadedBooking.getNumberOfRooms() + " room(s)).")
                            .category("PARTNER_BOOKING_CONFIRMED")
                            .referenceLink("/partner/dashboard")
                            .read(false)
                            .createdAt(Instant.now())
                            .build());
                    log.info("Emitted partner confirmation notification for booking {} to owner {}", ref, partner.getEmail());
                }
            }
        } catch (Exception e) {
            log.warn("Failed to create partner notification for confirmed booking {}: {}", ref, e.getMessage());
        }
    }

    @Transactional
    public void sendNotification(User user, String title, String message, String category, String referenceLink) {
        sendNotification(user, title, message, category, referenceLink, null);
    }

    @Transactional
    public void sendNotification(User user, String title, String message, String category, String referenceLink, String deduplicationKey) {
        if (user == null) return;
        try {
            // Deduplication Check
            List<Notification> userNotifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
            boolean alreadySent = userNotifs.stream().anyMatch(n -> {
                if (category != null && !category.equals(n.getCategory())) {
                    return false;
                }
                if (deduplicationKey != null && !deduplicationKey.isBlank()) {
                    return (n.getMessage() != null && n.getMessage().contains(deduplicationKey))
                            || (n.getReferenceLink() != null && n.getReferenceLink().contains(deduplicationKey));
                }
                return title != null && title.equals(n.getTitle()) && message != null && message.equals(n.getMessage());
            });

            if (alreadySent) {
                log.info("Deduplicated notification [{}] for user {}: {}", category, user.getEmail(), title);
                return;
            }

            notificationRepository.save(Notification.builder()
                    .id("notif-" + UUID.randomUUID().toString().substring(0, 12))
                    .user(user)
                    .title(title)
                    .message(message)
                    .category(category != null ? category : "SYSTEM")
                    .referenceLink(referenceLink)
                    .read(false)
                    .createdAt(Instant.now())
                    .build());
            log.info("Emitted notification [{}] to user {}: {}", category, user.getEmail(), title);
        } catch (Exception e) {
            log.warn("Failed to send notification to user {}: {}", user.getEmail(), e.getMessage());
        }
    }

    @Transactional
    public void emitHotelBookingRequested(HotelBooking booking) {
        if (booking == null) return;
        String ref = booking.getBookingReference();
        String hotelName = booking.getHotel() != null ? booking.getHotel().getHotelName() : "Hotel";

        // Notify Hotel Owner/Partner (Only for YatraSetu registered partner hotels)
        if (booking.getHotel() != null && booking.getHotel().getOwner() != null) {
            sendNotification(
                    booking.getHotel().getOwner(),
                    "🔔 New Hotel Booking Request",
                    "New reservation request " + ref + " for " + hotelName + " from " + booking.getGuestName() +
                            " (" + booking.getCheckIn() + " to " + booking.getCheckOut() + ", " + booking.getNumberOfRooms() + " room(s)).",
                    "HOTEL_BOOKING_REQUEST",
                    "/partner/dashboard",
                    ref
            );
        }

        // Notify Traveler
        if (booking.getTraveler() != null) {
            sendNotification(
                    booking.getTraveler(),
                    "Hotel Booking Requested",
                    "Your booking request " + ref + " at " + hotelName + " has been submitted and is awaiting hotel confirmation.",
                    "HOTEL_BOOKING_REQUESTED",
                    "/trips",
                    ref
            );
        }
    }

    @Transactional
    public void emitHotelBookingAccepted(HotelBooking booking) {
        if (booking == null || booking.getTraveler() == null) return;
        String ref = booking.getBookingReference();
        String hotelName = booking.getHotel() != null ? booking.getHotel().getHotelName() : "Hotel";

        sendNotification(
                booking.getTraveler(),
                "✓ Hotel Booking Accepted",
                "Your booking request at " + hotelName + " has been accepted by the property! Please complete payment or review your confirmation pass (" + ref + ").",
                "HOTEL_BOOKING_ACCEPTED",
                "/bookings/" + ref + "/confirmation",
                ref
        );
    }

    @Transactional
    public void emitHotelBookingRejected(HotelBooking booking, String reason) {
        if (booking == null || booking.getTraveler() == null) return;
        String ref = booking.getBookingReference();
        String hotelName = booking.getHotel() != null ? booking.getHotel().getHotelName() : "Hotel";

        sendNotification(
                booking.getTraveler(),
                "❌ Hotel Booking Declined",
                "Your booking request " + ref + " at " + hotelName + " could not be confirmed." +
                        (reason != null && !reason.isBlank() ? " Reason: " + reason : ""),
                "HOTEL_BOOKING_REJECTED",
                "/trips",
                ref
        );
    }

    @Transactional
    public void emitHotelCheckinConfirmed(HotelBooking booking) {
        if (booking == null) return;
        String ref = booking.getBookingReference();
        String hotelName = booking.getHotel() != null ? booking.getHotel().getHotelName() : "Hotel";

        if (booking.getTraveler() != null) {
            sendNotification(
                    booking.getTraveler(),
                    "✓ Hotel Check-in Confirmed",
                    "Welcome to " + hotelName + "! Your QR pass (" + ref + ") has been verified and check-in is complete.",
                    "HOTEL_CHECKIN_CONFIRMED",
                    "/trips",
                    ref
            );
        }
    }

    @Transactional
    public void emitHotelStayCompleted(HotelBooking booking) {
        if (booking == null) return;
        String ref = booking.getBookingReference();
        String hotelName = booking.getHotel() != null ? booking.getHotel().getHotelName() : "Hotel";

        if (booking.getTraveler() != null) {
            sendNotification(
                    booking.getTraveler(),
                    "✓ Hotel Stay Completed",
                    "Thank you for staying at " + hotelName + " (" + ref + ")! How was your experience? Leave a review to help fellow travelers.",
                    "HOTEL_STAY_COMPLETED",
                    "/trips",
                    ref
            );
        }
    }

    @Transactional
    public void emitGuideBookingRequested(com.yatrasetu.domain.ExperienceBooking booking) {
        if (booking == null) return;
        String ref = booking.getBookingReference();
        String expTitle = booking.getExperience() != null ? booking.getExperience().getTitle() : "Custom Trip";

        User hostUser = null;
        if (booking.getHost() != null) {
            if (booking.getHost().getUser() != null) {
                hostUser = booking.getHost().getUser();
            } else if (booking.getHost().getId() != null) {
                hostUser = localHostRepository.findById(booking.getHost().getId())
                        .map(com.yatrasetu.domain.LocalHost::getUser)
                        .orElse(null);
            }
        }

        if (hostUser != null) {
            sendNotification(
                    hostUser,
                    "🔔 New Trip Request",
                    "New trip booking request " + ref + " for '" + expTitle + "' from " +
                            (booking.getTourist() != null ? booking.getTourist().getFullName() : "Tourist") +
                            " on " + booking.getBookingDate() + " (" + booking.getGuestCount() + " guest(s)).",
                    "GUIDE_BOOKING_REQUEST",
                    "/partner/dashboard",
                    ref
            );
        }

        if (booking.getTourist() != null) {
            sendNotification(
                    booking.getTourist(),
                    "Trip Booking Requested",
                    "Your request " + ref + " for '" + expTitle + "' has been sent to your local guide.",
                    "GUIDE_BOOKING_REQUESTED",
                    "/bookings",
                    ref
            );
        }
    }

    @Transactional
    public void emitGuideBookingAccepted(com.yatrasetu.domain.ExperienceBooking booking) {
        if (booking == null || booking.getTourist() == null) return;
        String ref = booking.getBookingReference();
        String expTitle = booking.getExperience() != null ? booking.getExperience().getTitle() : "Custom Trip";
        sendNotification(
                booking.getTourist(),
                "✓ Guide Booking Accepted",
                "Your guide " + (booking.getHost() != null ? booking.getHost().getName() : "Host") +
                        " has accepted your request for '" + expTitle + "' (" + ref + ")! Proceed to complete payment.",
                "GUIDE_BOOKING_ACCEPTED",
                "/bookings",
                ref
        );
    }

    @Transactional
    public void emitGuideBookingRejected(com.yatrasetu.domain.ExperienceBooking booking, String reason) {
        if (booking == null || booking.getTourist() == null) return;
        String ref = booking.getBookingReference();
        String expTitle = booking.getExperience() != null ? booking.getExperience().getTitle() : "Custom Trip";
        sendNotification(
                booking.getTourist(),
                "❌ Trip Request Declined",
                "Your trip request " + ref + " for '" + expTitle + "' was declined." +
                        (reason != null && !reason.isBlank() ? " Reason: " + reason : ""),
                "GUIDE_BOOKING_REJECTED",
                "/bookings",
                ref
        );
    }

    @Transactional
    public void emitGuideBookingConfirmed(com.yatrasetu.domain.ExperienceBooking booking) {
        if (booking == null) return;
        String ref = booking.getBookingReference();
        String expTitle = booking.getExperience() != null ? booking.getExperience().getTitle() : "Trip";

        if (booking.getTourist() != null) {
            sendNotification(
                    booking.getTourist(),
                    "✓ Trip Booking Confirmed",
                    "Your booking " + ref + " for '" + expTitle + "' is confirmed! Check your meeting point and prepare for your experience.",
                    "GUIDE_BOOKING_CONFIRMED",
                    "/bookings",
                    ref
            );
        }
        User hostUser = null;
        if (booking.getHost() != null) {
            hostUser = booking.getHost().getUser();
            if (hostUser == null && booking.getHost().getId() != null) {
                hostUser = localHostRepository.findById(booking.getHost().getId())
                        .map(com.yatrasetu.domain.LocalHost::getUser)
                        .orElse(null);
            }
        }
        if (hostUser != null) {
            sendNotification(
                    hostUser,
                    "✓ Payment Confirmed: " + ref,
                    "Booking " + ref + " for '" + expTitle + "' is confirmed and ready for trip day.",
                    "PARTNER_GUIDE_CONFIRMED",
                    "/partner/dashboard",
                    ref
            );
        }
    }

    @Transactional
    public void emitGuideTripStarted(com.yatrasetu.domain.ExperienceBooking booking) {
        if (booking == null || booking.getTourist() == null) return;
        String ref = booking.getBookingReference();
        sendNotification(
                booking.getTourist(),
                "🚀 Your Live Trip has Started!",
                "Your guide " + (booking.getHost() != null ? booking.getHost().getName() : "Host") +
                        " has officially started the trip (" + ref + "). Live safety tracking and checkpoint check-ins are active.",
                "TRIP_STARTED",
                "/bookings",
                ref
        );
    }

    @Transactional
    public void emitGuideMarkedCompletionPending(com.yatrasetu.domain.ExperienceBooking booking) {
        if (booking == null || booking.getTourist() == null) return;
        String ref = booking.getBookingReference();
        String hostName = (booking.getHost() != null && booking.getHost().getName() != null)
                ? booking.getHost().getName()
                : "Your Guide";
        sendNotification(
                booking.getTourist(),
                "✓ Guide Concluded Tour",
                hostName + " has marked your tour (" + ref + ") as completed. Please confirm completion to finalize the trip.",
                "TRIP_COMPLETION_PENDING",
                "/bookings",
                ref + "-pending"
        );
    }

    @Transactional
    public void emitTouristConfirmedTripCompletion(com.yatrasetu.domain.ExperienceBooking booking) {
        if (booking == null) return;
        String ref = booking.getBookingReference();
        String touristName = (booking.getTourist() != null && booking.getTourist().getFullName() != null)
                ? booking.getTourist().getFullName()
                : "Guest";

        if (booking.getHost() != null && booking.getHost().getUser() != null) {
            sendNotification(
                    booking.getHost().getUser(),
                    "✓ Trip Completion Confirmed",
                    touristName + " confirmed completion for trip " + ref + ". Tour concluded successfully.",
                    "TRIP_COMPLETED",
                    "/partner/dashboard",
                    ref + "-confirmed"
            );
        }
    }

    @Transactional
    public void emitGuideTripCompleted(com.yatrasetu.domain.ExperienceBooking booking) {
        emitTouristConfirmedTripCompletion(booking);
    }

    @Transactional
    public void emitSupportingProviderInvited(com.yatrasetu.domain.ExperienceSupportingProvider sp) {
        if (sp == null) return;
        String expTitle = sp.getExperience() != null ? sp.getExperience().getTitle() : "Experience";
        String hostName = (sp.getExperience() != null && sp.getExperience().getHost() != null) 
                ? sp.getExperience().getHost().getName() 
                : "Guide";

        User targetUser = null;
        // 1. Try finding local host by provider ID
        if (sp.getProviderId() != null) {
            targetUser = localHostRepository.findById(sp.getProviderId())
                    .map(com.yatrasetu.domain.LocalHost::getUser)
                    .orElse(null);
        }
        // 2. Try direct user repository by ID, AuthUserId, or Email
        if (targetUser == null && sp.getProviderId() != null) {
            targetUser = userRepository.findById(sp.getProviderId())
                    .or(() -> userRepository.findByAuthUserId(sp.getProviderId()))
                    .or(() -> userRepository.findByEmailIgnoreCase(sp.getProviderId()))
                    .orElse(null);
        }
        // 3. Try by provider name or email
        if (targetUser == null && sp.getProviderName() != null) {
            targetUser = userRepository.findByFullName(sp.getProviderName())
                    .or(() -> userRepository.findByEmailIgnoreCase(sp.getProviderName()))
                    .orElse(null);
        }

        if (targetUser != null) {
            sendNotification(
                    targetUser,
                    "🎨 New Experience Collaboration Invitation",
                    "You have been invited by " + hostName + " to join '" + expTitle + "' as a supporting " + sp.getProviderType() + " (" + sp.getId() + ").",
                    "SUPPORTING_PROVIDER_INVITE",
                    "/partner/dashboard",
                    sp.getId()
            );
        }
    }

    @Transactional
    public void emitSupportingProviderResponded(com.yatrasetu.domain.ExperienceSupportingProvider sp) {
        if (sp == null || sp.getExperience() == null) return;
        String expTitle = sp.getExperience().getTitle();
        User hostUser = null;
        if (sp.getExperience().getHost() != null) {
            hostUser = sp.getExperience().getHost().getUser();
            if (hostUser == null && sp.getExperience().getHost().getId() != null) {
                hostUser = localHostRepository.findById(sp.getExperience().getHost().getId())
                        .map(com.yatrasetu.domain.LocalHost::getUser)
                        .orElse(null);
            }
        }

        if (hostUser != null) {
            boolean accepted = "ACCEPTED".equalsIgnoreCase(sp.getStatus());
            String title = accepted ? "✓ Supporting Partner Accepted" : "ℹ Supporting Partner Declined";
            String msg = sp.getProviderName() + " has " + (accepted ? "accepted" : "declined") +
                    " your collaboration invitation for '" + expTitle + "' (" + sp.getId() + ").";

            sendNotification(
                    hostUser,
                    title,
                    msg,
                    "SUPPORTING_PROVIDER_RESPONSE",
                    "/partner/dashboard",
                    sp.getId() + "_" + sp.getStatus()
            );
        }
    }

    private User resolveUser(String userIdOrEmail) {
        if (userIdOrEmail == null || userIdOrEmail.isBlank()) {
            throw new AccessDeniedException("Authentication required.");
        }
        return userRepository.findById(userIdOrEmail)
                .or(() -> userRepository.findByEmail(userIdOrEmail))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userIdOrEmail));
    }

    private NotificationDto mapToDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .userId(n.getUser() != null ? n.getUser().getId() : null)
                .title(n.getTitle())
                .message(n.getMessage())
                .category(n.getCategory())
                .referenceLink(n.getReferenceLink())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
