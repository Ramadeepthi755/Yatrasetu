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
public class MessageDto {
    private String id;
    private String connectionId;
    private String senderId;
    private String senderName;
    private String receiverId;
    private String receiverName;
    private String message;
    private Instant createdAt;
    private Instant readAt;
    private boolean isMine;
}
