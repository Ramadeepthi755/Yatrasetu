package com.yatrasetu.repository;

import com.yatrasetu.domain.FamousFood;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FamousFoodRepository extends JpaRepository<FamousFood, String> {
    List<FamousFood> findByDestinationId(String destinationId);
    List<FamousFood> findByDestinationIdAndIsVegetarian(String destinationId, Boolean isVegetarian);
}
