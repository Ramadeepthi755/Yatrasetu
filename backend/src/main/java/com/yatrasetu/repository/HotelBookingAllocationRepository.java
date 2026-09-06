package com.yatrasetu.repository;

import com.yatrasetu.domain.BookingAllocationStatus;
import com.yatrasetu.domain.HotelBookingAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HotelBookingAllocationRepository extends JpaRepository<HotelBookingAllocation, String> {

    List<HotelBookingAllocation> findByBookingId(String bookingId);

    @Query("SELECT a.roomType.id, a.allocationDate, SUM(a.allocatedUnits) " +
           "FROM HotelBookingAllocation a " +
           "WHERE a.roomType.id IN :roomTypeIds " +
           "AND a.allocationDate BETWEEN :startDate AND :endDate " +
           "AND a.status = :status " +
           "GROUP BY a.roomType.id, a.allocationDate")
    List<Object[]> findActiveReservedUnitsByRoomTypeIdsAndDateRange(
            @Param("roomTypeIds") List<String> roomTypeIds,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("status") BookingAllocationStatus status);

    @Query("SELECT a.allocationDate, SUM(a.allocatedUnits) " +
           "FROM HotelBookingAllocation a " +
           "WHERE a.roomType.id = :roomTypeId " +
           "AND a.allocationDate BETWEEN :startDate AND :endDate " +
           "AND a.status = :status " +
           "GROUP BY a.allocationDate")
    List<Object[]> findActiveReservedUnitsByRoomTypeIdAndDateRange(
            @Param("roomTypeId") String roomTypeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("status") BookingAllocationStatus status);

    @Modifying
    @Query("UPDATE HotelBookingAllocation a SET a.status = :newStatus WHERE a.booking.id = :bookingId AND a.status = :oldStatus")
    int updateAllocationStatusByBookingId(
            @Param("bookingId") String bookingId,
            @Param("oldStatus") BookingAllocationStatus oldStatus,
            @Param("newStatus") BookingAllocationStatus newStatus);
}
