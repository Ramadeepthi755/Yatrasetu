package com.yatrasetu.web.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TripDto {

    private String id;
    private String destinationId;
    private String destinationName;
    private String destinationImage;
    private String cityName;
    private String stateName;
    private String title;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalDays;
    private Integer travelerCount;
    private String budgetCategory;
    private BigDecimal totalBudgetInr;
    private String status;
    private Boolean isAiGenerated;
    private Instant createdAt;

    @Builder.Default
    private BudgetBreakdownDto budgetBreakdown = new BudgetBreakdownDto();

    @Builder.Default
    private WeatherSummaryDto weatherSummary = new WeatherSummaryDto();

    @Builder.Default
    private List<ItineraryDayDto> itineraries = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItineraryDayDto {
        private String id;
        private Integer dayNumber;
        private String theme;
        private String notes;
        @Builder.Default
        private List<ItineraryItemDto> items = new ArrayList<>();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItineraryItemDto {
        private String id;
        private String itemType; // POI, HOTEL, EXPERIENCE, LOCAL_HOST, MEAL, TRANSIT
        private String itemId;
        private String poiId;
        private String title;
        private String timeSlot; // MORNING, AFTERNOON, EVENING, NIGHT
        private BigDecimal durationHours;
        private BigDecimal estimatedCostInr;
        private String priceTransparency; // KNOWN, ESTIMATED, UNAVAILABLE
        private String rationale;
        private Integer orderIndex;
        private String imageUrl;
        private String category;
        private String source; // DATASET, OFFICIAL, VERIFIED_PARTNER, DEMO
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetBreakdownDto {
        @Builder.Default
        private BigDecimal knownCostsInr = BigDecimal.ZERO;
        @Builder.Default
        private BigDecimal estimatedCostsInr = BigDecimal.ZERO;
        @Builder.Default
        private BigDecimal totalBudgetInr = BigDecimal.ZERO;
        @Builder.Default
        private List<String> unavailablePriceItems = new ArrayList<>();
        @Builder.Default
        private List<BudgetItemBreakdown> items = new ArrayList<>();
        @Builder.Default
        private String currency = "INR";
        private String honestyNote;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetItemBreakdown {
        private String category; // Activities & Entry, Accommodation, Food, Local Transport, Miscellaneous
        private BigDecimal amountInr;
        private String priceType; // KNOWN, ESTIMATED, UNAVAILABLE
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeatherSummaryDto {
        private Double temperatureC;
        private String condition;
        private String source; // "Open-Meteo Live API"
        private String advice;
    }
}
