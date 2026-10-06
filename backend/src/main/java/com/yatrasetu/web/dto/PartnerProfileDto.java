package com.yatrasetu.web.dto;

import com.yatrasetu.domain.PartnerSubtype;
import com.yatrasetu.domain.Role;
import com.yatrasetu.domain.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartnerProfileDto {
    private String id;
    private String email;
    private String fullName;
    private String businessName;
    private Role role;
    private PartnerSubtype partnerSubtype;
    private String avatarUrl;
    private String bio;
    private String phone;
    private String city;
    private String state;
    private List<String> languages;
    private List<String> partnerSkills;
    private VerificationStatus verificationStatus;
    private boolean verified;
}
