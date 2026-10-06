package com.yatrasetu.repository.intelligence;

import com.yatrasetu.domain.intelligence.GovernmentActionPriority;
import com.yatrasetu.domain.intelligence.GovernmentActionStatus;
import com.yatrasetu.domain.intelligence.TourismGovernmentAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourismGovernmentActionRepository extends JpaRepository<TourismGovernmentAction, String> {

    List<TourismGovernmentAction> findTop20ByOrderByCreatedAtDesc();

    List<TourismGovernmentAction> findByDestinationIdOrderByCreatedAtDesc(String destinationId);

    List<TourismGovernmentAction> findByStatusOrderByCreatedAtDesc(GovernmentActionStatus status);

    List<TourismGovernmentAction> findByPriorityOrderByCreatedAtDesc(GovernmentActionPriority priority);

    @Query("SELECT a FROM TourismGovernmentAction a LEFT JOIN FETCH a.destination d LEFT JOIN FETCH d.state LEFT JOIN FETCH a.user u ORDER BY a.createdAt DESC")
    List<TourismGovernmentAction> findAllWithDetails();

    @Query("SELECT a FROM TourismGovernmentAction a LEFT JOIN FETCH a.destination d LEFT JOIN FETCH d.state LEFT JOIN FETCH a.user u WHERE (:status IS NULL OR a.status = :status) AND (:priority IS NULL OR a.priority = :priority) ORDER BY a.createdAt DESC")
    List<TourismGovernmentAction> findByStatusAndPriorityFiltered(@Param("status") GovernmentActionStatus status, @Param("priority") GovernmentActionPriority priority);
}
