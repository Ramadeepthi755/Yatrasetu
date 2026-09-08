package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingMessageDto {
    private String id;
    private String bookingId;
    private String senderId;
    private String senderName;
    private String senderRole;
    private String receiverId;
    private String receiverName;
    private String message;
    private Boolean isRead;
    private Instant createdAt;
}
