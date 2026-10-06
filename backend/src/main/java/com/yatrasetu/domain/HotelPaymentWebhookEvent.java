package com.yatrasetu.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "hotel_payment_webhook_events")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelPaymentWebhookEvent {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "event_id", length = 100, nullable = false, unique = true)
    private String eventId;

    @Column(name = "event_type", length = 100, nullable = false)
    private String eventType;

    @Column(name = "provider", length = 50, nullable = false)
    @Builder.Default
    private String provider = "RAZORPAY";

    @Column(name = "payload_hash", length = 64)
    private String payloadHash;

    @Column(name = "status", length = 50, nullable = false)
    @Builder.Default
    private String status = "PROCESSED";

    @Column(name = "processed_at", nullable = false)
    @Builder.Default
    private Instant processedAt = Instant.now();
}
