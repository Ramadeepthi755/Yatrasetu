package com.yatrasetu.repository;

import com.yatrasetu.domain.HotelPaymentWebhookEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HotelPaymentWebhookEventRepository extends JpaRepository<HotelPaymentWebhookEvent, String> {

    boolean existsByEventId(String eventId);

    Optional<HotelPaymentWebhookEvent> findByEventId(String eventId);
}
