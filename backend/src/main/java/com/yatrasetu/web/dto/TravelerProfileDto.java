package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelerProfileDto {
    private String id;
    private String displayName;
    private String avatarUrl;
    private String homeCity;
    private String city;
    private String state;
    private String bio;
    private String travelStyle;
    private String budgetPreference;

    @Builder.Default
    private List<String> languages = new ArrayList<>();

    @Builder.Default
    private List<String> interests = new ArrayList<>();

    private boolean isDemoData;
    private boolean travelConnectEnabled;
    private String connectionStatus; // NONE, PENDING_SENT, PENDING_RECEIVED, CONNECTED, BLOCKED
    private String connectionId;

    @Builder.Default
    private List<TravelerDiscoveryDto> upcomingTrips = new ArrayList<>();
}
