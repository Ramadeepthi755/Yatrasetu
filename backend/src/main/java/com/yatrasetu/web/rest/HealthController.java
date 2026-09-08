package com.yatrasetu.web.rest;

import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.HealthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    @GetMapping
    public ResponseEntity<ApiResponse<HealthResponse>> checkHealth() {
        HealthResponse health = HealthResponse.builder()
                .status("UP")
                .service("yatrasetu-backend")
                .version("1.0.0-PROTOTYPE")
                .environment(activeProfile)
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.ok(ApiResponse.ok("YatraSetu backend service is healthy and operational", health));
    }
}
