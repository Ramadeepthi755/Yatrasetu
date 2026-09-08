package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExperienceReviewDto {
    private String id;
    private String bookingId;
    private String experienceId;
    private String experienceTitle;
    private String hostId;
    private String hostName;
    private String userId;
    private String userName;
    private String userAvatarUrl;
    private BigDecimal rating;
    private String title;
    private String comment;
    private Boolean verifiedTrip;
    private Instant createdAt;
}
