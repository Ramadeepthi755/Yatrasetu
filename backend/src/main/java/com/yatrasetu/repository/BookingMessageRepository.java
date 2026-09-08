package com.yatrasetu.repository;

import com.yatrasetu.domain.BookingMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingMessageRepository extends JpaRepository<BookingMessage, String> {
    List<BookingMessage> findByBookingIdOrderByCreatedAtAsc(String bookingId);
}
