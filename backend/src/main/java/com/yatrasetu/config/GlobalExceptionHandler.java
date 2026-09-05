package com.yatrasetu.config;

import com.yatrasetu.web.dto.ApiResponse;
import com.yatrasetu.web.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleValidationExceptions(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = error instanceof FieldError fe ? fe.getField() : error.getObjectName();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Failed")
                .message("One or more request fields failed validation")
                .path(request.getRequestURI())
                .validationErrors(errors)
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiResponse.<ErrorResponse>builder()
                        .success(false)
                        .message("Validation failed")
                        .data(errorResponse)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class, HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ApiResponse<ErrorResponse>> handleBadRequest(
            Exception ex, HttpServletRequest request) {
        
        log.warn("Bad request on {}: {}", request.getRequestURI(), ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(ex.getMessage() != null ? ex.getMessage() : "Invalid request parameters or payload")
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiResponse.<ErrorResponse>builder()
                        .success(false)
                        .message(errorResponse.getMessage())
                        .data(errorResponse)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @ExceptionHandler({ResourceNotFoundException.class, NoResourceFoundException.class})
    public ResponseEntity<ApiResponse<ErrorResponse>> handleNotFound(
            Exception ex, HttpServletRequest request) {
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(HttpStatus.NOT_FOUND.value())
                .error("Not Found")
                .message(ex.getMessage() != null ? ex.getMessage() : "The requested resource was not found")
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse.<ErrorResponse>builder()
                        .success(false)
                        .message(errorResponse.getMessage())
                        .data(errorResponse)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @ExceptionHandler(TooManyRequestsException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleTooManyRequests(
            TooManyRequestsException ex, HttpServletRequest request) {
        
        log.warn("Rate limit triggered on {}: {}", request.getRequestURI(), ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(HttpStatus.TOO_MANY_REQUESTS.value())
                .error("Too Many Requests")
                .message(ex.getMessage() != null ? ex.getMessage() : "Rate limit exceeded. Please wait a moment before trying again.")
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(
                ApiResponse.<ErrorResponse>builder()
                        .success(false)
                        .message(errorResponse.getMessage())
                        .data(errorResponse)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleAccessDenied(
            org.springframework.security.access.AccessDeniedException ex, HttpServletRequest request) {

        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(HttpStatus.FORBIDDEN.value())
                .error("Forbidden")
                .message(ex.getMessage() != null ? ex.getMessage() : "Access denied")
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                ApiResponse.<ErrorResponse>builder()
                        .success(false)
                        .message(ex.getMessage() != null ? ex.getMessage() : "Access denied")
                        .data(errorResponse)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleGeneralException(
            Exception ex, HttpServletRequest request) {
        
        // Log real stack trace securely internally
        log.error("Internal Server Error on {}: ", request.getRequestURI(), ex);

        // Sanitize response to prevent leaking internal database schema, SQL errors, or stack traces
        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message("An unexpected error occurred. Please try again later.")
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.<ErrorResponse>builder()
                        .success(false)
                        .message("Internal server error")
                        .data(errorResponse)
                        .timestamp(Instant.now())
                        .build()
        );
    }
}
