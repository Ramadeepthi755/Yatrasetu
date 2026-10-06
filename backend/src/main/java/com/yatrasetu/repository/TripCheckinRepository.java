package com.yatrasetu.repository;

import com.yatrasetu.domain.TripCheckin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripCheckinRepository extends JpaRepository<TripCheckin, String> {
    List<TripCheckin> findByBookingIdOrderByCreatedAtAsc(String bookingId);
}
