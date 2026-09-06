package com.yatrasetu.repository;

import com.yatrasetu.domain.HotelInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HotelInventoryRepository extends JpaRepository<HotelInventory, String> {

    List<HotelInventory> findByRoomTypeIdOrderByInventoryDateAsc(String roomTypeId);

    Optional<HotelInventory> findByRoomTypeIdAndInventoryDate(String roomTypeId, LocalDate inventoryDate);

    Optional<HotelInventory> findByRoomTypeIdAndInventoryDateIsNull(String roomTypeId);

    List<HotelInventory> findByRoomTypeIdInAndInventoryDateBetween(List<String> roomTypeIds, LocalDate startDate, LocalDate endDate);

    List<HotelInventory> findByRoomTypeIdInAndInventoryDateIsNull(List<String> roomTypeIds);

    List<HotelInventory> findByRoomTypeIdAndInventoryDateBetween(String roomTypeId, LocalDate startDate, LocalDate endDate);

    void deleteByRoomTypeId(String roomTypeId);
}
