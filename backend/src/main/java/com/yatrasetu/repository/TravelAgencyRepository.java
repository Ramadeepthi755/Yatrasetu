package com.yatrasetu.repository;

import com.yatrasetu.domain.TravelAgency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TravelAgencyRepository extends JpaRepository<TravelAgency, String> {
    List<TravelAgency> findByDestinationId(String destinationId);
}
