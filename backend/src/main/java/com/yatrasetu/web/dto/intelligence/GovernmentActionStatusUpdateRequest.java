package com.yatrasetu.web.dto.intelligence;

import com.yatrasetu.domain.intelligence.GovernmentActionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GovernmentActionStatusUpdateRequest {
    private GovernmentActionStatus status;
    private String resolutionNotes;
}
