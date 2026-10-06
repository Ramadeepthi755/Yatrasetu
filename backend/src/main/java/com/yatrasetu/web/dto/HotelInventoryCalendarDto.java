package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelInventoryCalendarDto {
    private LocalDate date;
    private String roomTypeId;
    private String roomTypeName;
    private int totalUnits;
    private int blockedUnits;
    private int reservedUnits;
    private int availableUnits;
    private Boolean isDateSpecific;
}
