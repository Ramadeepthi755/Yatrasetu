package com.yatrasetu.repository;

import com.yatrasetu.domain.HotelBooking;
import com.yatrasetu.domain.HotelBookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface HotelBookingRepository extends JpaRepository<HotelBooking, String> {

    Optional<HotelBooking> findByBookingReference(String bookingReference);

    Optional<HotelBooking> findByIdempotencyKey(String idempotencyKey);

    List<HotelBooking> findByTravelerIdOrderByCreatedAtDesc(String travelerId);

    List<HotelBooking> findByHotelIdOrderByCreatedAtDesc(String hotelId);

    List<HotelBooking> findByHotelIdAndBookingStatusOrderByCreatedAtDesc(String hotelId, HotelBookingStatus bookingStatus);

    @Query("SELECT b FROM HotelBooking b WHERE b.bookingStatus = :status AND b.expiresAt IS NOT NULL AND b.expiresAt < :cutoff")
    List<HotelBooking> findExpiredPendingBookings(
            @Param("status") HotelBookingStatus status,
            @Param("cutoff") Instant cutoff);
}
