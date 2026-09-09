package com.yatrasetu.web.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRoomTypeRequest {

    private String roomTypeName;

    private String description;

    @Min(value = 1, message = "Max occupancy must be at least 1")
    private Integer maxOccupancy;

    private String bedConfiguration;

    private Integer roomSizeSqft;

    private List<String> amenities;

    private Boolean isAccessible;

    @Min(value = 0, message = "Base inventory units cannot be negative")
    private Integer baseInventoryUnits;

    private Boolean isActive;
}
