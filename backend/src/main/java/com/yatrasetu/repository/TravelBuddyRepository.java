package com.yatrasetu.repository;

import com.yatrasetu.domain.TravelBuddy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TravelBuddyRepository extends JpaRepository<TravelBuddy, String> {

    List<TravelBuddy> findByUserId(String userId);

    Optional<TravelBuddy> findFirstByUserIdAndActiveTrueOrderByTravelDateAsc(String userId);

    @Query("""
        SELECT tb FROM TravelBuddy tb
        LEFT JOIN Profile p ON p.id = tb.user.id
        WHERE tb.active = true
          AND (p.travelConnectEnabled IS NULL OR p.travelConnectEnabled = true)
          AND (CAST(:destinationId AS string) IS NULL OR tb.destination.id = CAST(:destinationId AS string))
          AND (CAST(:city AS string) IS NULL OR LOWER(tb.destinationCity) LIKE LOWER(CONCAT('%', CAST(:city AS string), '%')))
          AND (CAST(:travelStyle AS string) IS NULL OR LOWER(tb.travelStyle) = LOWER(CAST(:travelStyle AS string)))
          AND (:fromDate IS NULL OR tb.travelDate >= :fromDate OR tb.flexibleDates = true)
          AND (:toDate IS NULL OR tb.travelDate <= :toDate OR tb.flexibleDates = true)
          AND (CAST(:excludeUserId AS string) IS NULL OR tb.user.id != CAST(:excludeUserId AS string))
        ORDER BY 
          CASE WHEN CAST(:destinationId AS string) IS NOT NULL AND tb.destination.id = CAST(:destinationId AS string) THEN 0 ELSE 1 END,
          tb.travelDate ASC
    """)
    Page<TravelBuddy> searchTravelers(
            @Param("destinationId") String destinationId,
            @Param("city") String city,
            @Param("travelStyle") String travelStyle,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("excludeUserId") String excludeUserId,
            Pageable pageable
    );

    @Query("""
        SELECT tb FROM TravelBuddy tb
        LEFT JOIN Profile p ON p.id = tb.user.id
        WHERE tb.active = true
          AND (p.travelConnectEnabled IS NULL OR p.travelConnectEnabled = true)
          AND tb.destination.id = :destinationId
        ORDER BY tb.travelDate ASC
    """)
    List<TravelBuddy> findTopTravelersByDestination(@Param("destinationId") String destinationId, Pageable pageable);
}
