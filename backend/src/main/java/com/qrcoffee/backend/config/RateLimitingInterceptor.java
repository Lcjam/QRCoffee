package com.qrcoffee.backend.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * API Rate Limiting 인터셉터
 * IP 주소별로 요청 횟수를 제한합니다.
 */
@Component
@Slf4j
public class RateLimitingInterceptor implements HandlerInterceptor {
    
    // IP별 요청 카운터 (시간 윈도우별)
    private final Map<String, RateLimitInfo> rateLimitMap = new ConcurrentHashMap<>();
    
    // Rate Limit 설정
    private static final int MAX_REQUESTS_PER_MINUTE = 100; // 분당 최대 요청 수
    private static final int MAX_REQUESTS_PER_HOUR = 1000;   // 시간당 최대 요청 수
    private static final long WINDOW_SIZE_MS = 60_000;      // 1분 윈도우
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 공개 엔드포인트는 Rate Limiting 적용 안 함
        String path = request.getRequestURI();
        if (path.startsWith("/api/health") || 
            path.startsWith("/actuator") ||
            path.startsWith("/swagger") ||
            path.startsWith("/api-docs")) {
            return true;
        }
        
        String clientIp = getClientIpAddress(request);
        
        // Rate Limit 체크
        if (!checkRateLimit(clientIp)) {
            log.warn("Rate limit 초과: IP={}, Path={}", clientIp, path);
            response.setStatus(429); // HTTP 429 Too Many Requests
            response.setContentType("application/json");
            try {
                response.getWriter().write("{\"error\":\"Too many requests. Please try again later.\"}");
            } catch (Exception e) {
                log.error("응답 작성 실패", e);
            }
            return false;
        }
        
        return true;
    }
    
    /**
     * Rate Limit 체크
     */
    private boolean checkRateLimit(String ipAddress) {
        RateLimitInfo info = rateLimitMap.computeIfAbsent(ipAddress, k -> new RateLimitInfo());
        
        long currentTime = System.currentTimeMillis();
        
        // 시간 윈도우가 지났으면 리셋
        if (currentTime - info.getWindowStartTime() > WINDOW_SIZE_MS) {
            info.reset();
        }
        
        // 분당 요청 수 체크
        if (info.getMinuteCount().get() >= MAX_REQUESTS_PER_MINUTE) {
            return false;
        }
        
        // 시간당 요청 수 체크
        if (info.getHourCount().get() >= MAX_REQUESTS_PER_HOUR) {
            return false;
        }
        
        // 카운터 증가
        info.getMinuteCount().incrementAndGet();
        info.getHourCount().incrementAndGet();
        
        return true;
    }
    
    /**
     * 클라이언트 IP 주소 추출
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    /**
     * Rate Limit 정보 클래스
     */
    private static class RateLimitInfo {
        private final AtomicInteger minuteCount = new AtomicInteger(0);
        private final AtomicInteger hourCount = new AtomicInteger(0);
        private long windowStartTime = System.currentTimeMillis();
        
        public AtomicInteger getMinuteCount() {
            return minuteCount;
        }
        
        public AtomicInteger getHourCount() {
            return hourCount;
        }
        
        public long getWindowStartTime() {
            return windowStartTime;
        }
        
        public void reset() {
            minuteCount.set(0);
            windowStartTime = System.currentTimeMillis();
        }
    }
}

