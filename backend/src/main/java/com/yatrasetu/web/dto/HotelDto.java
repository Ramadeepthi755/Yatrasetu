package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelDto {
    private String id;
    private String hotelName;
    private String ownerId;
    private String ownerName;
    private String cityId;
    private String cityName;
    private String stateId;
    private String stateName;
    private String destinationId;
    private String destinationName;
    private BigDecimal hotelRating;
    private BigDecimal pricePerNight;
    private List<String> amenities;
    private String category;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Boolean isPartnerProperty;
    private String inventoryType;
    private String sourceType;
    private String sourceLabel;
    private String verificationStatus;
    private String bookabilityStatus;
    private String verificationNotes;
    private String verifiedBy;
    private Instant verifiedAt;
    private String rejectionReason;
    private String contactPhone;
    private String contactEmail;
    private String officialWebsite;
    private String checkInTime;
    private String checkOutTime;
    private Boolean isDemoData;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;
}
