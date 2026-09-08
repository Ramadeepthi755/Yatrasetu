package com.yatrasetu.repository;

import com.yatrasetu.domain.DestinationPoi;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DestinationPoiRepository extends JpaRepository<DestinationPoi, String> {

    List<DestinationPoi> findByDestinationId(String destinationId);

    @Query("SELECT p.destination.id, COUNT(p) FROM DestinationPoi p WHERE p.destination IS NOT NULL GROUP BY p.destination.id")
    List<Object[]> countPoisByDestination();

    List<DestinationPoi> findByCityId(String cityId);

    @Query("SELECT p FROM DestinationPoi p WHERE p.isActive = true AND " +
            "(LOWER(p.poiName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.characteristics) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<DestinationPoi> searchPois(@Param("query") String query, Pageable pageable);

    @Query(value = "SELECT p.* FROM destination_pois p " +
            "WHERE p.is_active = true AND p.latitude != 0.0 AND p.longitude != 0.0 " +
            "ORDER BY (6371 * acos(cos(radians(:lat)) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(p.latitude)))) ASC " +
            "LIMIT :limit", nativeQuery = true)
    List<DestinationPoi> findNearestPois(@Param("lat") double lat, @Param("lng") double lng, @Param("limit") int limit);
}
