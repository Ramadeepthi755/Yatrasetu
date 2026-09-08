package com.yatrasetu.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateInventoryRequest {

    private LocalDate inventoryDate;

    @NotNull(message = "Total units is required")
    @Min(value = 0, message = "Total units cannot be negative")
    private Integer totalUnits;

    @Min(value = 0, message = "Blocked units cannot be negative")
    @Builder.Default
    private Integer blockedUnits = 0;
}
