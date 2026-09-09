package com.yatrasetu.repository;

import com.yatrasetu.domain.CulturalTradition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CulturalTraditionRepository extends JpaRepository<CulturalTradition, String> {

    List<CulturalTradition> findByStateIdAndIsActiveTrue(String stateId);

    List<CulturalTradition> findByDestinationIdAndIsActiveTrue(String destinationId);

    List<CulturalTradition> findByCityIdAndIsActiveTrue(String cityId);

    List<CulturalTradition> findByCategoryAndIsActiveTrue(String category);

    @Query("SELECT DISTINCT c.category FROM CulturalTradition c WHERE c.isActive = true ORDER BY c.category ASC")
    List<String> findDistinctCategories();

    @Query("SELECT c FROM CulturalTradition c " +
            "LEFT JOIN c.state s " +
            "LEFT JOIN c.city ci " +
            "LEFT JOIN c.destination d " +
            "WHERE c.isActive = true " +
            "AND (CAST(:stateId AS string) IS NULL OR (s.id IS NOT NULL AND LOWER(s.id) = LOWER(CAST(:stateId AS string)))) " +
            "AND (CAST(:cityId AS string) IS NULL OR (ci.id IS NOT NULL AND LOWER(ci.id) = LOWER(CAST(:cityId AS string)))) " +
            "AND (CAST(:destinationId AS string) IS NULL OR (d.id IS NOT NULL AND LOWER(d.id) = LOWER(CAST(:destinationId AS string)))) " +
            "AND (CAST(:category AS string) IS NULL OR LOWER(c.category) = LOWER(CAST(:category AS string))) " +
            "AND (CAST(:searchQuery AS string) IS NULL OR " +
            "LOWER(c.traditionName) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS string), '%')) OR " +
            "(c.craftType IS NOT NULL AND LOWER(c.craftType) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS string), '%'))) OR " +
            "(c.primaryProducingCluster IS NOT NULL AND LOWER(c.primaryProducingCluster) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS string), '%'))) OR " +
            "(s.stateName IS NOT NULL AND LOWER(s.stateName) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS string), '%'))))")
    Page<CulturalTradition> findWithFilters(
            @Param("stateId") String stateId,
            @Param("cityId") String cityId,
            @Param("destinationId") String destinationId,
            @Param("category") String category,
            @Param("searchQuery") String searchQuery,
            Pageable pageable);

    long countByStateIdAndIsActiveTrue(String stateId);

    long countByDestinationIdAndIsActiveTrue(String destinationId);
}
