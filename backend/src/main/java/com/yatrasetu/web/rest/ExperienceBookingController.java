package com.yatrasetu.web.rest;

import com.yatrasetu.config.UserPrincipal;
import com.yatrasetu.service.ExperienceBookingService;
import com.yatrasetu.web.dto.*;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings/experience")
@RequiredArgsConstructor
public class ExperienceBookingController {

    private final ExperienceBookingService bookingService;

    @PostMapping
    public ResponseEntity<ApiResponse<ExperienceBookingDto>> createBooking(
            @Valid @RequestBody CreateExperienceBookingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<ExperienceBookingDto>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        ExperienceBookingDto created = bookingService.createBooking(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Experience booking request created successfully", created));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExperienceBookingDto>>> getMyBookings(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<List<ExperienceBookingDto>>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        List<ExperienceBookingDto> bookings = bookingService.getTouristBookings(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.ok("Retrieved tourist experience bookings", bookings));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExperienceBookingDto>> getBookingById(
            @PathVariable("id") String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<ExperienceBookingDto>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        ExperienceBookingDto booking = bookingService.getBookingById(id, principal);
        return ResponseEntity.ok(ApiResponse.ok("Retrieved booking details", booking));
    }

    @Data
    public static class PaymentVerificationRequest {
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String razorpaySignature;
    }

    @PostMapping("/{id}/payment/order")
    public ResponseEntity<ApiResponse<com.yatrasetu.web.dto.payment.CreatePaymentOrderResponse>> createPaymentOrder(
            @PathVariable("id") String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<com.yatrasetu.web.dto.payment.CreatePaymentOrderResponse>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        com.yatrasetu.web.dto.payment.CreatePaymentOrderResponse order = bookingService.createPaymentOrder(id, principal);
        return ResponseEntity.ok(ApiResponse.ok("Payment order generated", order));
    }

    @PostMapping("/{id}/payment")
    public ResponseEntity<ApiResponse<ExperienceBookingDto>> confirmPayment(
            @PathVariable("id") String id,
            @RequestBody PaymentVerificationRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<ExperienceBookingDto>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        ExperienceBookingDto confirmed = bookingService.confirmPayment(
                id, request.getRazorpayOrderId(), request.getRazorpayPaymentId(), request.getRazorpaySignature(), principal);
        return ResponseEntity.ok(ApiResponse.ok("Payment verified and booking confirmed", confirmed));
    }

    @PostMapping("/{id}/payment/cash")
    public ResponseEntity<ApiResponse<ExperienceBookingDto>> selectCashPayment(
            @PathVariable("id") String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<ExperienceBookingDto>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        ExperienceBookingDto confirmed = bookingService.selectCashPayment(id, principal);
        return ResponseEntity.ok(ApiResponse.ok("Cash payment selected with two 50% milestone tracking points", confirmed));
    }

    @PostMapping("/{id}/payment/cash/milestone/{milestoneNumber}")
    public ResponseEntity<ApiResponse<ExperienceBookingDto>> recordCashMilestone(
            @PathVariable("id") String id,
            @PathVariable("milestoneNumber") int milestoneNumber,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<ExperienceBookingDto>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        ExperienceBookingDto updated = bookingService.recordCashMilestone(id, milestoneNumber, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.ok("Cash milestone " + milestoneNumber + " recorded successfully", updated));
    }

    @Data
    public static class CheckinRequest {
        private String checkpointId;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private String notes;
    }

    @PostMapping("/{id}/safety/checkin")
    public ResponseEntity<ApiResponse<TripCheckinDto>> completeCheckin(
            @PathVariable("id") String id,
            @RequestBody CheckinRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<TripCheckinDto>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        TripCheckinDto checkin = bookingService.completeCheckin(
                id, request.getCheckpointId(), request.getLatitude(), request.getLongitude(), request.getNotes(), principal);
        return ResponseEntity.ok(ApiResponse.ok("Trip checkpoint completed successfully", checkin));
    }

    @Data
    public static class SosRequest {
        private String details;
        private BigDecimal latitude;
        private BigDecimal longitude;
    }

    @PostMapping("/{id}/safety/sos")
    public ResponseEntity<ApiResponse<TripSafetyIncidentDto>> triggerSos(
            @PathVariable("id") String id,
            @RequestBody SosRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<TripSafetyIncidentDto>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        TripSafetyIncidentDto incident = bookingService.triggerSos(
                id, request.getDetails(), request.getLatitude(), request.getLongitude(), principal);
        return ResponseEntity.ok(ApiResponse.ok("Emergency SOS alert recorded and emergency protocols triggered", incident));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<ExperienceBookingDto>> acceptBooking(
            @PathVariable("id") String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<ExperienceBookingDto>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        ExperienceBookingDto accepted = bookingService.acceptBooking(id, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.ok("Booking accepted by guide", accepted));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<ExperienceBookingDto>> rejectBooking(
            @PathVariable("id") String id,
            @RequestParam(value = "reason", required = false) String reason,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<ExperienceBookingDto>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        ExperienceBookingDto rejected = bookingService.rejectBooking(id, principal.getUserId(), reason);
        return ResponseEntity.ok(ApiResponse.ok("Booking rejected", rejected));
    }

    @PostMapping("/{id}/partner-complete")
    public ResponseEntity<ApiResponse<ExperienceBookingDto>> partnerComplete(
            @PathVariable("id") String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<ExperienceBookingDto>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        ExperienceBookingDto pending = bookingService.markTripCompletionByPartner(id, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.ok("Trip marked as completed by provider. Awaiting tourist confirmation.", pending));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<ExperienceBookingDto>> confirmCompletion(
            @PathVariable("id") String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<ExperienceBookingDto>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        ExperienceBookingDto completed = bookingService.confirmTripCompletion(id, principal);
        return ResponseEntity.ok(ApiResponse.ok("Trip completion confirmed by tourist", completed));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<ApiResponse<ExperienceBookingDto>> submitReview(
            @PathVariable("id") String id,
            @Valid @RequestBody ExperienceReviewRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<ExperienceBookingDto>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        ExperienceBookingDto reviewed = bookingService.submitReview(id, request, principal);
        return ResponseEntity.ok(ApiResponse.ok("Review submitted and reputation updated", reviewed));
    }

    @PostMapping("/{id}/dispute")
    public ResponseEntity<ApiResponse<ExperienceBookingDto>> raiseDispute(
            @PathVariable("id") String id,
            @Valid @RequestBody BookingDisputeRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<ExperienceBookingDto>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        ExperienceBookingDto disputed = bookingService.raiseDispute(id, request, principal);
        return ResponseEntity.ok(ApiResponse.ok("Dispute registered for administrative resolution", disputed));
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<List<BookingMessageDto>>> getBookingMessages(
            @PathVariable("id") String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<List<BookingMessageDto>>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        List<BookingMessageDto> messages = bookingService.getBookingMessages(id, principal);
        return ResponseEntity.ok(ApiResponse.ok("Retrieved trip conversation messages", messages));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<BookingMessageDto>> sendBookingMessage(
            @PathVariable("id") String id,
            @Valid @RequestBody SendBookingMessageRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<BookingMessageDto>builder().success(false).message("Authentication required").timestamp(Instant.now()).build());
        }

        BookingMessageDto sent = bookingService.sendBookingMessage(id, request, principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Trip message sent successfully", sent));
    }
}
