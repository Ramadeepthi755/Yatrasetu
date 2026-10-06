package com.yatrasetu.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoomTypeRequest {

    @NotBlank(message = "Room type name is required")
    private String roomTypeName;

    private String description;

    @NotNull(message = "Max occupancy is required")
    @Min(value = 1, message = "Max occupancy must be at least 1")
    @Builder.Default
    private Integer maxOccupancy = 2;

    private String bedConfiguration;

    private Integer roomSizeSqft;

    @Builder.Default
    private List<String> amenities = new ArrayList<>();

    @Builder.Default
    private Boolean isAccessible = false;

    @NotNull(message = "Base inventory units is required")
    @Min(value = 0, message = "Base inventory units cannot be negative")
    @Builder.Default
    private Integer baseInventoryUnits = 1;

    @Builder.Default
    private Boolean isActive = true;
}
