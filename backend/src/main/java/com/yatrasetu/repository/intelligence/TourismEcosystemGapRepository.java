package com.yatrasetu.repository.intelligence;

import com.yatrasetu.domain.intelligence.EcosystemGapType;
import com.yatrasetu.domain.intelligence.TourismEcosystemGap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TourismEcosystemGapRepository extends JpaRepository<TourismEcosystemGap, String> {

    List<TourismEcosystemGap> findByDestinationId(String destinationId);

    List<TourismEcosystemGap> findByGapType(EcosystemGapType gapType);

    List<TourismEcosystemGap> findBySeverity(String severity);

    Optional<TourismEcosystemGap> findByDestinationIdAndGapType(String destinationId, EcosystemGapType gapType);

    @Query("SELECT g FROM TourismEcosystemGap g JOIN FETCH g.destination d LEFT JOIN FETCH d.state LEFT JOIN FETCH d.city ORDER BY g.severity ASC, g.detectedAt DESC")
    List<TourismEcosystemGap> findAllWithDestinationDetails();
}
