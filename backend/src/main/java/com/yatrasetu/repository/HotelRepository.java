package com.yatrasetu.repository;

import com.yatrasetu.domain.Hotel;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, String> {

    List<Hotel> findByDestinationId(String destinationId);

    List<Hotel> findByCityId(String cityId);

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
