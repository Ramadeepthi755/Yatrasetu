package com.yatrasetu.web.dto;

import com.yatrasetu.domain.PartnerSubtype;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePartnerProfileRequest {
    @Size(max = 150, message = "Full name cannot exceed 150 characters")
    private String fullName;

    @Size(max = 200, message = "Business name cannot exceed 200 characters")
    private String businessName;

    private PartnerSubtype partnerSubtype;

    @Size(max = 2000, message = "Bio cannot exceed 2000 characters")
    private String bio;

    private String phone;
    private String city;
    private String state;
    private List<String> languages;
    private List<String> partnerSkills;
    private String profileImageUrl;
}
