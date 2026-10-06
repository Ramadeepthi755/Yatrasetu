package com.yatrasetu.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "hotel_rate_plans")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelRatePlan {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_type_id", nullable = false)
    private HotelRoomType roomType;

    @Column(name = "plan_name", length = 150, nullable = false)
    private String planName;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_plan", length = 50, nullable = false)
    @Builder.Default
    private MealPlan mealPlan = MealPlan.EP;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "base_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal basePrice;

    @Column(name = "currency", length = 10, nullable = false)
    @Builder.Default
    private String currency = "INR";

    @Column(name = "price_unit", length = 50, nullable = false)
    @Builder.Default
    private String priceUnit = "PER_NIGHT";

    @Column(name = "valid_from")
    private LocalDate validFrom;

    @Column(name = "valid_to")
    private LocalDate validTo;

    @Enumerated(EnumType.STRING)
    @Column(name = "cancellation_policy", length = 50, nullable = false)
    @Builder.Default
    private CancellationPolicyType cancellationPolicy = CancellationPolicyType.FREE_CANCELLATION;

    @Column(name = "cancellation_deadline_hours", nullable = false)
    @Builder.Default
    private Integer cancellationDeadlineHours = 24;

    @Enumerated(EnumType.STRING)
    @Column(name = "cancellation_fee_type", length = 50, nullable = false)
    @Builder.Default
    private CancellationFeeType cancellationFeeType = CancellationFeeType.NONE;

    @Column(name = "cancellation_fee_value", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal cancellationFeeValue = BigDecimal.ZERO;

    @Column(name = "taxes_included", nullable = false)
    @Builder.Default
    private Boolean taxesIncluded = false;

    @Column(name = "fees_included", nullable = false)
    @Builder.Default
    private Boolean feesIncluded = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", length = 50, nullable = false)
    @Builder.Default
    private SourceType sourceType = SourceType.PARTNER_SUBMITTED;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50, nullable = false)
    @Builder.Default
    private RatePlanStatus status = RatePlanStatus.ACTIVE;

    @Column(name = "is_demo_data", nullable = false)
    @Builder.Default
    private Boolean isDemoData = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
