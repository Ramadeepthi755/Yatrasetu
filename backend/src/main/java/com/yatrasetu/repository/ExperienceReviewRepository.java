package com.yatrasetu.repository;

import com.yatrasetu.domain.ExperienceReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExperienceReviewRepository extends JpaRepository<ExperienceReview, String> {
    Optional<ExperienceReview> findByBookingId(String bookingId);
    List<ExperienceReview> findByHostIdOrderByCreatedAtDesc(String hostId);
    List<ExperienceReview> findByExperienceIdOrderByCreatedAtDesc(String experienceId);

    @Query("SELECT AVG(r.rating) FROM ExperienceReview r WHERE r.host.id = :hostId")
    Double calculateAverageRatingForHost(@Param("hostId") String hostId);

    @Query("SELECT r FROM ExperienceReview r WHERE r.host.user.id = :partnerUserId OR r.host.id = :partnerUserId ORDER BY r.createdAt DESC")
    List<ExperienceReview> findByPartnerUserIdOrderByCreatedAtDesc(@Param("partnerUserId") String partnerUserId);
}
