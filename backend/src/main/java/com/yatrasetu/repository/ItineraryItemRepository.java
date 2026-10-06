package com.yatrasetu.repository;

import com.yatrasetu.domain.ItineraryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItineraryItemRepository extends JpaRepository<ItineraryItem, String> {

    List<ItineraryItem> findByItineraryIdOrderByOrderIndexAsc(String itineraryId);

    List<ItineraryItem> findByPoiId(String poiId);
}
