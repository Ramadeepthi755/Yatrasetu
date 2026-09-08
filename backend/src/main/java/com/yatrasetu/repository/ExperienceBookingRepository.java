package com.yatrasetu.repository;

import com.yatrasetu.domain.ExperienceBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExperienceBookingRepository extends JpaRepository<ExperienceBooking, String> {

    List<ExperienceBooking> findByTouristIdOrderByCreatedAtDesc(String touristUserId);

    List<ExperienceBooking> findByHostIdOrderByCreatedAtDesc(String hostId);

    @Query("SELECT b FROM ExperienceBooking b WHERE b.host.user.id = :partnerUserId ORDER BY b.createdAt DESC")
    List<ExperienceBooking> findByPartnerUserIdOrderByCreatedAtDesc(@Param("partnerUserId") String partnerUserId);

    Optional<ExperienceBooking> findByBookingReference(String bookingReference);

    @Query("SELECT COUNT(b) FROM ExperienceBooking b WHERE b.status = 'COMPLETED'")
    long countCompletedBookings();
}
