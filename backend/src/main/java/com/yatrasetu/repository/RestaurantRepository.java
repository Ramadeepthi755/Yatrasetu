package com.yatrasetu.repository;

import com.yatrasetu.domain.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, String> {
    List<Restaurant> findByDestinationId(String destinationId);
    List<Restaurant> findByDestinationIdAndIsVerified(String destinationId, Boolean isVerified);

    @Query("SELECT r.destination.id, COUNT(r) FROM Restaurant r WHERE r.destination IS NOT NULL GROUP BY r.destination.id")
    List<Object[]> countRestaurantsByDestination();
}
