package com.yatrasetu.web.dto.intelligence;

import com.yatrasetu.domain.intelligence.GovernmentActionPriority;
import com.yatrasetu.domain.intelligence.GovernmentActionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GovernmentActionRequest {
    private String destinationId;
    private String recommendationId;
    private GovernmentActionType actionType;
    private String title;
    private String notes;
    private GovernmentActionPriority priority;
}
