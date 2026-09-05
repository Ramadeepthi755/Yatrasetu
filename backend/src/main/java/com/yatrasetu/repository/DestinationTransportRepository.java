package com.yatrasetu.repository;

import com.yatrasetu.domain.DestinationTransport;
import com.yatrasetu.domain.TransportMode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DestinationTransportRepository extends JpaRepository<DestinationTransport, String> {
    List<DestinationTransport> findByDestinationId(String destinationId);
    List<DestinationTransport> findByDestinationIdAndMode(String destinationId, TransportMode mode);
}
