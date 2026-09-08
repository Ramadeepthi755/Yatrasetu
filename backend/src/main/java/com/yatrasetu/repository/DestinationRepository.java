package com.yatrasetu.repository;

import com.yatrasetu.domain.Destination;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface DestinationRepository extends JpaRepository<Destination, String> {

    List<Destination> findByStateIdOrderByPopularityScoreDesc(String stateId);

    @Query("SELECT d FROM Destination d JOIN FETCH d.state LEFT JOIN FETCH d.city WHERE d.state.id = :stateId AND d.isActive = true ORDER BY d.popularityScore DESC")
    List<Destination> findByStateIdWithDetails(@Param("stateId") String stateId);

    @Query("SELECT d FROM Destination d JOIN FETCH d.state LEFT JOIN FETCH d.city WHERE d.isActive = true ORDER BY d.popularityScore DESC")
    List<Destination> findAllActiveWithDetails();

    List<Destination> findByCityIdOrderByPopularityScoreDesc(String cityId);

    List<Destination> findByRegionIgnoreCaseOrderByPopularityScoreDesc(String region);

    @Query("SELECT d FROM Destination d WHERE LOWER(d.id) = LOWER(:id) OR LOWER(d.destinationName) = LOWER(:id)")
    Optional<Destination> findByIdOrNameIgnoreCase(@Param("id") String id);

    @Query("SELECT d FROM Destination d WHERE d.isActive = true ORDER BY d.popularityScore DESC")
    List<Destination> findTopPopular(Pageable pageable);

    @Query("SELECT d FROM Destination d WHERE d.isActive = true AND d.popularityScore >= 8.0 ORDER BY d.popularityScore DESC")
    List<Destination> findTrending(Pageable pageable);

    @Query("SELECT d FROM Destination d WHERE d.isActive = true AND (d.hiddenGems IS NOT NULL AND TRIM(d.hiddenGems) != '') ORDER BY d.popularityScore ASC")
    List<Destination> findHiddenGems(Pageable pageable);

    @Query("SELECT d FROM Destination d WHERE d.isActive = true " +
            "AND (CAST(:stateId AS string) IS NULL OR LOWER(d.state.id) = LOWER(CAST(:stateId AS string)) OR LOWER(d.state.stateName) = LOWER(CAST(:stateId AS string))) " +
            "AND (CAST(:region AS string) IS NULL OR LOWER(d.region) = LOWER(CAST(:region AS string))) " +
            "AND (:minPopularity IS NULL OR d.popularityScore >= :minPopularity) " +
            "AND (CAST(:searchQuery AS string) IS NULL OR LOWER(d.destinationName) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS string), '%')) OR LOWER(d.district) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS string), '%')) OR LOWER(d.description) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS string), '%')))")
    Page<Destination> findWithFilters(
            @Param("stateId") String stateId,
            @Param("region") String region,
            @Param("minPopularity") BigDecimal minPopularity,
            @Param("searchQuery") String searchQuery,
            Pageable pageable);

    @Query("SELECT d FROM Destination d WHERE d.isActive = true AND (" +
            "LOWER(d.destinationName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(d.district) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(d.region) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(d.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Destination> searchDestinations(@Param("query") String query, Pageable pageable);

    long countByStateId(String stateId);
    long countByCityId(String cityId);
}
