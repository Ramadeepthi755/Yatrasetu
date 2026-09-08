package com.yatrasetu.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkInventoryUpdateRequest {

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Total units is required")
    @Min(value = 0, message = "Total units cannot be negative")
    private Integer totalUnits;

    @Min(value = 0, message = "Blocked units cannot be negative")
    @Builder.Default
    private Integer blockedUnits = 0;
}
