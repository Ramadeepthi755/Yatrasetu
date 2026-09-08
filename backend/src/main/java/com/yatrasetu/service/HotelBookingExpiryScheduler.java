package com.yatrasetu.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.hotel.booking.expiry-scheduler.enabled", havingValue = "true", matchIfMissing = true)
public class HotelBookingExpiryScheduler {

    private final HotelBookingService bookingService;

    /**
     * Periodically sweeps stale PENDING_PAYMENT reservations that have exceeded their
     * expiration timestamp and safely releases their active room allocations.
     * Default run interval: every 60 seconds.
     */
    @Scheduled(fixedDelayString = "${app.hotel.booking.expiry-interval-ms:60000}")
    public void sweepExpiredBookings() {
        try {
            int count = bookingService.expirePendingBookings();
            if (count > 0) {
                log.info("HotelBookingExpiryScheduler: Processed and expired {} pending reservation(s).", count);
            }
        } catch (Exception e) {
            log.error("Error during hotel booking expiry sweep: {}", e.getMessage(), e);
        }
    }
}
