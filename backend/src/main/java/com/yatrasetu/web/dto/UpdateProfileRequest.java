package com.yatrasetu.web.dto;

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
public class UpdateProfileRequest {
    @Size(max = 150, message = "Full name cannot exceed 150 characters")
    private String fullName;

    @Size(max = 150, message = "Display name cannot exceed 150 characters")
    private String displayName;

    @Size(max = 1000, message = "Bio cannot exceed 1000 characters")
    private String bio;

    private String phone;
    private String city;
    private String state;
    private String preferredLanguage;
    private List<String> languages;
    private List<String> interests;
    private String travelStyle;
    private String budgetPreference;
    private String profileImageUrl;
}
