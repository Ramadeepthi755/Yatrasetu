package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelAgencyDto {
    private String id;
    private String destinationId;
    private String agencyName;
    private String licenseNumber;
    private String address;
    private String servicesOffered;
    private BigDecimal rating;
    private Boolean isVerified;
    private String sourceType;
    private String sourceLabel;
    private String phone;
    private String website;
}
