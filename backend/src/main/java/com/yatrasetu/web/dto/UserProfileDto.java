package com.yatrasetu.web.dto;

import com.yatrasetu.domain.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private String id;
    private String email;
    private String fullName;
    private String displayName;
    private Role role;
    private String avatarUrl;
    private String bio;
    private String phone;
    private String city;
    private String state;
    private String preferredLanguage;
    private List<String> languages;
    private List<String> interests;
    private String travelStyle;
    private String budgetPreference;
    private boolean verified;
}
