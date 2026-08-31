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
