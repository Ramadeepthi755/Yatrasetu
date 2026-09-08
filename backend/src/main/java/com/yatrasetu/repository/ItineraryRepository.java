package com.yatrasetu.repository;

import com.yatrasetu.domain.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItineraryRepository extends JpaRepository<Itinerary, String> {

    List<Itinerary> findByTripIdOrderByDayNumberAsc(String tripId);
}
