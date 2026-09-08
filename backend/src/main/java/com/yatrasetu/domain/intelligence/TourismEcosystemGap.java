package com.yatrasetu.domain.intelligence;

import com.yatrasetu.domain.Destination;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "tourism_ecosystem_gaps", uniqueConstraints = {
        @UniqueConstraint(name = "uq_dest_gap", columnNames = {"destination_id", "gap_type"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TourismEcosystemGap {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Destination destination;

    @Enumerated(EnumType.STRING)
    @Column(name = "gap_type", length = 50, nullable = false)
    private EcosystemGapType gapType;

    @Column(name = "severity", length = 20, nullable = false)
    @Builder.Default
    private String severity = "MEDIUM"; // HIGH, MEDIUM, LOW

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "suggested_intervention", columnDefinition = "TEXT", nullable = false)
    private String suggested_intervention;

    @Column(name = "detected_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant detectedAt = Instant.now();
}
