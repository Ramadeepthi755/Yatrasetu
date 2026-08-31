package com.yatrasetu.domain;

import com.yatrasetu.domain.converter.StringListConverter;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "destinations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Destination {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "destination_name", length = 150, nullable = false)
    private String destinationName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "state_id", nullable = false)
    private State state;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id")
    private City city;

    @Column(name = "district", length = 150)
    private String district;

    @Column(name = "region", length = 50)
    private String region;

    @Column(name = "latitude", precision = 10, scale = 7, nullable = false)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7, nullable = false)
    private BigDecimal longitude;

    @Column(name = "altitude_m")
    private Integer altitudeM;

    @Column(name = "popularity_score", precision = 3, scale = 1)
    @Builder.Default
    private BigDecimal popularityScore = BigDecimal.valueOf(5.0);

    @Column(name = "accessibility", length = 50)
    @Builder.Default
    private String accessibility = "Easy";

    @Column(name = "nearest_airport", columnDefinition = "TEXT")
    private String nearestAirport;

    @Column(name = "nearest_railway", columnDefinition = "TEXT")
    private String nearestRailway;

    @Column(name = "nearest_major_city", length = 100)
    private String nearestMajorCity;

    @Column(name = "nearest_major_city_distance_km", precision = 8, scale = 2)
    private BigDecimal nearestMajorCityDistanceKm;

    @Column(name = "road_connectivity", columnDefinition = "TEXT")
    private String roadConnectivity;

    @Convert(converter = StringListConverter.class)
    @Column(name = "trip_types", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> tripTypes = new ArrayList<>();

    @Convert(converter = StringListConverter.class)
    @Column(name = "primary_attractions", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> primaryAttractions = new ArrayList<>();

    @Convert(converter = StringListConverter.class)
    @Column(name = "activities_available", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> activitiesAvailable = new ArrayList<>();

    @Column(name = "unique_experiences", columnDefinition = "TEXT")
    private String uniqueExperiences;

    @Column(name = "hidden_gems", columnDefinition = "TEXT")
    private String hiddenGems;

    @Column(name = "best_seasons", columnDefinition = "TEXT")
    private String bestSeasons;

    @Column(name = "avoid_seasons", columnDefinition = "TEXT")
    private String avoidSeasons;

    @Column(name = "peak_season", columnDefinition = "TEXT")
    private String peakSeason;

    @Column(name = "off_season", columnDefinition = "TEXT")
    private String offSeason;

    @Column(name = "average_temperature", columnDefinition = "TEXT")
    private String averageTemperature;

    @Column(name = "rainfall_pattern", columnDefinition = "TEXT")
    private String rainfallPattern;

    @Convert(converter = StringListConverter.class)
    @Column(name = "ideal_for", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> idealFor = new ArrayList<>();

    @Column(name = "ideal_for_why", columnDefinition = "TEXT")
    private String idealForWhy;

    @Column(name = "special_considerations", columnDefinition = "TEXT")
    private String specialConsiderations;

    @Column(name = "minimum_days", precision = 3, scale = 1)
    @Builder.Default
    private BigDecimal minimumDays = BigDecimal.valueOf(2.0);

    @Column(name = "ideal_days", precision = 3, scale = 1)
    @Builder.Default
    private BigDecimal idealDays = BigDecimal.valueOf(4.0);

    @Column(name = "maximum_days")
    @Builder.Default
    private Integer maximumDays = 7;

    @Column(name = "suggested_itinerary", columnDefinition = "TEXT")
    private String suggestedItinerary;

    @Column(name = "accommodation_types", columnDefinition = "TEXT")
    private String accommodationTypes;

    @Column(name = "food_scene", columnDefinition = "TEXT")
    private String foodScene;

    @Column(name = "safety_rating", precision = 3, scale = 1)
    @Builder.Default
    private BigDecimal safetyRating = BigDecimal.valueOf(8.0);

    @Column(name = "safety_notes", columnDefinition = "TEXT")
    private String safetyNotes;

    @Column(name = "internet_connectivity", columnDefinition = "TEXT")
    private String internetConnectivity;

    @Column(name = "mobile_network", columnDefinition = "TEXT")
    private String mobileNetwork;

    @Column(name = "atm_availability", columnDefinition = "TEXT")
    private String atmAvailability;

    @Column(name = "language_spoken", length = 150)
    private String languageSpoken;

    @Column(name = "permits_required")
    @Builder.Default
    private Boolean permitsRequired = false;

    @Column(name = "permits_details", columnDefinition = "TEXT")
    private String permitsDetails;

    @Column(name = "local_culture", columnDefinition = "TEXT")
    private String localCulture;

    @Column(name = "festivals_events", columnDefinition = "TEXT")
    private String festivalsEvents;

    @Column(name = "local_customs", columnDefinition = "TEXT")
    private String localCustoms;

    @Column(name = "shopping_highlights", columnDefinition = "TEXT")
    private String shoppingHighlights;

    @Column(name = "local_cuisine_must_try", columnDefinition = "TEXT")
    private String localCuisineMustTry;

    @Column(name = "budget_range_json", columnDefinition = "TEXT")
    private String budgetRangeJson;

    @Column(name = "mid_range_json", columnDefinition = "TEXT")
    private String midRangeJson;

    @Column(name = "luxury_range_json", columnDefinition = "TEXT")
    private String luxuryRangeJson;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "hero_image_url", columnDefinition = "TEXT")
    private String heroImageUrl;

    @Column(name = "user_reviews_summary", columnDefinition = "TEXT")
    private String userReviewsSummary;

    @Column(name = "recent_developments", columnDefinition = "TEXT")
    private String recentDevelopments;

    @Column(name = "sustainability_notes", columnDefinition = "TEXT")
    private String sustainabilityNotes;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @OneToMany(mappedBy = "destination", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DestinationPoi> pois = new ArrayList<>();

    @OneToMany(mappedBy = "destination", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Hotel> hotels = new ArrayList<>();
}
