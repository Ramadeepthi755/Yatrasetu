package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RentalProviderDto {
    private String id;
    private String destinationId;
    private String providerName;
    private String vehicleTypes;
    private String address;
    private Boolean isVerified;
    private String sourceType;
    private String sourceLabel;
    private String phone;
    private String website;
}
