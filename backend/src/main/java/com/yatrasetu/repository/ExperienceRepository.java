package com.yatrasetu.repository;

import com.yatrasetu.domain.Experience;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ExperienceRepository extends JpaRepository<Experience, String> {

    List<Experience> findByHostId(String hostId);

    List<Experience> findByDestinationId(String destinationId);

    List<Experience> findByCityId(String cityId);

    List<Experience> findByCulturalTraditionId(String culturalTraditionId);

    @Query("SELECT e FROM Experience e WHERE e.culturalTradition.id = :culturalTraditionId " +
            "AND e.isActive = true " +
            "AND (e.verificationStatus = com.yatrasetu.domain.ExperienceVerificationStatus.VERIFIED OR e.isDemoData = true)")
    List<Experience> findVerifiedByCulturalTraditionId(@Param("culturalTraditionId") String culturalTraditionId);

    List<Experience> findByVerificationStatus(com.yatrasetu.domain.ExperienceVerificationStatus verificationStatus);

    List<Experience> findByVerificationStatusIn(List<com.yatrasetu.domain.ExperienceVerificationStatus> statuses);

    @Query("SELECT e.destination.id, COUNT(e) FROM Experience e WHERE e.destination IS NOT NULL GROUP BY e.destination.id")
    List<Object[]> countExperiencesByDestination();

    List<Experience> findByHostUserId(String userId);

    @Query("SELECT DISTINCT e.category FROM Experience e WHERE e.isActive = true")
    List<String> findDistinctCategories();

    @Query("SELECT e FROM Experience e WHERE e.isActive = true " +
            "AND (CAST(:destinationId AS string) IS NULL OR LOWER(e.destination.id) = LOWER(CAST(:destinationId AS string)) OR LOWER(e.city.id) = LOWER(CAST(:destinationId AS string))) " +
            "AND (CAST(:cityId AS string) IS NULL OR LOWER(e.city.id) = LOWER(CAST(:cityId AS string))) " +
            "AND (CAST(:category AS string) IS NULL OR LOWER(e.category) = LOWER(CAST(:category AS string))) " +
            "AND (:maxPrice IS NULL OR e.pricePerPerson <= :maxPrice) " +
            "AND (CAST(:language AS string) IS NULL OR LOWER(CAST(e.languages AS string)) LIKE LOWER(CONCAT('%', CAST(:language AS string), '%'))) " +
            "AND (CAST(:searchQuery AS string) IS NULL OR " +
            "LOWER(e.title) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS string), '%')) OR " +
            "LOWER(e.description) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS string), '%')) OR " +
            "LOWER(e.host.name) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS string), '%')))")
    Page<Experience> findWithFilters(
            @Param("destinationId") String destinationId,
            @Param("cityId") String cityId,
            @Param("category") String category,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("language") String language,
            @Param("searchQuery") String searchQuery,
            Pageable pageable);
}
