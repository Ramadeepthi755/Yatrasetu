package com.yatrasetu.repository;

import com.yatrasetu.domain.GuideApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GuideApplicationRepository extends JpaRepository<GuideApplication, String> {
    Optional<GuideApplication> findByUserId(String userId);
    List<GuideApplication> findByStatusOrderBySubmittedAtDesc(String status);
    List<GuideApplication> findAllByOrderBySubmittedAtDesc();
}
