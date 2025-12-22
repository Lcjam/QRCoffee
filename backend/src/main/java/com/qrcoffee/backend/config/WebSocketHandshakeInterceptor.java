package com.qrcoffee.backend.config;

import com.qrcoffee.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * WebSocket 핸드셰이크 시 JWT 토큰 검증을 수행하는 인터셉터
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketHandshakeInterceptor implements HandshakeInterceptor {
    
    private final JwtUtil jwtUtil;
    
    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        
        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
            HttpServletRequest httpRequest = servletRequest.getServletRequest();
            
            String requestPath = httpRequest.getRequestURI();
            
            // 관리자용 WebSocket은 토큰 검증 필수
            if (requestPath.contains("/ws/admin")) {
                return validateAdminConnection(httpRequest, response, attributes);
            }
            // 고객용 WebSocket은 orderId 기반 검증 (토큰 선택적)
            else if (requestPath.contains("/ws/customer")) {
                return validateCustomerConnection(httpRequest, response, attributes);
            }
            
            // 알 수 없는 경로는 거부
            log.warn("WebSocket 연결 거부: 알 수 없는 경로. URI: {}", request.getURI());
            response.setStatusCode(org.springframework.http.HttpStatus.BAD_REQUEST);
            return false;
        }
        
        return false;
    }
    
    /**
     * 관리자용 WebSocket 연결 검증 (토큰 필수)
     */
    private boolean validateAdminConnection(HttpServletRequest request, 
                                            ServerHttpResponse response,
                                            Map<String, Object> attributes) {
        String token = extractTokenFromRequest(request);
        
        if (!StringUtils.hasText(token)) {
            log.warn("관리자 WebSocket 연결 거부: 토큰이 없습니다.");
            response.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
            return false;
        }
        
        try {
            // 토큰 검증
            String email = jwtUtil.getEmailFromToken(token);
            if (!StringUtils.hasText(email) || !jwtUtil.isTokenValid(token, email)) {
                log.warn("관리자 WebSocket 연결 거부: 유효하지 않은 토큰.");
                response.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
                return false;
            }
            
            // 사용자 정보를 attributes에 저장
            Long userId = jwtUtil.getUserIdFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);
            Long storeId = jwtUtil.getStoreIdFromToken(token);
            
            attributes.put("userId", userId);
            attributes.put("userEmail", email);
            attributes.put("userRole", role);
            attributes.put("storeId", storeId);
            
            // IP 주소 저장 (Rate Limiting용)
            String clientIp = getClientIpAddress(request);
            attributes.put("clientIp", clientIp);
            
            log.debug("관리자 WebSocket 연결 허용: {} (역할: {}, 매장: {})", email, role, storeId);
            return true;
            
        } catch (Exception e) {
            log.error("관리자 WebSocket 토큰 검증 실패: {}", e.getMessage());
            response.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
            return false;
        }
    }
    
    /**
     * 고객용 WebSocket 연결 검증 (orderId 기반, 토큰 선택적)
     * 고객은 로그인하지 않을 수 있으므로 토큰이 없어도 허용
     * 단, orderId는 필수 (나중에 구독 시 검증 가능)
     */
    private boolean validateCustomerConnection(HttpServletRequest request,
                                               ServerHttpResponse response,
                                               Map<String, Object> attributes) {
        // 토큰이 있으면 검증 (선택적)
        String token = extractTokenFromRequest(request);
        if (StringUtils.hasText(token)) {
            try {
                String email = jwtUtil.getEmailFromToken(token);
                if (jwtUtil.isTokenValid(token, email)) {
                    Long userId = jwtUtil.getUserIdFromToken(token);
                    attributes.put("userId", userId);
                    attributes.put("userEmail", email);
                    log.debug("고객 WebSocket 연결 (인증됨): {}", email);
                }
            } catch (Exception e) {
                log.warn("고객 WebSocket 토큰 검증 실패 (무시): {}", e.getMessage());
                // 토큰 검증 실패해도 연결은 허용 (고객은 로그인하지 않을 수 있음)
            }
        }
        
        // IP 주소 저장 (Rate Limiting용)
        String clientIp = getClientIpAddress(request);
        attributes.put("clientIp", clientIp);
        
        // orderId는 나중에 구독 시 검증
        log.debug("고객 WebSocket 연결 허용 (토큰 없음)");
        return true;
    }
    
    /**
     * 클라이언트 IP 주소 추출
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        
        // X-Forwarded-For는 여러 IP가 있을 수 있으므로 첫 번째 IP 사용
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        
        return ip != null ? ip : "unknown";
    }
    
    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                WebSocketHandler wsHandler, Exception exception) {
        // 핸드셰이크 완료 후 처리 (필요시)
    }
    
    /**
     * HTTP 요청에서 JWT 토큰 추출
     * STOMP connectHeaders의 Authorization 헤더에서만 토큰을 가져옴
     * 보안상 query parameter는 완전히 제거 (PCI-DSS 준수, 로그/브라우저 히스토리 노출 방지)
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        // Authorization 헤더에서만 토큰 확인 (STOMP connectHeaders 사용)
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        
        // Query parameter는 보안상 완전히 제거됨
        // PCI-DSS 및 보안 모범 사례 준수
        
        return null;
    }
}
