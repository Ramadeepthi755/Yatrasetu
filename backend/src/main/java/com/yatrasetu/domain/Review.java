package com.yatrasetu.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "entity_type", length = 30, nullable = false)
    private String entityType; // DESTINATION, HOTEL, LOCAL_HOST, EXPERIENCE

    @Column(name = "entity_id", length = 50, nullable = false)
    private String entityId;

    @Column(name = "booking_id", length = 50)
    private String bookingId;

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "review_text", columnDefinition = "TEXT", nullable = false)
    private String reviewText;

    @Column(name = "is_verified_booking")
    @Builder.Default
    private Boolean isVerifiedBooking = false;

    @Column(name = "is_imported_dataset")
    @Builder.Default
    private Boolean isImportedDataset = false;

    @Column(name = "sentiment_category", length = 50)
    private String sentimentCategory;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
