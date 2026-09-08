package com.yatrasetu.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDto {
    private String id;
    private String userName;
    private String userAvatar;
    private String entityType;
    private String entityId;
    private Integer rating;
    private String reviewText;
    private Boolean isVerifiedBooking;
    private Boolean isImportedDataset;
    private String sentimentCategory;
    private Instant createdAt;
}
