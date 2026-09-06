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

    void deleteByRoomTypeId(String roomTypeId);
}
