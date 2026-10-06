package com.yatrasetu.repository;

import com.yatrasetu.domain.State;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StateRepository extends JpaRepository<State, String> {

    List<State> findAllByOrderByStateNameAsc();

    List<State> findByRegionIgnoreCaseOrderByStateNameAsc(String region);

    @Query("SELECT s FROM State s WHERE LOWER(s.id) = LOWER(:id) OR LOWER(s.stateName) = LOWER(:id)")
    Optional<State> findByIdOrNameIgnoreCase(@Param("id") String id);

    @Query("SELECT s FROM State s WHERE LOWER(s.stateName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(s.region) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<State> searchStates(@Param("query") String query);
}
