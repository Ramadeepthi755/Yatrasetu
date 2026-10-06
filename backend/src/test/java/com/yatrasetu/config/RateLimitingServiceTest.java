package com.yatrasetu.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimitingServiceTest {

    private RateLimitingService rateLimitingService;

    @BeforeEach
    void setUp() {
        rateLimitingService = new RateLimitingService();
        ReflectionTestUtils.setField(rateLimitingService, "enabled", true);
        ReflectionTestUtils.setField(rateLimitingService, "aiLimitPerMinute", 2);
        ReflectionTestUtils.setField(rateLimitingService, "connectLimitPerMinute", 1);
        ReflectionTestUtils.setField(rateLimitingService, "authLimitPerMinute", 1);
        ReflectionTestUtils.setField(rateLimitingService, "publicLimitPerMinute", 1);
    }

    @Test
    void allowsRequestsUntilBucketLimitThenRejects() {
        assertThat(rateLimitingService.isAllowed("ai", "client-1")).isTrue();
        assertThat(rateLimitingService.isAllowed("ai", "client-1")).isTrue();
        assertThat(rateLimitingService.isAllowed("ai", "client-1")).isFalse();
    }

    @Test
    void keepsDifferentClientsAndBucketsIndependent() {
        assertThat(rateLimitingService.isAllowed("connect", "client-1")).isTrue();
        assertThat(rateLimitingService.isAllowed("connect", "client-1")).isFalse();
        assertThat(rateLimitingService.isAllowed("connect", "client-2")).isTrue();
        assertThat(rateLimitingService.isAllowed("public", "client-1")).isTrue();
    }

    @Test
    void disabledLimiterAllowsEveryRequest() {
        ReflectionTestUtils.setField(rateLimitingService, "enabled", false);

        assertThat(rateLimitingService.isAllowed("auth", "client-1")).isTrue();
        assertThat(rateLimitingService.isAllowed("auth", "client-1")).isTrue();
        assertThat(rateLimitingService.isAllowed("auth", "client-1")).isTrue();
    }

    @Test
    void resetClearsExistingWindows() {
        assertThat(rateLimitingService.isAllowed("public", "client-1")).isTrue();
        assertThat(rateLimitingService.isAllowed("public", "client-1")).isFalse();

        rateLimitingService.reset();

        assertThat(rateLimitingService.isAllowed("public", "client-1")).isTrue();
    }
}
