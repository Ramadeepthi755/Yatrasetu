package com.yatrasetu.web.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateHotelBookingRequest {

    @NotBlank(message = "Room type ID is required")
    private String roomTypeId;

    @NotBlank(message = "Rate plan ID is required")
    private String ratePlanId;

    @NotNull(message = "Check-in date is required")
    private LocalDate checkIn;

    @NotNull(message = "Check-out date is required")
    private LocalDate checkOut;

    @NotNull(message = "Number of rooms is required")
    @Min(value = 1, message = "Must book at least 1 room")
    @Max(value = 20, message = "Cannot book more than 20 rooms in a single booking")
    @Builder.Default
    private Integer numberOfRooms = 1;

    @NotNull(message = "Adult count is required")
    @Min(value = 1, message = "Must have at least 1 adult")
    @Max(value = 50, message = "Adult count cannot exceed 50")
    @Builder.Default
    private Integer adults = 1;

    @Min(value = 0, message = "Child count cannot be negative")
    @Max(value = 50, message = "Child count cannot exceed 50")
    @Builder.Default
    private Integer children = 0;

    @NotBlank(message = "Guest name is required")
    @Size(max = 150, message = "Guest name cannot exceed 150 characters")
    private String guestName;

    @NotBlank(message = "Guest email is required")
    @Email(message = "Invalid guest email format")
    @Size(max = 150, message = "Guest email cannot exceed 150 characters")
    private String guestEmail;

    @NotBlank(message = "Guest phone is required")
    @Size(min = 7, max = 50, message = "Guest phone must be between 7 and 50 characters")
    private String guestPhone;

    @Size(max = 2000, message = "Special requests cannot exceed 2000 characters")
    private String specialRequests;

    @Size(max = 100, message = "Idempotency key cannot exceed 100 characters")
    private String idempotencyKey;

    private String paymentMethod; // ONLINE, PAY_AT_HOTEL
}
