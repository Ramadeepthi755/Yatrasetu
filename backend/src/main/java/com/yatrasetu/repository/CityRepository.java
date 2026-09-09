package com.yatrasetu.repository;

import com.yatrasetu.domain.City;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CityRepository extends JpaRepository<City, String> {

    List<City> findByStateIdOrderByCityNameAsc(String stateId);

    List<City> findByIsTourismHubTrueOrderByCityNameAsc();

    @Query("SELECT c FROM City c WHERE LOWER(c.id) = LOWER(:id) OR LOWER(c.cityName) = LOWER(:id)")
    Optional<City> findByIdOrNameIgnoreCase(@Param("id") String id);

    @Query("SELECT c FROM City c WHERE LOWER(c.cityName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(c.districtName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<City> searchCities(@Param("query") String query, Pageable pageable);

    @Query(value = "SELECT c.* FROM cities c " +
            "WHERE c.latitude IS NOT NULL AND c.longitude IS NOT NULL AND c.latitude != 0.0 AND c.longitude != 0.0 " +
            "ORDER BY (6371 * acos(LEAST(1.0, GREATEST(-1.0, cos(radians(:lat)) * cos(radians(c.latitude)) * cos(radians(c.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(c.latitude)))))) ASC " +
            "LIMIT :limit", nativeQuery = true)
    List<City> findNearestCities(@Param("lat") double lat, @Param("lng") double lng, @Param("limit") int limit);
}

