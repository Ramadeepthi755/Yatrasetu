package com.yatrasetu.repository.intelligence;

import com.yatrasetu.domain.intelligence.HealthClassification;
import com.yatrasetu.domain.intelligence.TourismDestinationScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TourismDestinationScoreRepository extends JpaRepository<TourismDestinationScore, String> {

    Optional<TourismDestinationScore> findFirstByDestinationIdOrderByScoreDateDesc(String destinationId);

    Optional<TourismDestinationScore> findByDestinationIdAndScoreDate(String destinationId, LocalDate scoreDate);

    List<TourismDestinationScore> findByClassification(HealthClassification classification);

    long countByClassification(HealthClassification classification);
}
