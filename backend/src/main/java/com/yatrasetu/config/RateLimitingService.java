package com.yatrasetu.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Iterator;
import java.util.LinkedList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class RateLimitingService {

    @Value("${app.rate-limit.enabled:true}")
    private boolean enabled = true;

    @Value("${app.rate-limit.ai-limit-per-minute:15}")
    private int aiLimitPerMinute = 15;

    @Value("${app.rate-limit.connect-limit-per-minute:30}")
    private int connectLimitPerMinute = 30;

    @Value("${app.rate-limit.auth-limit-per-minute:20}")
    private int authLimitPerMinute = 20;

    @Value("${app.rate-limit.public-limit-per-minute:120}")
    private int publicLimitPerMinute = 120;

    private final Map<String, LinkedList<Long>> requestWindows = new ConcurrentHashMap<>();

    public boolean isAllowed(String bucketType, String clientIdentifier) {
        if (!enabled) {
            return true;
        }

        int limit = switch (bucketType.toLowerCase()) {
            case "ai" -> aiLimitPerMinute;
            case "connect" -> connectLimitPerMinute;
            case "auth" -> authLimitPerMinute;
            default -> publicLimitPerMinute;
        };

        String cacheKey = bucketType + ":" + clientIdentifier;
        long now = System.currentTimeMillis();
        long windowStart = now - 60000L; // 1 minute sliding window

        LinkedList<Long> timestamps = requestWindows.computeIfAbsent(cacheKey, k -> new LinkedList<>());

        synchronized (timestamps) {
            // Evict expired timestamps outside the sliding 1-minute window
            Iterator<Long> iterator = timestamps.iterator();
            while (iterator.hasNext()) {
                if (iterator.next() < windowStart) {
                    iterator.remove();
                } else {
                    break;
                }
            }

            if (timestamps.size() >= limit) {
                log.warn("Rate limit exceeded for {} (limit: {}/min, current: {})", cacheKey, limit, timestamps.size());
                return false;
            }

            timestamps.add(now);
            return true;
        }
    }

    public void reset() {
        requestWindows.clear();
    }
}
