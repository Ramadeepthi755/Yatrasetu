package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripSafetyIncidentDto {
    private String id;
    private String bookingId;
    private String userId;
    private String userName;
    private String incidentType; // SOS, MISSED_CHECKIN, ROUTE_DEVIATION, REPORTED_ISSUE
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL
    private String status; // REPORTED, ACKNOWLEDGED, RESOLVED
    private String details;
    private Boolean emergencyContactNotified;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Instant createdAt;
    private Instant resolvedAt;
}
