package com.yatrasetu.repository;

import com.yatrasetu.domain.TripSafetyIncident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripSafetyIncidentRepository extends JpaRepository<TripSafetyIncident, String> {
    List<TripSafetyIncident> findByBookingIdOrderByCreatedAtDesc(String bookingId);
    List<TripSafetyIncident> findByUserIdOrderByCreatedAtDesc(String userId);
}
