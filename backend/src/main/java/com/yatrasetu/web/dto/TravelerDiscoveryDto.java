package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelerDiscoveryDto {
    private String id;
    private String travelerId;
    private String displayName;
    private String profileImage;
    private String bio;
    private String destinationId;
    private String destinationName;
    private String destinationCity;
    private LocalDate travelDate;
    private LocalDate endDate;
    private boolean flexibleDates;
    private BigDecimal budgetInr;
    private Integer groupSize;
    private String travelStyle;

    @Builder.Default
    private List<String> interests = new ArrayList<>();

    @Builder.Default
    private List<String> languages = new ArrayList<>();

    private boolean isDemoData;
    private String connectionStatus; // NONE, PENDING_SENT, PENDING_RECEIVED, CONNECTED, BLOCKED
    private String connectionId;
    private int matchScore;

    @Builder.Default
    private List<String> matchReasons = new ArrayList<>();
}
