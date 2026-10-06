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
public class TripCheckinDto {
    private String id;
    private String bookingId;
    private String checkpointName;
    private String checkpointType; // START, MIDPOINT, CHECKPOINT, COMPLETION
    private String status; // PENDING, COMPLETED, MISSED, ESCALATED
    private Instant scheduledTime;
    private Instant checkedInAt;
    private String notes;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Instant createdAt;
}
