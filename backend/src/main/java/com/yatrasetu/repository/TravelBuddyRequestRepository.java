package com.yatrasetu.repository;

import com.yatrasetu.domain.TravelBuddyRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TravelBuddyRequestRepository extends JpaRepository<TravelBuddyRequest, String> {

    List<TravelBuddyRequest> findByReceiverIdOrderByCreatedAtDesc(String receiverId);

    List<TravelBuddyRequest> findBySenderIdOrderByCreatedAtDesc(String senderId);

    @Query("""
        SELECT r FROM TravelBuddyRequest r
        WHERE (r.sender.id = :userId OR r.receiver.id = :userId)
          AND r.status = 'ACCEPTED'
        ORDER BY r.updatedAt DESC
    """)
    List<TravelBuddyRequest> findAcceptedConnectionsForUser(@Param("userId") String userId);

    @Query("""
        SELECT r FROM TravelBuddyRequest r
        WHERE ((r.sender.id = :u1 AND r.receiver.id = :u2) OR (r.sender.id = :u2 AND r.receiver.id = :u1))
          AND r.status IN ('PENDING', 'ACCEPTED', 'BLOCKED')
    """)
    List<TravelBuddyRequest> findActiveRequestsBetween(@Param("u1") String u1, @Param("u2") String u2);

    @Query("""
        SELECT r FROM TravelBuddyRequest r
        WHERE ((r.sender.id = :u1 AND r.receiver.id = :u2) OR (r.sender.id = :u2 AND r.receiver.id = :u1))
        ORDER BY r.createdAt DESC
    """)
    List<TravelBuddyRequest> findAllRequestsBetween(@Param("u1") String u1, @Param("u2") String u2);

    @Query("""
        SELECT r FROM TravelBuddyRequest r
        WHERE r.id = :connectionId
          AND (r.sender.id = :userId OR r.receiver.id = :userId)
          AND r.status = 'ACCEPTED'
    """)
    Optional<TravelBuddyRequest> findAcceptedConnectionByIdAndUser(@Param("connectionId") String connectionId, @Param("userId") String userId);
}
