package com.yatrasetu.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yatrasetu.domain.Role;
import com.yatrasetu.domain.User;
import com.yatrasetu.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class SupabaseAuthenticationFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final Environment environment;

    @Value("${app.supabase.jwt-secret:}")
    private String jwtSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        String authUserId = null;
        String email = null;
        boolean isDevOrTest = environment.acceptsProfiles(Profiles.of("dev", "test", "default"));

        // 1. Check for Bearer Token
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            if (!token.isEmpty()) {
                try {
                    if (token.startsWith("mock-")) {
                        // Profile-gated: Mock tokens strictly forbidden in production
                        if (isDevOrTest) {
                            String[] mockParts = token.split("-", 3);
                            if (mockParts.length >= 3) {
                                email = mockParts[2];
                                authUserId = "auth-" + email;
                            }
                        } else {
                            log.warn("Mock token rejected in production profile: {}", request.getRequestURI());
                        }
                    } else {
                        // Validate JWT Structure & Claims
                        String[] parts = token.split("\\.");
                        if (parts.length == 3) {
                            String headerStr = parts[0];
                            String payloadStr = parts[1];
                            String signatureStr = parts[2];

                            // Cryptographic Signature Verification if secret is configured
                            boolean isSignatureValid = true;
                            if (jwtSecret != null && !jwtSecret.trim().isEmpty()) {
                                isSignatureValid = verifyHmacSha256(headerStr + "." + payloadStr, signatureStr, jwtSecret);
                            }

                            if (!isSignatureValid) {
                                log.warn("JWT signature verification failed for token on {}", request.getRequestURI());
                            } else {
                                String payload = new String(Base64.getUrlDecoder().decode(payloadStr), StandardCharsets.UTF_8);
                                JsonNode jsonNode = objectMapper.readTree(payload);

                                // Check Expiration (exp claim in epoch seconds)
                                boolean isExpired = false;
                                if (jsonNode.has("exp")) {
                                    long expSeconds = jsonNode.get("exp").asLong();
                                    if (expSeconds > 0 && expSeconds < Instant.now().getEpochSecond()) {
                                        isExpired = true;
                                        log.warn("JWT token has expired (exp: {}) for request {}", expSeconds, request.getRequestURI());
                                    }
                                }

                                if (!isExpired) {
                                    if (jsonNode.has("sub")) {
                                        authUserId = jsonNode.get("sub").asText();
                                    }
                                    if (jsonNode.has("email")) {
                                        email = jsonNode.get("email").asText();
                                    }
                                }
                            }
                        }
                    }
                } catch (Exception e) {
                    log.warn("Failed to decode/validate Bearer token: {}", e.getMessage());
                }
            }
        }

        // 2. Allow X-Test-User headers ONLY in test / dev environment
        if (email == null && isDevOrTest) {
            String testEmail = request.getHeader("X-Test-User-Email");
            if (testEmail != null && !testEmail.trim().isEmpty()) {
                email = testEmail.trim();
                authUserId = "auth-" + email;
            }
        }

        // 3. Resolve authenticated application user and set SecurityContext
        if (email != null || authUserId != null) {
            Optional<User> userOpt = Optional.empty();
            if (authUserId != null) {
                userOpt = userRepository.findByAuthUserId(authUserId);
            }
            if (userOpt.isEmpty() && email != null) {
                userOpt = userRepository.findByEmail(email);
            }

            if (userOpt.isPresent()) {
                User user = userOpt.get();
                UserPrincipal principal = UserPrincipal.builder()
                        .userId(user.getId())
                        .authUserId(user.getAuthUserId())
                        .email(user.getEmail())
                        .role(user.getRole()) // ROLE IS TRUSTED FROM SERVER DB
                        .build();

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean verifyHmacSha256(String data, String signature, String secret) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            hmac.init(secretKey);
            byte[] rawHmac = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            String computedSig = Base64.getUrlEncoder().withoutPadding().encodeToString(rawHmac);
            return MessageDigest.isEqual(computedSig.getBytes(StandardCharsets.UTF_8), signature.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            log.error("Error during HMAC-SHA256 signature verification: {}", e.getMessage());
            return false;
        }
    }
}
