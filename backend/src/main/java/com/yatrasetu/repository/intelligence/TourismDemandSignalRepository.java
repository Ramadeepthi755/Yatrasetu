package com.yatrasetu.repository.intelligence;

import com.yatrasetu.domain.intelligence.DemandSignalType;
import com.yatrasetu.domain.intelligence.IntelligenceSourceType;
import com.yatrasetu.domain.intelligence.TourismDemandSignal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TourismDemandSignalRepository extends JpaRepository<TourismDemandSignal, String> {

    boolean existsByIdempotencyKey(String idempotencyKey);

    List<TourismDemandSignal> findByDestinationIdOrderBySignalDateDesc(String destinationId);

    @Query("""
        SELECT s.destination.id, SUM(s.signalValue)
        FROM TourismDemandSignal s
        WHERE s.signalDate >= :startDate
        AND (:includeDemo = true OR s.sourceType != 'DEMO')
        GROUP BY s.destination.id
    """)
    List<Object[]> sumSignalsByDestinationSince(
        @Param("startDate") LocalDate startDate,
        @Param("includeDemo") boolean includeDemo
    );

    @Query("""
        SELECT s.destination.id, SUM(s.signalValue)
        FROM TourismDemandSignal s
        WHERE s.signalDate BETWEEN :startDate AND :endDate
        AND (:includeDemo = true OR s.sourceType != 'DEMO')
        GROUP BY s.destination.id
    """)
    List<Object[]> sumSignalsByDestinationBetween(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("includeDemo") boolean includeDemo
    );

    @Query("""
        SELECT s.signalDate, SUM(s.signalValue)
        FROM TourismDemandSignal s
        WHERE s.signalDate >= :startDate
        AND (:destinationId IS NULL OR s.destination.id = :destinationId)
        AND (:includeDemo = true OR s.sourceType != 'DEMO')
        GROUP BY s.signalDate
        ORDER BY s.signalDate ASC
    """)
    List<Object[]> aggregateTimeSeries(
        @Param("startDate") LocalDate startDate,
        @Param("destinationId") String destinationId,
        @Param("includeDemo") boolean includeDemo
    );

    @Query("""
        SELECT s.signalType, COUNT(s)
        FROM TourismDemandSignal s
        WHERE s.destination.id = :destinationId
        AND (:includeDemo = true OR s.sourceType != 'DEMO')
        GROUP BY s.signalType
    """)
    List<Object[]> countBySignalTypeForDestination(
        @Param("destinationId") String destinationId,
        @Param("includeDemo") boolean includeDemo
    );

    long countBySourceType(IntelligenceSourceType sourceType);
}
