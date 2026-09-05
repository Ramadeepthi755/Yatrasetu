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
public class ConnectionRequestDto {
    private String id;
    private String senderId;
    private String senderName;
    private String senderAvatar;
    private String senderTravelStyle;
    private String receiverId;
    private String receiverName;
    private String receiverAvatar;
    private String destinationId;
    private String destinationName;
    private String status;
    private String message;
    private Instant createdAt;
    private Instant updatedAt;
}
