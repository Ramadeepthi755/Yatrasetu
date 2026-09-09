package com.yatrasetu.repository;

import com.yatrasetu.domain.BookingDispute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingDisputeRepository extends JpaRepository<BookingDispute, String> {
    Optional<BookingDispute> findByBookingId(String bookingId);
    List<BookingDispute> findByRaisedByUserIdOrderByCreatedAtDesc(String raisedByUserId);
}
