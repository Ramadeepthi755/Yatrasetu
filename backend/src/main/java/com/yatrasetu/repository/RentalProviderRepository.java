package com.yatrasetu.repository;

import com.yatrasetu.domain.RentalProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import java.util.List;

@Repository
public interface RentalProviderRepository extends JpaRepository<RentalProvider, String> {
    List<RentalProvider> findByDestinationId(String destinationId);

    @Query("SELECT rp.destination.id, COUNT(rp) FROM RentalProvider rp WHERE rp.destination IS NOT NULL GROUP BY rp.destination.id")
    List<Object[]> countRentalsByDestination();
}
