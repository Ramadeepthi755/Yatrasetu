package com.yatrasetu.web.dto.intelligence;

import com.yatrasetu.domain.intelligence.GovernmentActionPriority;
import com.yatrasetu.domain.intelligence.GovernmentActionStatus;
import com.yatrasetu.domain.intelligence.GovernmentActionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GovernmentActionResponseDto {
    private String id;
    private String destinationId;
    private String destinationName;
    private String stateName;
    private String recommendationId;
    private GovernmentActionType actionType;
    private String title;
    private String notes;
    private GovernmentActionStatus status;
    private GovernmentActionPriority priority;
    private String resolutionNotes;
    private Instant resolvedAt;
    private String userFullName;
    private Instant createdAt;
}
