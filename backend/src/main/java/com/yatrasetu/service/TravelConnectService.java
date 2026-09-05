package com.yatrasetu.service;

import com.yatrasetu.domain.*;
import com.yatrasetu.repository.*;
import com.yatrasetu.web.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TravelConnectService {

    private final TravelBuddyRepository travelBuddyRepository;
    private final TravelBuddyRequestRepository travelBuddyRequestRepository;
    private final MessageRepository messageRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final DestinationRepository destinationRepository;

    /**
     * Discovery with deterministic compatibility scoring
     */
    public Page<TravelerDiscoveryDto> discoverTravelers(
            String destinationId,
            String city,
            String travelStyle,
            LocalDate fromDate,
            LocalDate toDate,
            String currentUserId,
            Pageable pageable) {

        Page<TravelBuddy> buddies = travelBuddyRepository.searchTravelers(
                destinationId, city, travelStyle, fromDate, toDate, currentUserId, pageable);

        // Fetch viewer preferences if authenticated
        TravelBuddy viewerBuddy = null;
        Profile viewerProfile = null;
        if (currentUserId != null) {
            viewerBuddy = travelBuddyRepository.findFirstByUserIdAndActiveTrueOrderByTravelDateAsc(currentUserId).orElse(null);
            viewerProfile = profileRepository.findById(currentUserId).orElse(null);
        }

        final TravelBuddy finalViewerBuddy = viewerBuddy;
        final Profile finalViewerProfile = viewerProfile;

        return buddies.map(buddy -> toDiscoveryDto(buddy, currentUserId, finalViewerBuddy, finalViewerProfile, destinationId, fromDate, toDate));
    }

    public List<TravelerDiscoveryDto> getDestinationTravelers(String destinationId, int limit, String currentUserId) {
        List<TravelBuddy> buddies = travelBuddyRepository.findTopTravelersByDestination(
                destinationId, PageRequest.of(0, limit));

        TravelBuddy viewerBuddy = null;
        Profile viewerProfile = null;
        if (currentUserId != null) {
            viewerBuddy = travelBuddyRepository.findFirstByUserIdAndActiveTrueOrderByTravelDateAsc(currentUserId).orElse(null);
            viewerProfile = profileRepository.findById(currentUserId).orElse(null);
        }

        final TravelBuddy finalViewerBuddy = viewerBuddy;
        final Profile finalViewerProfile = viewerProfile;

        return buddies.stream()
                .filter(b -> currentUserId == null || b.getUser() == null || !b.getUser().getId().equals(currentUserId))
                .map(buddy -> toDiscoveryDto(buddy, currentUserId, finalViewerBuddy, finalViewerProfile, destinationId, null, null))
                .toList();
    }

    public TravelerProfileDto getTravelerProfile(String travelerId, String currentUserId) {
        User user = userRepository.findById(travelerId)
                .orElseThrow(() -> new IllegalArgumentException("Traveler not found with ID: " + travelerId));

        Profile profile = profileRepository.findById(travelerId).orElse(null);
        List<TravelBuddy> trips = travelBuddyRepository.findByUserId(travelerId);

        String status = "NONE";
        String connectionId = null;
        if (currentUserId != null && !currentUserId.equals(travelerId)) {
            List<TravelBuddyRequest> reqs = travelBuddyRequestRepository.findActiveRequestsBetween(currentUserId, travelerId);
            if (!reqs.isEmpty()) {
                TravelBuddyRequest r = reqs.get(0);
                status = resolveStatusForViewer(r, currentUserId);
                connectionId = r.getId();
            }
        }

        List<TravelerDiscoveryDto> upcomingTrips = trips.stream()
                .filter(TravelBuddy::isActive)
                .map(t -> toDiscoveryDto(t, currentUserId, null, null, null, null, null))
                .toList();

        return TravelerProfileDto.builder()
                .id(user.getId())
                .displayName(profile != null && profile.getDisplayName() != null ? profile.getDisplayName() : user.getFullName())
                .avatarUrl(user.getAvatarUrl() != null ? user.getAvatarUrl() : (profile != null ? profile.getProfileImageUrl() : null))
                .homeCity(profile != null ? profile.getHomeCity() : null)
                .city(profile != null ? profile.getCity() : null)
                .state(profile != null ? profile.getState() : null)
                .bio(profile != null ? profile.getBio() : "Passionate explorer passionate about cultural journeys across India.")
                .travelStyle(profile != null ? profile.getTravelStyle() : "Explorer")
                .budgetPreference(profile != null ? profile.getBudgetPreference() : "Mid-Range")
                .languages(profile != null && profile.getLanguages() != null ? profile.getLanguages() : List.of("English", "Hindi"))
                .interests(profile != null && profile.getInterests() != null ? profile.getInterests() : List.of("Heritage", "Culture", "Food"))
                .isDemoData(!trips.isEmpty() && trips.get(0).isDemoData())
                .travelConnectEnabled(profile == null || profile.isTravelConnectEnabled())
                .connectionStatus(status)
                .connectionId(connectionId)
                .upcomingTrips(upcomingTrips)
                .build();
    }

    @Transactional
    public ConnectionRequestDto sendConnectionRequest(String senderId, CreateConnectionRequest req) {
        if (senderId.equals(req.getRecipientTravelerId())) {
            throw new IllegalArgumentException("Cannot send a connection request to yourself");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender user not found"));
        User receiver = userRepository.findById(req.getRecipientTravelerId())
                .orElseThrow(() -> new IllegalArgumentException("Recipient traveler not found"));

        Profile receiverProfile = profileRepository.findById(receiver.getId()).orElse(null);
        if (receiverProfile != null && !receiverProfile.isTravelConnectEnabled()) {
            throw new IllegalStateException("Traveler has disabled Travel Connect discovery");
        }

        List<TravelBuddyRequest> existingRequests = travelBuddyRequestRepository.findActiveRequestsBetween(senderId, receiver.getId());
        if (!existingRequests.isEmpty()) {
            TravelBuddyRequest existing = existingRequests.get(0);
            if ("BLOCKED".equals(existing.getStatus())) {
                throw new IllegalStateException("Unable to connect with this traveler");
            }
            if ("PENDING".equals(existing.getStatus()) || "ACCEPTED".equals(existing.getStatus())) {
                throw new IllegalStateException("A pending request or active connection already exists between you and this traveler");
            }
        }

        Destination destination = null;
        if (req.getDestinationId() != null) {
            destination = destinationRepository.findById(req.getDestinationId()).orElse(null);
        }

        TravelBuddyRequest request = TravelBuddyRequest.builder()
                .id("tbr-" + UUID.randomUUID().toString().substring(0, 8))
                .sender(sender)
                .receiver(receiver)
                .destination(destination)
                .status("PENDING")
                .message(req.getMessage() != null && !req.getMessage().isBlank()
                        ? req.getMessage()
                        : "Hi! I noticed we are both planning similar travel. Would love to connect on YatraSetu!")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        TravelBuddyRequest saved = travelBuddyRequestRepository.save(request);

        // Generate in-app notification for recipient
        Notification notification = Notification.builder()
                .id("notif-" + UUID.randomUUID().toString().substring(0, 8))
                .user(receiver)
                .title("New Travel Connect Request")
                .message(sender.getFullName() + " sent you a Travel Connect request" +
                        (destination != null ? " for " + destination.getDestinationName() : "") + ".")
                .category("BUDDY_REQUEST")
                .referenceLink("/travel-connect/requests")
                .createdAt(Instant.now())
                .build();
        notificationRepository.save(notification);

        return toRequestDto(saved);
    }

    @Transactional
    public ConnectionRequestDto acceptRequest(String requestId, String currentUserId) {
        TravelBuddyRequest request = travelBuddyRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Connection request not found: " + requestId));

        if (!request.getReceiver().getId().equals(currentUserId)) {
            throw new AccessDeniedException("Unauthorized: Only the recipient can accept this connection request");
        }

        request.setStatus("ACCEPTED");
        request.setUpdatedAt(Instant.now());
        TravelBuddyRequest saved = travelBuddyRequestRepository.save(request);

        // Notify sender that their request was accepted
        Notification notification = Notification.builder()
                .id("notif-" + UUID.randomUUID().toString().substring(0, 8))
                .user(request.getSender())
                .title("Travel Connect Request Accepted!")
                .message(request.getReceiver().getFullName() + " accepted your Travel Connect request. You can now chat together.")
                .category("BUDDY_REQUEST")
                .referenceLink("/travel-connect/connections")
                .createdAt(Instant.now())
                .build();
        notificationRepository.save(notification);

        return toRequestDto(saved);
    }

    @Transactional
    public ConnectionRequestDto rejectRequest(String requestId, String currentUserId) {
        TravelBuddyRequest request = travelBuddyRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Connection request not found: " + requestId));

        if (!request.getReceiver().getId().equals(currentUserId)) {
            throw new AccessDeniedException("Unauthorized: Only the recipient can reject this connection request");
        }

        request.setStatus("REJECTED");
        request.setUpdatedAt(Instant.now());
        return toRequestDto(travelBuddyRequestRepository.save(request));
    }

    @Transactional
    public ConnectionRequestDto cancelRequest(String requestId, String currentUserId) {
        TravelBuddyRequest request = travelBuddyRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Connection request not found: " + requestId));

        if (!request.getSender().getId().equals(currentUserId)) {
            throw new AccessDeniedException("Unauthorized: Only the sender can cancel this connection request");
        }

        request.setStatus("CANCELLED");
        request.setUpdatedAt(Instant.now());
        return toRequestDto(travelBuddyRequestRepository.save(request));
    }

    @Transactional
    public ConnectionRequestDto blockUser(String requestId, String currentUserId) {
        TravelBuddyRequest request = travelBuddyRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Connection request not found: " + requestId));

        if (!request.getReceiver().getId().equals(currentUserId) && !request.getSender().getId().equals(currentUserId)) {
            throw new AccessDeniedException("Unauthorized: You are not a participant in this request");
        }

        request.setStatus("BLOCKED");
        request.setUpdatedAt(Instant.now());
        return toRequestDto(travelBuddyRequestRepository.save(request));
    }

    public List<ConnectionRequestDto> getReceivedRequests(String currentUserId) {
        return travelBuddyRequestRepository.findByReceiverIdOrderByCreatedAtDesc(currentUserId).stream()
                .filter(r -> "PENDING".equals(r.getStatus()))
                .map(this::toRequestDto)
                .toList();
    }

    public List<ConnectionRequestDto> getSentRequests(String currentUserId) {
        return travelBuddyRequestRepository.findBySenderIdOrderByCreatedAtDesc(currentUserId).stream()
                .map(this::toRequestDto)
                .toList();
    }

    public List<ConnectionDto> getConnections(String currentUserId) {
        List<TravelBuddyRequest> connections = travelBuddyRequestRepository.findAcceptedConnectionsForUser(currentUserId);

        return connections.stream().map(c -> {
            User partner = c.getSender().getId().equals(currentUserId) ? c.getReceiver() : c.getSender();
            Profile profile = profileRepository.findById(partner.getId()).orElse(null);

            List<Message> msgs = messageRepository.findByConnectionIdOrderByCreatedAtAsc(c.getId());
            Message lastMsg = msgs.isEmpty() ? null : msgs.get(msgs.size() - 1);

            int unread = 0;
            for (Message m : msgs) {
                if (m.getReceiver().getId().equals(currentUserId) && m.getReadAt() == null) {
                    unread++;
                }
            }

            return ConnectionDto.builder()
                    .connectionId(c.getId())
                    .partnerId(partner.getId())
                    .partnerName(profile != null && profile.getDisplayName() != null ? profile.getDisplayName() : partner.getFullName())
                    .partnerAvatar(partner.getAvatarUrl() != null ? partner.getAvatarUrl() : (profile != null ? profile.getProfileImageUrl() : null))
                    .partnerBio(profile != null ? profile.getBio() : null)
                    .partnerTravelStyle(profile != null ? profile.getTravelStyle() : "Explorer")
                    .partnerLanguages(profile != null ? profile.getLanguages() : List.of("English"))
                    .partnerInterests(profile != null ? profile.getInterests() : List.of("Heritage", "Culture"))
                    .destinationId(c.getDestination() != null ? c.getDestination().getId() : null)
                    .destinationName(c.getDestination() != null ? c.getDestination().getDestinationName() : null)
                    .connectedSince(c.getUpdatedAt())
                    .lastMessage(lastMsg != null ? lastMsg.getMessage() : null)
                    .lastMessageAt(lastMsg != null ? lastMsg.getCreatedAt() : null)
                    .unreadCount(unread)
                    .build();
        }).toList();
    }

    @Transactional
    public List<MessageDto> getMessages(String connectionId, String currentUserId) {
        TravelBuddyRequest conn = travelBuddyRequestRepository.findAcceptedConnectionByIdAndUser(connectionId, currentUserId)
                .orElseThrow(() -> new AccessDeniedException("Not authorized to view messages for this connection"));

        List<Message> messages = messageRepository.findByConnectionIdOrderByCreatedAtAsc(connectionId);

        // Mark incoming messages as read
        for (Message m : messages) {
            if (m.getReceiver().getId().equals(currentUserId) && m.getReadAt() == null) {
                m.setReadAt(Instant.now());
                messageRepository.save(m);
            }
        }

        return messages.stream().map(m -> MessageDto.builder()
                .id(m.getId())
                .connectionId(m.getConnectionId())
                .senderId(m.getSender().getId())
                .senderName(m.getSender().getFullName())
                .receiverId(m.getReceiver().getId())
                .receiverName(m.getReceiver().getFullName())
                .message(m.getMessage())
                .createdAt(m.getCreatedAt())
                .readAt(m.getReadAt())
                .isMine(m.getSender().getId().equals(currentUserId))
                .build()
        ).toList();
    }

    @Transactional
    public MessageDto sendMessage(String connectionId, String senderId, String text) {
        TravelBuddyRequest conn = travelBuddyRequestRepository.findAcceptedConnectionByIdAndUser(connectionId, senderId)
                .orElseThrow(() -> new AccessDeniedException("Not authorized to send messages for this connection"));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));
        User receiver = conn.getSender().getId().equals(senderId) ? conn.getReceiver() : conn.getSender();

        Message msg = Message.builder()
                .id("msg-" + UUID.randomUUID().toString().substring(0, 8))
                .connectionId(connectionId)
                .sender(sender)
                .receiver(receiver)
                .message(text)
                .createdAt(Instant.now())
                .build();

        Message saved = messageRepository.save(msg);

        // Generate notification for receiver
        Notification notification = Notification.builder()
                .id("notif-" + UUID.randomUUID().toString().substring(0, 8))
                .user(receiver)
                .title("New Message from " + sender.getFullName())
                .message(text.length() > 60 ? text.substring(0, 57) + "..." : text)
                .category("BUDDY_REQUEST")
                .referenceLink("/travel-connect/connections")
                .createdAt(Instant.now())
                .build();
        notificationRepository.save(notification);

        return MessageDto.builder()
                .id(saved.getId())
                .connectionId(saved.getConnectionId())
                .senderId(saved.getSender().getId())
                .senderName(saved.getSender().getFullName())
                .receiverId(saved.getReceiver().getId())
                .receiverName(saved.getReceiver().getFullName())
                .message(saved.getMessage())
                .createdAt(saved.getCreatedAt())
                .readAt(saved.getReadAt())
                .isMine(true)
                .build();
    }

    public TravelConnectSettingsDto getSettings(String currentUserId) {
        Profile profile = profileRepository.findById(currentUserId).orElse(null);
        boolean enabled = profile == null || profile.isTravelConnectEnabled();
        int activeConnections = travelBuddyRequestRepository.findAcceptedConnectionsForUser(currentUserId).size();
        int pendingRequests = travelBuddyRequestRepository.findByReceiverIdOrderByCreatedAtDesc(currentUserId).stream()
                .filter(r -> "PENDING".equals(r.getStatus())).toList().size();

        return TravelConnectSettingsDto.builder()
                .travelConnectEnabled(enabled)
                .activeConnectionsCount(activeConnections)
                .pendingRequestsCount(pendingRequests)
                .build();
    }

    @Transactional
    public TravelConnectSettingsDto updateSettings(String currentUserId, boolean enabled) {
        Profile profile = profileRepository.findById(currentUserId).orElse(null);
        if (profile != null) {
            profile.setTravelConnectEnabled(enabled);
            profileRepository.save(profile);
        }
        return getSettings(currentUserId);
    }

    // =========================================================================
    // HELPER & DETERMINISTIC COMPATIBILITY ENGINE
    // =========================================================================

    private TravelerDiscoveryDto toDiscoveryDto(
            TravelBuddy buddy,
            String currentUserId,
            TravelBuddy viewerBuddy,
            Profile viewerProfile,
            String targetDestinationId,
            LocalDate targetFromDate,
            LocalDate targetToDate) {

        User user = buddy.getUser();
        Profile profile = user != null ? profileRepository.findById(user.getId()).orElse(null) : null;

        String displayName = profile != null && profile.getDisplayName() != null
                ? profile.getDisplayName()
                : (user != null ? user.getFullName() : "Sample Traveler");

        String avatar = user != null && user.getAvatarUrl() != null
                ? user.getAvatarUrl()
                : (profile != null ? profile.getProfileImageUrl() : null);

        String bio = profile != null && profile.getBio() != null
                ? profile.getBio()
                : (buddy.getNotes() != null ? buddy.getNotes() : "Exploring incredible destinations across India.");

        // Resolve Connection Status
        String status = "NONE";
        String connectionId = null;
        if (currentUserId != null && user != null && !currentUserId.equals(user.getId())) {
            List<TravelBuddyRequest> reqs = travelBuddyRequestRepository.findActiveRequestsBetween(currentUserId, user.getId());
            if (!reqs.isEmpty()) {
                TravelBuddyRequest r = reqs.get(0);
                status = resolveStatusForViewer(r, currentUserId);
                connectionId = r.getId();
            }
        }

        // Calculate Deterministic Compatibility Score
        int matchScore = 0;
        List<String> matchReasons = new ArrayList<>();

        // 1. Destination Match (40%)
        boolean sameDest = false;
        if (targetDestinationId != null && buddy.getDestination() != null && targetDestinationId.equals(buddy.getDestination().getId())) {
            sameDest = true;
        } else if (viewerBuddy != null && viewerBuddy.getDestination() != null && buddy.getDestination() != null
                && viewerBuddy.getDestination().getId().equals(buddy.getDestination().getId())) {
            sameDest = true;
        }

        if (sameDest) {
            matchScore += 40;
            matchReasons.add("Same destination");
        } else if (targetDestinationId != null || (viewerBuddy != null && viewerBuddy.getDestination() != null)) {
            matchScore += 10;
        } else {
            matchScore += 30; // Baseline when no destination filter selected
            matchReasons.add("Destination explorer");
        }

        // 2. Dates Overlap (25%)
        LocalDate vStart = targetFromDate != null ? targetFromDate : (viewerBuddy != null ? viewerBuddy.getTravelDate() : null);
        LocalDate vEnd = targetToDate != null ? targetToDate : (viewerBuddy != null ? viewerBuddy.getEndDate() : null);
        LocalDate bStart = buddy.getTravelDate();
        LocalDate bEnd = buddy.getEndDate() != null ? buddy.getEndDate() : bStart.plusDays(4);

        if (vStart != null && vEnd != null) {
            if (!bStart.isAfter(vEnd) && !bEnd.isBefore(vStart)) {
                matchScore += 25;
                matchReasons.add("Dates overlap");
            } else if (buddy.isFlexibleDates()) {
                matchScore += 18;
                matchReasons.add("Flexible dates");
            } else {
                matchScore += 8;
            }
        } else if (buddy.isFlexibleDates()) {
            matchScore += 22;
            matchReasons.add("Flexible travel dates");
        } else {
            matchScore += 15;
        }

        // 3. Shared Interests (15%)
        List<String> viewerInterests = viewerProfile != null && viewerProfile.getInterests() != null
                ? viewerProfile.getInterests()
                : (viewerBuddy != null && viewerBuddy.getInterests() != null ? viewerBuddy.getInterests() : List.of("Heritage", "Culture"));

        List<String> sharedInterests = new ArrayList<>(buddy.getInterests());
        sharedInterests.retainAll(viewerInterests);

        if (!sharedInterests.isEmpty()) {
            matchScore += 15;
            matchReasons.add("Shared: " + String.join(", ", sharedInterests.subList(0, Math.min(2, sharedInterests.size()))));
        } else {
            matchScore += 8;
        }

        // 4. Travel Style (10%)
        String viewerStyle = viewerProfile != null && viewerProfile.getTravelStyle() != null
                ? viewerProfile.getTravelStyle()
                : (viewerBuddy != null ? viewerBuddy.getTravelStyle() : "Explorer");

        if (buddy.getTravelStyle().equalsIgnoreCase(viewerStyle)) {
            matchScore += 10;
            matchReasons.add("Matching travel style: " + buddy.getTravelStyle());
        } else {
            matchScore += 5;
        }

        // 5. Shared Languages (10%)
        List<String> viewerLangs = viewerProfile != null && viewerProfile.getLanguages() != null
                ? viewerProfile.getLanguages()
                : List.of("English", "Hindi");

        List<String> sharedLangs = new ArrayList<>(buddy.getLanguages());
        sharedLangs.retainAll(viewerLangs);

        if (!sharedLangs.isEmpty()) {
            matchScore += 10;
            matchReasons.add("Language: " + sharedLangs.get(0));
        } else {
            matchScore += 5;
        }

        // Clamp between 45 and 98
        matchScore = Math.min(98, Math.max(45, matchScore));

        return TravelerDiscoveryDto.builder()
                .id(buddy.getId())
                .travelerId(user != null ? user.getId() : "user-" + buddy.getId())
                .displayName(displayName)
                .profileImage(avatar)
                .bio(bio)
                .destinationId(buddy.getDestination() != null ? buddy.getDestination().getId() : null)
                .destinationName(buddy.getDestination() != null ? buddy.getDestination().getDestinationName() : buddy.getDestinationCity())
                .destinationCity(buddy.getDestinationCity())
                .travelDate(buddy.getTravelDate())
                .endDate(buddy.getEndDate())
                .flexibleDates(buddy.isFlexibleDates())
                .budgetInr(buddy.getBudgetInr())
                .groupSize(buddy.getGroupSize())
                .travelStyle(buddy.getTravelStyle())
                .interests(buddy.getInterests())
                .languages(buddy.getLanguages())
                .isDemoData(buddy.isDemoData())
                .connectionStatus(status)
                .connectionId(connectionId)
                .matchScore(matchScore)
                .matchReasons(matchReasons)
                .build();
    }

    private String resolveStatusForViewer(TravelBuddyRequest r, String currentUserId) {
        if ("ACCEPTED".equals(r.getStatus())) return "CONNECTED";
        if ("BLOCKED".equals(r.getStatus())) return "BLOCKED";
        if ("PENDING".equals(r.getStatus())) {
            return r.getSender().getId().equals(currentUserId) ? "PENDING_SENT" : "PENDING_RECEIVED";
        }
        return "NONE";
    }

    private ConnectionRequestDto toRequestDto(TravelBuddyRequest r) {
        return ConnectionRequestDto.builder()
                .id(r.getId())
                .senderId(r.getSender().getId())
                .senderName(r.getSender().getFullName())
                .senderAvatar(r.getSender().getAvatarUrl())
                .senderTravelStyle("Explorer")
                .receiverId(r.getReceiver().getId())
                .receiverName(r.getReceiver().getFullName())
                .receiverAvatar(r.getReceiver().getAvatarUrl())
                .destinationId(r.getDestination() != null ? r.getDestination().getId() : null)
                .destinationName(r.getDestination() != null ? r.getDestination().getDestinationName() : null)
                .status(r.getStatus())
                .message(r.getMessage())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
