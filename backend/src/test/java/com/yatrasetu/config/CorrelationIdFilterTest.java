package com.yatrasetu.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.slf4j.MDC;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class CorrelationIdFilterTest {

    private final CorrelationIdFilter correlationIdFilter = new CorrelationIdFilter();

    @AfterEach
    void clearMdc() {
        MDC.clear();
    }

    @Test
    void preservesProvidedRequestIdAndCleansMdcAfterChain() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain filterChain = mock(FilterChain.class);
        when(request.getHeader(CorrelationIdFilter.CORRELATION_ID_HEADER)).thenReturn("  request-123  ");

        doAnswer(invocation -> {
            assertThat(MDC.get(CorrelationIdFilter.CORRELATION_ID_MDC_KEY)).isEqualTo("request-123");
            return null;
        }).when(filterChain).doFilter(request, response);

        correlationIdFilter.doFilterInternal(request, response, filterChain);

        verify(response).setHeader(CorrelationIdFilter.CORRELATION_ID_HEADER, "request-123");
        assertThat(MDC.get(CorrelationIdFilter.CORRELATION_ID_MDC_KEY)).isNull();
    }

    @Test
    void generatesRequestIdWhenHeaderIsBlank() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain filterChain = mock(FilterChain.class);
        when(request.getHeader(CorrelationIdFilter.CORRELATION_ID_HEADER)).thenReturn(" ");

        correlationIdFilter.doFilterInternal(request, response, filterChain);

        ArgumentCaptor<String> requestIdCaptor = ArgumentCaptor.forClass(String.class);
        verify(response).setHeader(eq(CorrelationIdFilter.CORRELATION_ID_HEADER), requestIdCaptor.capture());
        assertThat(requestIdCaptor.getValue()).matches("[0-9a-f]{8}");
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void cleansMdcWhenFilterChainThrows() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain filterChain = mock(FilterChain.class);
        when(request.getHeader(CorrelationIdFilter.CORRELATION_ID_HEADER)).thenReturn("request-error");
        doThrow(new IOException("chain failed")).when(filterChain).doFilter(request, response);

        try {
            correlationIdFilter.doFilterInternal(request, response, filterChain);
        } catch (IOException exception) {
            assertThat(exception).hasMessage("chain failed");
        }

        assertThat(MDC.get(CorrelationIdFilter.CORRELATION_ID_MDC_KEY)).isNull();
    }
}
