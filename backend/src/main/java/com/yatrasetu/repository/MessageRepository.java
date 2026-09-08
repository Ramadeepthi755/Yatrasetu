package com.yatrasetu.repository;

import com.yatrasetu.domain.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, String> {

    List<Message> findByConnectionIdOrderByCreatedAtAsc(String connectionId);

    long countByReceiverIdAndReadAtIsNull(String receiverId);
}
