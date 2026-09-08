package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelRoomTypeDto {

    private String id;
    private String hotelId;
    private String hotelName;
    private String roomTypeName;
    private String description;
    private Integer maxOccupancy;
    private String bedConfiguration;
    private Integer roomSizeSqft;
    @Builder.Default
    private List<String> amenities = new ArrayList<>();
    private Boolean isAccessible;
    private Integer baseInventoryUnits;
    private String sourceType;
    private Boolean isActive;
    private Boolean isDemoData;
    private Instant createdAt;
    private Instant updatedAt;
}
