package com.yatrasetu.web.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuideReviewRequest {
    @NotNull
    private String decision; // VERIFIED or REJECTED or APPROVED
    private String reviewerNotes;
}
