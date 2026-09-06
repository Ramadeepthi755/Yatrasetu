package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelInventoryDto {

    private String id;
    private String roomTypeId;
    private String roomTypeName;
    private String hotelId;
    private LocalDate inventoryDate;
    private Integer totalUnits;
    private Integer blockedUnits;
    private String sourceType;
    private Instant createdAt;
    private Instant updatedAt;
}
