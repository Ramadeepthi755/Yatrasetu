package com.yatrasetu.repository.intelligence;

import com.yatrasetu.domain.intelligence.TourismDemandForecast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TourismDemandForecastRepository extends JpaRepository<TourismDemandForecast, String> {

    List<TourismDemandForecast> findByDestinationIdOrderByHorizonDaysAsc(String destinationId);

    Optional<TourismDemandForecast> findByDestinationIdAndForecastDateAndHorizonDays(
        String destinationId,
        LocalDate forecastDate,
        Integer horizonDays
    );

    List<TourismDemandForecast> findByHorizonDaysOrderByPredictedDemandDesc(Integer horizonDays);
}
