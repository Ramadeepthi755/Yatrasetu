package com.yatrasetu.web.dto;

import com.yatrasetu.domain.HotelAvailabilityStatus;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelAvailabilityDto {

    private String hotelId;
    private String hotelName;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private Integer totalNights;
    private Boolean isPartnerProperty;
    private Boolean isLiveAvailability;
    private HotelAvailabilityStatus status;
    private String provenance;
    private String note;

    @Builder.Default
    private List<RoomTypeAvailabilityDto> rooms = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomTypeAvailabilityDto {
        private String roomTypeId;
        private String roomTypeName;
        private String description;
        private Integer maxOccupancy;
        private String bedConfiguration;
        private Integer roomSizeSqft;
        private List<String> amenities;
        private Boolean isAccessible;
        private Integer baseInventoryUnits;
        private HotelAvailabilityStatus status;
        private Boolean isAvailable;
        private Integer availableUnits;

        @Builder.Default
        private List<NightlyAvailabilityDto> nightly = new ArrayList<>();

        @Builder.Default
        private List<HotelRatePlanDto> ratePlans = new ArrayList<>();

        private String provenance;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NightlyAvailabilityDto {
        private LocalDate date;
        private Integer totalUnits;
        private Integer blockedUnits;
        private Integer availableUnits;
        private Boolean isDateOverride;
    }
}
