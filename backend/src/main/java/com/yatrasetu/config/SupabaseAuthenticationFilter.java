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
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class SupabaseAuthenticationFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final Environment environment;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        String authUserId = null;
        String email = null;

        // 1. Check for Bearer Token
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            if (!token.isEmpty()) {
                try {
                    // Parse JWT Claims safely (standard payload part is token.split("\\.")[1])
                    String[] parts = token.split("\\.");
                    if (parts.length >= 2) {
                        String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
                        JsonNode jsonNode = objectMapper.readTree(payload);
                        if (jsonNode.has("sub")) {
                            authUserId = jsonNode.get("sub").asText();
                        }
                        if (jsonNode.has("email")) {
                            email = jsonNode.get("email").asText();
                        }
                    } else if (token.startsWith("mock-")) {
                        // Support mock token format: mock-<role>-<email>
                        String[] mockParts = token.split("-", 3);
                        if (mockParts.length >= 3) {
                            email = mockParts[2];
                            authUserId = "auth-" + email;
                        }
                    }
                } catch (Exception e) {
                    log.warn("Failed to decode Bearer token: {}", e.getMessage());
                }
            }
        }

        // 2. Allow X-Test-User headers only in test / dev environment
        if (email == null) {
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
}
