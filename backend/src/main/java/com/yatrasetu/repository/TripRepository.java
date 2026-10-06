package com.yatrasetu.repository;

import com.yatrasetu.domain.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, String> {

    List<Trip> findByUserIdOrderByCreatedAtDesc(String userId);

    Optional<Trip> findByIdAndUserId(String id, String userId);

    boolean existsByIdAndUserId(String id, String userId);

    @Query("SELECT t FROM Trip t LEFT JOIN FETCH t.itineraries i LEFT JOIN FETCH i.items WHERE t.id = :id AND t.user.id = :userId")
    Optional<Trip> findByIdAndUserIdWithDetails(@Param("id") String id, @Param("userId") String userId);
}
