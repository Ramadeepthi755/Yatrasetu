package com.yatrasetu.service.intelligence;

import com.yatrasetu.domain.Destination;
import com.yatrasetu.domain.intelligence.IntelligenceSourceType;
import com.yatrasetu.repository.*;
import com.yatrasetu.web.dto.intelligence.LocalOpportunityDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
@RequiredArgsConstructor
public class LocalOpportunityService {

    private final LocalHostRepository localHostRepository;
    private final HotelRepository hotelRepository;
    private final ExperienceRepository experienceRepository;
    private final RestaurantRepository restaurantRepository;
    private final RentalProviderRepository rentalProviderRepository;
    private final DestinationRepository destinationRepository;

    @Transactional(readOnly = true)
    public LocalOpportunityDto calculateLocalOpportunity(String destinationId) {
        Destination destination = destinationRepository.findById(destinationId).orElse(null);
        if (destination == null) return null;

        long hosts = localHostRepository.findByDestinationId(destinationId).size();
        long hotels = hotelRepository.findByDestinationId(destinationId).size();
        long experiences = experienceRepository.findByDestinationId(destinationId).size();
        long restaurants = restaurantRepository.findByDestinationId(destinationId).size();
        long rentals = rentalProviderRepository.findByDestinationId(destinationId).size();

        // Calculate weighted ecosystem capacity score (0 - 100)
        double rawCapacity = (hosts * 15.0) + (experiences * 10.0) + (hotels * 2.5) + (restaurants * 3.0) + (rentals * 3.0);
        double normalizedScore = Math.min(100.0, Math.max(10.0, rawCapacity));
        BigDecimal opportunityScore = BigDecimal.valueOf(normalizedScore).setScale(1, RoundingMode.HALF_UP);

        String explanation = String.format(
                "%s has %d local hosts, %d experiences, %d hotels, and %d local services available in the ecosystem.",
                destination.getDestinationName(), hosts, experiences, hotels, restaurants + rentals
        );

        return LocalOpportunityDto.builder()
                .destinationId(destination.getId())
                .destinationName(destination.getDestinationName())
                .opportunityScore(opportunityScore)
                .verifiedHostsCount(hosts)
                .hotelsCount(hotels)
                .experiencesCount(experiences)
                .restaurantsCount(restaurants)
                .rentalProvidersCount(rentals)
                .sourceType(IntelligenceSourceType.DERIVED)
                .explanation(explanation)
                .disclaimer("Derived from verified YatraSetu partner and provider ecosystem listings. Does not measure physical footfall or guarantee revenue.")
                .build();
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, LocalOpportunityDto> calculateAllLocalOpportunities() {
        java.util.Map<String, Long> hostsMap = toCountMap(localHostRepository.countHostsByDestination());
        java.util.Map<String, Long> hotelsMap = toCountMap(hotelRepository.countHotelsByDestination());
        java.util.Map<String, Long> expMap = toCountMap(experienceRepository.countExperiencesByDestination());
        java.util.Map<String, Long> restMap = toCountMap(restaurantRepository.countRestaurantsByDestination());
        java.util.Map<String, Long> rentMap = toCountMap(rentalProviderRepository.countRentalsByDestination());

        java.util.List<Destination> destinations = destinationRepository.findAll();
        java.util.Map<String, LocalOpportunityDto> result = new java.util.HashMap<>();

        for (Destination destination : destinations) {
            long hosts = hostsMap.getOrDefault(destination.getId(), 0L);
            long hotels = hotelsMap.getOrDefault(destination.getId(), 0L);
            long experiences = expMap.getOrDefault(destination.getId(), 0L);
            long restaurants = restMap.getOrDefault(destination.getId(), 0L);
            long rentals = rentMap.getOrDefault(destination.getId(), 0L);

            double rawCapacity = (hosts * 15.0) + (experiences * 10.0) + (hotels * 2.5) + (restaurants * 3.0) + (rentals * 3.0);
            double normalizedScore = Math.min(100.0, Math.max(10.0, rawCapacity));
            BigDecimal opportunityScore = BigDecimal.valueOf(normalizedScore).setScale(1, RoundingMode.HALF_UP);

            String explanation = String.format(
                    "%s has %d local hosts, %d experiences, %d hotels, and %d local services available in the ecosystem.",
                    destination.getDestinationName(), hosts, experiences, hotels, restaurants + rentals
            );

            result.put(destination.getId(), LocalOpportunityDto.builder()
                    .destinationId(destination.getId())
                    .destinationName(destination.getDestinationName())
                    .opportunityScore(opportunityScore)
                    .verifiedHostsCount(hosts)
                    .hotelsCount(hotels)
                    .experiencesCount(experiences)
                    .restaurantsCount(restaurants)
                    .rentalProvidersCount(rentals)
                    .sourceType(IntelligenceSourceType.DERIVED)
                    .explanation(explanation)
                    .disclaimer("Derived from verified YatraSetu partner and provider ecosystem listings. Does not measure physical footfall or guarantee revenue.")
                    .build());
        }
        return result;
    }

    private java.util.Map<String, Long> toCountMap(java.util.List<Object[]> rows) {
        java.util.Map<String, Long> map = new java.util.HashMap<>();
        if (rows == null) return map;
        for (Object[] r : rows) {
            if (r != null && r.length >= 2 && r[0] != null) {
                map.put((String) r[0], ((Number) r[1]).longValue());
            }
        }
        return map;
    }
}
