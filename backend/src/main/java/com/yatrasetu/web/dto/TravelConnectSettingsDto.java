package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelConnectSettingsDto {
    private boolean travelConnectEnabled;
    private int activeConnectionsCount;
    private int pendingRequestsCount;
}
