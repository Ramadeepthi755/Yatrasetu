package com.yatrasetu.repository.intelligence;

import com.yatrasetu.domain.intelligence.TourismGovernmentAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourismGovernmentActionRepository extends JpaRepository<TourismGovernmentAction, String> {

    List<TourismGovernmentAction> findTop20ByOrderByCreatedAtDesc();

    List<TourismGovernmentAction> findByDestinationIdOrderByCreatedAtDesc(String destinationId);
}
