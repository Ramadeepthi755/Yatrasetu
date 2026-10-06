package com.yatrasetu.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.ErrorResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.io.OutputStream;
import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimitingService rateLimitingService;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        
        String path = request.getRequestURI();
        String bucketType = resolveBucketType(path);

        if (bucketType != null) {
            String clientIdentifier = resolveClientIdentifier(request);

            if (!rateLimitingService.isAllowed(bucketType, clientIdentifier)) {
                sendRateLimitError(request, response);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveBucketType(String path) {
        if (path.startsWith("/api/v1/ai")) {
            return "ai";
        }
        if (path.startsWith("/api/v1/travel-connect/requests") || path.startsWith("/api/v1/travel-connect/connections") || path.contains("/messages")) {
            return "connect";
        }
        if (path.startsWith("/api/v1/auth")) {
            return "auth";
        }
        return null;
    }

    private String resolveClientIdentifier(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return "usr_" + principal.getUserId();
        }

        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return "ip_" + xForwardedFor.split(",")[0].trim();
        }

        return "ip_" + request.getRemoteAddr();
    }

    private void sendRateLimitError(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.TOO_MANY_REQUESTS.value())
                .error("Too Many Requests")
                .message("Rate limit exceeded for this endpoint. Please wait a moment before trying again.")
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();

        ApiResponse<ErrorResponse> apiResponse = ApiResponse.<ErrorResponse>builder()
                .success(false)
                .message("Rate limit exceeded")
                .data(error)
                .timestamp(Instant.now())
                .build();

        try (OutputStream out = response.getOutputStream()) {
            objectMapper.writeValue(out, apiResponse);
            out.flush();
        }
    }
}
