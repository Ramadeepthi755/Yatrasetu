package com.yatrasetu.repository;

import com.yatrasetu.domain.HotelRatePlan;
import com.yatrasetu.domain.MealPlan;
import com.yatrasetu.domain.RatePlanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRatePlanRepository extends JpaRepository<HotelRatePlan, String> {

    List<HotelRatePlan> findByRoomTypeIdOrderByCreatedAtAsc(String roomTypeId);

    List<HotelRatePlan> findByRoomTypeIdAndStatusOrderByCreatedAtAsc(String roomTypeId, RatePlanStatus status);

    @Query("SELECT r FROM HotelRatePlan r WHERE r.roomType.id IN :roomTypeIds AND r.status = :status ORDER BY r.basePrice ASC")
    List<HotelRatePlan> findByRoomTypeIdInAndStatus(
            @Param("roomTypeIds") List<String> roomTypeIds,
            @Param("status") RatePlanStatus status
    );

    List<HotelRatePlan> findByRoomTypeIdAndMealPlanAndStatus(
            String roomTypeId,
            MealPlan mealPlan,
            RatePlanStatus status
    );

    @Modifying
    @Query("DELETE FROM HotelRatePlan r WHERE r.roomType.id = :roomTypeId")
    void deleteByRoomTypeId(@Param("roomTypeId") String roomTypeId);
}
