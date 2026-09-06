package com.yatrasetu.repository;

import com.yatrasetu.domain.HotelRoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HotelRoomTypeRepository extends JpaRepository<HotelRoomType, String> {

    List<HotelRoomType> findByHotelIdOrderByCreatedAtAsc(String hotelId);

    List<HotelRoomType> findByHotelIdAndIsActiveTrueOrderByCreatedAtAsc(String hotelId);

    @Query("SELECT r FROM HotelRoomType r WHERE r.hotel.id = :hotelId AND LOWER(TRIM(r.roomTypeName)) = LOWER(TRIM(:roomTypeName))")
    Optional<HotelRoomType> findByHotelIdAndNormalizedName(
            @Param("hotelId") String hotelId,
            @Param("roomTypeName") String roomTypeName
    );

    @Query("SELECT r FROM HotelRoomType r WHERE r.hotel.id = :hotelId AND LOWER(TRIM(r.roomTypeName)) = LOWER(TRIM(:roomTypeName)) AND r.id != :excludeId")
    Optional<HotelRoomType> findByHotelIdAndNormalizedNameExcluding(
            @Param("hotelId") String hotelId,
            @Param("roomTypeName") String roomTypeName,
            @Param("excludeId") String excludeId
    );

    long countByHotelId(String hotelId);
}
