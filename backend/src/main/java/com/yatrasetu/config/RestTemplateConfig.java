package com.yatrasetu.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class RestTemplateConfig {

    @Value("${app.gemini.connect-timeout-ms:5000}")
    private int geminiConnectTimeoutMs;

    @Value("${app.gemini.read-timeout-ms:15000}")
    private int geminiReadTimeoutMs;

    @Value("${app.open-meteo.connect-timeout-ms:3000}")
    private int openMeteoConnectTimeoutMs;

    @Value("${app.open-meteo.read-timeout-ms:5000}")
    private int openMeteoReadTimeoutMs;

    @Bean
    @Primary
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofMillis(5000))
                .setReadTimeout(Duration.ofMillis(10000))
                .build();
    }

    @Bean(name = "geminiRestTemplate")
    public RestTemplate geminiRestTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofMillis(geminiConnectTimeoutMs))
                .setReadTimeout(Duration.ofMillis(geminiReadTimeoutMs))
                .build();
    }

    @Bean(name = "openMeteoRestTemplate")
    public RestTemplate openMeteoRestTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofMillis(openMeteoConnectTimeoutMs))
                .setReadTimeout(Duration.ofMillis(openMeteoReadTimeoutMs))
                .build();
    }
}
