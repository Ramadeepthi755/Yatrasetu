package com.yatrasetu.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateHotelRequest {

    @NotBlank(message = "Property name is required")
    private String hotelName;

    @NotBlank(message = "City ID is required")
    private String cityId;

    private String destinationId;

    @NotBlank(message = "Category is required")
    @Builder.Default
    private String category = "Mid-Range"; // Heritage, Luxury, Boutique, Homestay, Resort, Budget, Mid-Range

    @NotNull(message = "Indicative/Base price per night is required")
    @Positive(message = "Price per night must be positive")
    private BigDecimal pricePerNight;

    private String address;

    @Builder.Default
    private List<String> amenities = new ArrayList<>();

    private BigDecimal latitude;

    private BigDecimal longitude;

    private String contactPhone;

    private String contactEmail;

    private String officialWebsite;

    private String checkInTime;

    private String checkOutTime;
}
