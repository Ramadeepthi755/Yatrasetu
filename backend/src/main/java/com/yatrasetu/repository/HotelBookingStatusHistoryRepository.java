package com.yatrasetu.repository;

import com.yatrasetu.domain.HotelBookingStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelBookingStatusHistoryRepository extends JpaRepository<HotelBookingStatusHistory, String> {

    List<HotelBookingStatusHistory> findByBookingIdOrderByCreatedAtAsc(String bookingId);

    long countByBookingId(String bookingId);
}
