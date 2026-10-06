package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConnectionDto {
    private String connectionId;
    private String partnerId;
    private String partnerName;
    private String partnerAvatar;
    private String partnerBio;
    private String partnerTravelStyle;

    @Builder.Default
    private List<String> partnerLanguages = new ArrayList<>();

    @Builder.Default
    private List<String> partnerInterests = new ArrayList<>();

    private String destinationId;
    private String destinationName;
    private Instant connectedSince;
    private String lastMessage;
    private Instant lastMessageAt;
    private int unreadCount;
}
