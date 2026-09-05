package com.yatrasetu.domain.intelligence;

import com.yatrasetu.domain.Destination;
import com.yatrasetu.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "tourism_government_actions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TourismGovernmentAction {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id")
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.SET_NULL)
    private Destination destination;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recommendation_id")
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.SET_NULL)
    private TourismRedistributionRecommendation recommendation;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", length = 50, nullable = false)
    private GovernmentActionType actionType;

    @Column(name = "title", length = 200, nullable = false)
    private String title;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    private GovernmentActionStatus status = GovernmentActionStatus.LOGGED;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", length = 20, nullable = false)
    @Builder.Default
    private GovernmentActionPriority priority = GovernmentActionPriority.MEDIUM;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
