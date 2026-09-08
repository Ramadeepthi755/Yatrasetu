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
        if (user == null) return;
        try {
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

        // Notify Hotel Owner/Partner
        if (booking.getHotel() != null && booking.getHotel().getOwner() != null) {
            sendNotification(
                    booking.getHotel().getOwner(),
                    "🔔 New Hotel Booking Request",
                    "New reservation request " + ref + " for " + hotelName + " from " + booking.getGuestName() +
                            " (" + booking.getCheckIn() + " to " + booking.getCheckOut() + ", " + booking.getNumberOfRooms() + " room(s)).",
                    "HOTEL_BOOKING_REQUEST",
                    "/partner/dashboard"
            );
        }

        // Notify Traveler
        if (booking.getTraveler() != null) {
            sendNotification(
                    booking.getTraveler(),
                    "Hotel Booking Requested",
                    "Your booking request " + ref + " at " + hotelName + " has been submitted and is awaiting hotel confirmation.",
                    "HOTEL_BOOKING_REQUESTED",
                    "/trips"
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
                "Your booking request at " + hotelName + " has been accepted by the property! Please complete payment or review your confirmation pass.",
                "HOTEL_BOOKING_ACCEPTED",
                "/bookings/" + ref + "/confirmation"
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
                "/trips"
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
                    "Welcome to " + hotelName + "! Your QR pass has been verified and check-in is complete.",
                    "HOTEL_CHECKIN_CONFIRMED",
                    "/trips"
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
                    "Thank you for staying at " + hotelName + "! How was your experience? Leave a review to help fellow travelers.",
                    "HOTEL_STAY_COMPLETED",
                    "/trips"
            );
        }
    }

    @Transactional
    public void emitGuideBookingRequested(com.yatrasetu.domain.ExperienceBooking booking) {
        if (booking == null) return;
        String ref = booking.getBookingReference();
        String expTitle = booking.getExperience() != null ? booking.getExperience().getTitle() : "Custom Trip";

        if (booking.getHost() != null && booking.getHost().getUser() != null) {
            sendNotification(
                    booking.getHost().getUser(),
                    "🔔 New Trip Request",
                    "New trip booking request " + ref + " for '" + expTitle + "' from " +
                            (booking.getTourist() != null ? booking.getTourist().getFullName() : "Tourist") +
                            " on " + booking.getBookingDate() + " (" + booking.getGuestCount() + " guest(s)).",
                    "GUIDE_BOOKING_REQUEST",
                    "/partner/dashboard"
            );
        }

        if (booking.getTourist() != null) {
            sendNotification(
                    booking.getTourist(),
                    "Trip Booking Requested",
                    "Your request " + ref + " for '" + expTitle + "' has been sent to your local guide.",
                    "GUIDE_BOOKING_REQUESTED",
                    "/bookings"
            );
        }
    }

    @Transactional
    public void emitGuideBookingAccepted(com.yatrasetu.domain.ExperienceBooking booking) {
        if (booking == null || booking.getTourist() != null) {
            String expTitle = booking.getExperience() != null ? booking.getExperience().getTitle() : "Custom Trip";
            sendNotification(
                    booking.getTourist(),
                    "✓ Guide Booking Accepted",
                    "Your guide " + (booking.getHost() != null ? booking.getHost().getName() : "Host") +
                            " has accepted your request for '" + expTitle + "'! Proceed to complete payment.",
                    "GUIDE_BOOKING_ACCEPTED",
                    "/bookings"
            );
        }
    }

    @Transactional
    public void emitGuideBookingRejected(com.yatrasetu.domain.ExperienceBooking booking, String reason) {
        if (booking == null || booking.getTourist() == null) return;
        String expTitle = booking.getExperience() != null ? booking.getExperience().getTitle() : "Custom Trip";
        sendNotification(
                booking.getTourist(),
                "❌ Trip Request Declined",
                "Your trip request for '" + expTitle + "' was declined." +
                        (reason != null && !reason.isBlank() ? " Reason: " + reason : ""),
                "GUIDE_BOOKING_REJECTED",
                "/bookings"
        );
    }

    @Transactional
    public void emitGuideBookingConfirmed(com.yatrasetu.domain.ExperienceBooking booking) {
        if (booking == null) return;
        String expTitle = booking.getExperience() != null ? booking.getExperience().getTitle() : "Trip";

        if (booking.getTourist() != null) {
            sendNotification(
                    booking.getTourist(),
                    "✓ Trip Booking Confirmed",
                    "Your booking for '" + expTitle + "' is confirmed! Check your meeting point and prepare for your experience.",
                    "GUIDE_BOOKING_CONFIRMED",
                    "/bookings"
            );
        }
        if (booking.getHost() != null && booking.getHost().getUser() != null) {
            sendNotification(
                    booking.getHost().getUser(),
                    "✓ Payment Confirmed: " + booking.getBookingReference(),
                    "Booking " + booking.getBookingReference() + " for '" + expTitle + "' is confirmed and ready for trip day.",
                    "PARTNER_GUIDE_CONFIRMED",
                    "/partner/dashboard"
            );
        }
    }

    @Transactional
    public void emitGuideTripStarted(com.yatrasetu.domain.ExperienceBooking booking) {
        if (booking == null || booking.getTourist() == null) return;
        sendNotification(
                booking.getTourist(),
                "🚀 Your Live Trip has Started!",
                "Your guide " + (booking.getHost() != null ? booking.getHost().getName() : "Host") +
                        " has officially started the trip. Live safety tracking and checkpoint check-ins are active.",
                "TRIP_STARTED",
                "/bookings"
        );
    }

    @Transactional
    public void emitGuideTripCompleted(com.yatrasetu.domain.ExperienceBooking booking) {
        if (booking == null || booking.getTourist() == null) return;
        sendNotification(
                booking.getTourist(),
                "✓ Trip Completed",
                "Your trip has concluded! Please confirm completion and leave a review for your guide.",
                "TRIP_COMPLETED",
                "/bookings"
        );
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
