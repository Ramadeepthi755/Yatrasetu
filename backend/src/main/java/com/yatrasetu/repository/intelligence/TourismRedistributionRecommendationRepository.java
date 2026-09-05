package com.yatrasetu.repository.intelligence;

import com.yatrasetu.domain.intelligence.RecommendationStatus;
import com.yatrasetu.domain.intelligence.TourismRedistributionRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TourismRedistributionRecommendationRepository extends JpaRepository<TourismRedistributionRecommendation, String> {

    List<TourismRedistributionRecommendation> findByStatusOrderByConfidenceScoreDesc(RecommendationStatus status);

    List<TourismRedistributionRecommendation> findBySourceDestinationId(String sourceDestinationId);

    List<TourismRedistributionRecommendation> findByTargetDestinationId(String targetDestinationId);

    Optional<TourismRedistributionRecommendation> findBySourceDestinationIdAndTargetDestinationId(
        String sourceDestinationId,
        String targetDestinationId
    );

    long countByStatus(RecommendationStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT r.sourceDestination.id, COUNT(r) FROM TourismRedistributionRecommendation r WHERE r.sourceDestination IS NOT NULL GROUP BY r.sourceDestination.id")
    List<Object[]> countBySourceDestination();
}
