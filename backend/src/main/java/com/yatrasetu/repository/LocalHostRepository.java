package com.yatrasetu.repository;

import com.yatrasetu.domain.LocalHost;
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
public interface LocalHostRepository extends JpaRepository<LocalHost, String> {

    List<LocalHost> findByDestinationId(String destinationId);

    @Query("SELECT h.destination.id, COUNT(h) FROM LocalHost h WHERE h.destination IS NOT NULL GROUP BY h.destination.id")
    List<Object[]> countHostsByDestination();

    List<LocalHost> findByCityId(String cityId);

    List<LocalHost> findByStateId(String stateId);

    Optional<LocalHost> findByUserId(String userId);

    @Query("SELECT h FROM LocalHost h WHERE " +
            "(CAST(:cityId AS string) IS NULL OR LOWER(h.city.id) = LOWER(CAST(:cityId AS string))) AND " +
            "(CAST(:destinationId AS string) IS NULL OR LOWER(h.destination.id) = LOWER(CAST(:destinationId AS string)) OR LOWER(h.city.id) = LOWER(CAST(:destinationId AS string))) AND " +
            "(CAST(:stateId AS string) IS NULL OR LOWER(h.state.id) = LOWER(CAST(:stateId AS string))) AND " +
            "(:isVerified IS NULL OR h.isVerified = :isVerified) AND " +
            "(:minRating IS NULL OR h.rating >= :minRating) AND " +
            "(:maxPrice IS NULL OR h.pricePerHour <= :maxPrice) AND " +
            "(CAST(:skill AS string) IS NULL OR LOWER(h.roleTitle) LIKE LOWER(CONCAT('%', CAST(:skill AS string), '%')) OR LOWER(CAST(h.skills AS string)) LIKE LOWER(CONCAT('%', CAST(:skill AS string), '%'))) AND " +
            "(CAST(:language AS string) IS NULL OR LOWER(CAST(h.languages AS string)) LIKE LOWER(CONCAT('%', CAST(:language AS string), '%'))) AND " +
            "(CAST(:searchQuery AS string) IS NULL OR LOWER(h.name) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS string), '%')) OR LOWER(h.about) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS string), '%')) OR LOWER(h.roleTitle) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS string), '%')) OR LOWER(CAST(h.skills AS string)) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS string), '%')) OR LOWER(CAST(h.interests AS string)) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS string), '%')) OR LOWER(h.city.cityName) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS string), '%')))")
    Page<LocalHost> findWithFilters(
            @Param("cityId") String cityId,
            @Param("destinationId") String destinationId,
            @Param("stateId") String stateId,
            @Param("isVerified") Boolean isVerified,
            @Param("minRating") BigDecimal minRating,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("skill") String skill,
            @Param("language") String language,
            @Param("searchQuery") String searchQuery,
            Pageable pageable);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE LocalHost h SET h.experienceCount = COALESCE(h.experienceCount, 0) + 1 WHERE h.id = :hostId")
    void incrementExperienceCount(@Param("hostId") String hostId);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE LocalHost h SET h.rating = :rating WHERE h.id = :hostId")
    void updateRating(@Param("hostId") String hostId, @Param("rating") BigDecimal rating);
}
