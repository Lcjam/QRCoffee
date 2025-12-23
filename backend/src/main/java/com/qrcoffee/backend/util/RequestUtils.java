package com.qrcoffee.backend.util;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * HTTP 요청 관련 유틸리티 클래스
 */
@Slf4j
@Component
public class RequestUtils {
    
    /**
     * HttpServletRequest에서 storeId 추출
     * JwtAuthenticationFilter에서 설정한 attribute 사용
     */
    public static Long getStoreId(HttpServletRequest request) {
        Object storeId = request.getAttribute("storeId");
        if (storeId instanceof Long) {
            return (Long) storeId;
        }
        return null;
    }
    
    /**
     * HttpServletRequest에서 userId 추출
     */
    public static Long getUserId(HttpServletRequest request) {
        Object userId = request.getAttribute("userId");
        if (userId instanceof Long) {
            return (Long) userId;
        }
        return null;
    }
    
    /**
     * HttpServletRequest에서 userEmail 추출
     */
    public static String getUserEmail(HttpServletRequest request) {
        Object email = request.getAttribute("userEmail");
        if (email instanceof String) {
            return (String) email;
        }
        return null;
    }
    
    /**
     * HttpServletRequest에서 userRole 추출
     */
    public static String getUserRole(HttpServletRequest request) {
        Object role = request.getAttribute("userRole");
        if (role instanceof String) {
            return (String) role;
        }
        return null;
    }
    
    /**
     * 클라이언트 IP 주소 추출
     * 프록시 환경을 고려하여 X-Forwarded-For, X-Real-IP 헤더 확인
     */
    public static String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}
