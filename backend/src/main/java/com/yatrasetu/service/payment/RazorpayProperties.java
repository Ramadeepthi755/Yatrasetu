package com.yatrasetu.service.payment;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.razorpay")
@Getter
@Setter
public class RazorpayProperties {

    private boolean enabled = true;
    private String mode = "test";
    private String keyId = "";
    private String keySecret = "";
    private String webhookSecret = "";

    public boolean isConfigured() {
        return keyId != null && !keyId.isBlank() && keySecret != null && !keySecret.isBlank();
    }
}
