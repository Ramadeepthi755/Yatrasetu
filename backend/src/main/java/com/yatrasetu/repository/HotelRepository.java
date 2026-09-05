package com.yatrasetu.repository;

import com.yatrasetu.domain.Hotel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, String> {

    List<Hotel> findByDestinationId(String destinationId);

    @Query("SELECT h.destination.id, COUNT(h) FROM Hotel h WHERE h.destination IS NOT NULL GROUP BY h.destination.id")
    List<Object[]> countHotelsByDestination();

    List<Hotel> findByCityId(String cityId);

    @Query("SELECT DISTINCT h.category FROM Hotel h WHERE h.isActive = true AND h.category IS NOT NULL")
    List<String> findDistinctCategories();

    @Query("SELECT h FROM Hotel h " +
            "LEFT JOIN h.city c " +
            "LEFT JOIN h.destination d " +
            "LEFT JOIN c.state s " +
            "WHERE h.isActive = true " +
            "AND (CAST(:cityId AS string) IS NULL OR (c.id IS NOT NULL AND LOWER(c.id) = LOWER(CAST(:cityId AS string)))) " +
            "AND (CAST(:destinationId AS string) IS NULL OR (d.id IS NOT NULL AND LOWER(d.id) = LOWER(CAST(:destinationId AS string))) OR (c.id IS NOT NULL AND LOWER(c.id) = LOWER(CAST(:destinationId AS string))) OR (CAST(:targetCityId AS string) IS NOT NULL AND c.id IS NOT NULL AND LOWER(c.id) = LOWER(CAST(:targetCityId AS string)))) " +
            "AND (CAST(:category AS string) IS NULL OR LOWER(h.category) = LOWER(CAST(:category AS string))) " +
            "AND (:minRating IS NULL OR h.hotelRating >= :minRating) " +
            "AND (:maxPrice IS NULL OR h.pricePerNight <= :maxPrice) " +
            "AND (:isPartnerProperty IS NULL OR h.isPartnerProperty = :isPartnerProperty) " +
            "AND (CAST(:searchQuery AS string) IS NULL OR " +
            "LOWER(h.hotelName) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS string), '%')) OR " +
            "(h.address IS NOT NULL AND LOWER(h.address) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS string), '%'))) OR " +
            "(h.category IS NOT NULL AND LOWER(h.category) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS string), '%'))) OR " +
            "(c.cityName IS NOT NULL AND LOWER(c.cityName) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS string), '%'))) OR " +
            "(c.id IS NOT NULL AND LOWER(c.id) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS string), '%'))) OR " +
            "(d.destinationName IS NOT NULL AND LOWER(d.destinationName) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS string), '%'))) OR " +
            "(d.id IS NOT NULL AND LOWER(d.id) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS string), '%'))) OR " +
            "(s.stateName IS NOT NULL AND LOWER(s.stateName) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS string), '%'))))")
    Page<Hotel> findWithFilters(
            @Param("cityId") String cityId,
            @Param("destinationId") String destinationId,
            @Param("targetCityId") String targetCityId,
            @Param("category") String category,
            @Param("minRating") BigDecimal minRating,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("isPartnerProperty") Boolean isPartnerProperty,
            @Param("searchQuery") String searchQuery,
            Pageable pageable);

    @Query("SELECT h FROM Hotel h WHERE h.isActive = true AND " +
            "(LOWER(h.hotelName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(h.category) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(h.address) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Hotel> searchHotels(@Param("query") String query, Pageable pageable);

    @Query(value = "SELECT h.* FROM hotels h " +
            "WHERE h.is_active = true AND h.latitude IS NOT NULL AND h.longitude IS NOT NULL AND h.latitude != 0.0 AND h.longitude != 0.0 " +
            "ORDER BY (6371 * acos(cos(radians(:lat)) * cos(radians(h.latitude)) * cos(radians(h.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(h.latitude)))) ASC " +
            "LIMIT :limit", nativeQuery = true)
    List<Hotel> findNearestHotels(@Param("lat") double lat, @Param("lng") double lng, @Param("limit") int limit);
}
