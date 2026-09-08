package com.yatrasetu.repository;

import com.yatrasetu.domain.Review;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {

    List<Review> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, String entityId);

    @Query("SELECT r FROM Review r WHERE r.entityType = 'DESTINATION' AND r.entityId = :destinationId ORDER BY r.createdAt DESC")
    List<Review> findByDestinationId(@Param("destinationId") String destinationId, Pageable pageable);
}
