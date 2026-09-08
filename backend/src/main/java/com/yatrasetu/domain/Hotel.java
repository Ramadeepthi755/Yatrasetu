package com.yatrasetu.domain;

import com.yatrasetu.domain.converter.StringListConverter;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hotels")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Hotel {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "hotel_name", length = 200, nullable = false)
    private String hotelName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id")
    private City city;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id")
    private Destination destination;

    @Column(name = "hotel_rating", precision = 3, scale = 1)
    @Builder.Default
    private BigDecimal hotelRating = BigDecimal.valueOf(4.0);

    @Column(name = "price_per_night", precision = 10, scale = 2, nullable = false)
    private BigDecimal pricePerNight;

    @Convert(converter = StringListConverter.class)
    @Column(name = "amenities", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> amenities = new ArrayList<>();

    @Column(name = "category", length = 50)
    @Builder.Default
    private String category = "Mid-Range";

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "is_partner_property")
    @Builder.Default
    private Boolean isPartnerProperty = false;

    @Column(name = "inventory_type", length = 50)
    @Builder.Default
    private String inventoryType = "DATASET_PROPERTY";

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", length = 50)
    @Builder.Default
    private SourceType sourceType = SourceType.DATASET;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", length = 30, nullable = false)
    @Builder.Default
    private HotelVerificationStatus verificationStatus = HotelVerificationStatus.UNVERIFIED;

    @Column(name = "verification_notes", columnDefinition = "TEXT")
    private String verificationNotes;

    @Column(name = "verified_by", length = 50)
    private String verifiedBy;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "contact_phone", length = 50)
    private String contactPhone;

    @Column(name = "contact_email", length = 255)
    private String contactEmail;

    @Column(name = "official_website", length = 255)
    private String officialWebsite;

    @Column(name = "check_in_time", length = 50)
    private String checkInTime;

    @Column(name = "check_out_time", length = 50)
    private String checkOutTime;

    @Column(name = "is_demo_data", nullable = false)
    @Builder.Default
    private Boolean isDemoData = false;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
