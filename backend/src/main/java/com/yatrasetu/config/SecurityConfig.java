package com.yatrasetu.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.OutputStream;
import java.time.Instant;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final SupabaseAuthenticationFilter supabaseAuthenticationFilter;
    private final CorrelationIdFilter correlationIdFilter;
    private final RateLimitingFilter rateLimitingFilter;
    private final ObjectMapper objectMapper;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(authenticationEntryPoint())
                .accessDeniedHandler(accessDeniedHandler())
            )
            .authorizeHttpRequests(auth -> auth
                // Actuator Probes
                .requestMatchers("/actuator/health", "/actuator/health/**", "/actuator/info").permitAll()

                // Public Health & Discovery
                .requestMatchers("/api/v1/health/**").permitAll()
                .requestMatchers("/api/v1/public/**").permitAll()
                .requestMatchers("/api/v1/auth/sync").permitAll()
                .requestMatchers("/api/v1/states/**").permitAll()
                .requestMatchers("/api/v1/cities/**").permitAll()
                .requestMatchers("/api/v1/destinations/**").permitAll()
                .requestMatchers("/api/v1/pois/**").permitAll()
                .requestMatchers("/api/v1/hotels/**").permitAll()
                .requestMatchers("/api/v1/local/**").permitAll()
                .requestMatchers("/api/v1/experiences/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/travel-connect").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/travel-connect/destination/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/travel-connect/*").permitAll()
                .requestMatchers("/api/v1/search/**").permitAll()
                .requestMatchers("/api/v1/discovery/**").permitAll()
                .requestMatchers("/api/v1/ai/**").permitAll()
                .requestMatchers("/error").permitAll()

                // Partner Protected Routes
                .requestMatchers("/api/v1/partner/**").hasRole("PARTNER")

                // Government Protected Routes
                .requestMatchers("/api/v1/government/**").hasRole("GOVERNMENT")

                // Traveler Protected Trip Routes
                .requestMatchers("/api/v1/trips/**").hasRole("TRAVELER")

                // Traveler / Generic Profile Routes
                .requestMatchers("/api/v1/profile/**").authenticated()

                // All other API routes require authenticated session
                .requestMatchers("/api/v1/**").authenticated()
                .anyRequest().permitAll()
            )
            .addFilterBefore(correlationIdFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(supabaseAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterAfter(rateLimitingFilter, SupabaseAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        return (request, response, authException) -> {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            ErrorResponse error = ErrorResponse.builder()
                    .status(HttpStatus.UNAUTHORIZED.value())
                    .error("Unauthorized")
                    .message("Authentication required. Please provide a valid authentication token.")
                    .path(request.getRequestURI())
                    .timestamp(Instant.now())
                    .build();

            ApiResponse<ErrorResponse> apiResponse = ApiResponse.<ErrorResponse>builder()
                    .success(false)
                    .message("Authentication required")
                    .data(error)
                    .timestamp(Instant.now())
                    .build();

            OutputStream out = response.getOutputStream();
            objectMapper.writeValue(out, apiResponse);
            out.flush();
        };
    }

    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            ErrorResponse error = ErrorResponse.builder()
                    .status(HttpStatus.FORBIDDEN.value())
                    .error("Forbidden")
                    .message("Access denied. Your account role does not have permission for this resource.")
                    .path(request.getRequestURI())
                    .timestamp(Instant.now())
                    .build();

            ApiResponse<ErrorResponse> apiResponse = ApiResponse.<ErrorResponse>builder()
                    .success(false)
                    .message("Access denied")
                    .data(error)
                    .timestamp(Instant.now())
                    .build();

            OutputStream out = response.getOutputStream();
            objectMapper.writeValue(out, apiResponse);
            out.flush();
        };
    }
}
