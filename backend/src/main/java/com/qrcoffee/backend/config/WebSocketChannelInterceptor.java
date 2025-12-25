package com.qrcoffee.backend.config;

import com.qrcoffee.backend.common.Constants;
import com.qrcoffee.backend.entity.Order;
import com.qrcoffee.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

/**
 * WebSocket Rate Limiting 및 연결 관리 인터셉터
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketChannelInterceptor implements ChannelInterceptor {
    
    private final OrderRepository orderRepository;
    
    // IP별 연결 수 추적
    private final Map<String, AtomicInteger> connectionCounts = new ConcurrentHashMap<>();
    private final Map<String, Long> lastConnectionTime = new ConcurrentHashMap<>();
    
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null && accessor.getCommand() == StompCommand.CONNECT) {
            String sessionId = accessor.getSessionId();
            String ipAddress = getClientIpAddress(accessor);
            
            // Rate Limiting 체크
            if (!checkRateLimit(ipAddress)) {
                log.warn("WebSocket 연결 거부: Rate limit 초과. IP: {}", ipAddress);
                return null; // 연결 거부
            }
            
            // 연결 수 제한 체크
            if (!checkConnectionLimit(ipAddress)) {
                log.warn("WebSocket 연결 거부: 최대 연결 수 초과. IP: {}", ipAddress);
                return null; // 연결 거부
            }
            
            // 연결 수 증가
            connectionCounts.computeIfAbsent(ipAddress, k -> new AtomicInteger(0)).incrementAndGet();
            lastConnectionTime.put(ipAddress, System.currentTimeMillis());
            
            log.debug("WebSocket 연결 허용: IP={}, Session={}, Connections={}", 
                    ipAddress, sessionId, connectionCounts.get(ipAddress).get());
        }
        
        // SUBSCRIBE 명령어에 대한 권한 검증
        if (accessor != null && accessor.getCommand() == StompCommand.SUBSCRIBE) {
            if (!validateSubscribePermission(accessor)) {
                log.warn("WebSocket 구독 거부: 권한 없음. Destination: {}", accessor.getDestination());
                return null; // 구독 거부
            }
        }
        
        if (accessor != null && accessor.getCommand() == StompCommand.DISCONNECT) {
            String ipAddress = getClientIpAddress(accessor);
            AtomicInteger count = connectionCounts.get(ipAddress);
            if (count != null && count.decrementAndGet() <= 0) {
                connectionCounts.remove(ipAddress);
                lastConnectionTime.remove(ipAddress);
            }
        }
        
        return message;
    }
    
    /**
     * SUBSCRIBE 권한 검증
     * 관리자 채널: storeId 일치 확인
     * 고객 채널: orderId 소유권 확인
     */
    private boolean validateSubscribePermission(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination == null) {
            return false;
        }
        
        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
        if (sessionAttributes == null) {
            return false;
        }
        
        // 관리자 채널 구독 검증: /topic/admin/{storeId}
        if (destination.startsWith("/topic/admin/")) {
            Long userStoreId = (Long) sessionAttributes.get("storeId");
            if (userStoreId == null) {
                log.warn("관리자 채널 구독 거부: storeId 없음");
                return false;
            }
            
            try {
                String storeIdStr = destination.substring("/topic/admin/".length());
                Long targetStoreId = Long.parseLong(storeIdStr);
                
                if (!userStoreId.equals(targetStoreId)) {
                    log.warn("관리자 채널 구독 거부: storeId 불일치. User: {}, Target: {}", 
                            userStoreId, targetStoreId);
                    return false;
                }
                
                return true;
            } catch (NumberFormatException e) {
                log.warn("관리자 채널 구독 거부: 잘못된 storeId 형식. Destination: {}", destination);
                return false;
            }
        }
        
        // 고객 채널 구독 검증: /topic/customer/{orderId}
        if (destination.startsWith("/topic/customer/")) {
            try {
                String orderIdStr = destination.substring("/topic/customer/".length());
                Long orderId = Long.parseLong(orderIdStr);
                
                // 주문 조회
                Order order = orderRepository.findById(orderId).orElse(null);
                if (order == null) {
                    log.warn("고객 채널 구독 거부: 주문이 존재하지 않음. OrderId: {}", orderId);
                    return false;
                }
                
                // 접근 토큰 검증 (STOMP 헤더에서 토큰 추출)
                String providedToken = extractAccessTokenFromHeaders(accessor);
                if (providedToken == null || !order.getAccessToken().equals(providedToken)) {
                    log.warn("고객 채널 구독 거부: 접근 토큰 불일치 또는 없음. OrderId: {}", orderId);
                    return false;
                }
                
                log.debug("고객 채널 구독 허용: OrderId={}", orderId);
                return true;
            } catch (NumberFormatException e) {
                log.warn("고객 채널 구독 거부: 잘못된 orderId 형식. Destination: {}", destination);
                return false;
            }
        }
        
        // 알 수 없는 채널은 거부
        log.warn("WebSocket 구독 거부: 알 수 없는 채널. Destination: {}", destination);
        return false;
    }
    
    /**
     * Rate Limiting 체크 (1초당 1개 연결)
     */
    private boolean checkRateLimit(String ipAddress) {
        Long lastTime = lastConnectionTime.get(ipAddress);
        if (lastTime != null) {
            long timeSinceLastConnection = System.currentTimeMillis() - lastTime;
            if (timeSinceLastConnection < CONNECTION_RATE_LIMIT_MS) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * 연결 수 제한 체크
     */
    private boolean checkConnectionLimit(String ipAddress) {
        AtomicInteger count = connectionCounts.get(ipAddress);
        if (count != null && count.get() >= Constants.WebSocket.MAX_CONNECTIONS_PER_IP) {
            return false;
        }
        return true;
    }
    
    /**
     * 클라이언트 IP 주소 추출
     */
    private String getClientIpAddress(StompHeaderAccessor accessor) {
        // HandshakeInterceptor에서 저장한 IP 주소 사용
        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
        if (sessionAttributes != null) {
            Object ip = sessionAttributes.get("clientIp");
            if (ip != null) {
                return ip.toString();
            }
        }
        
        return "unknown";
    }
    
    /**
     * 주기적으로 오래된 연결 정보 정리 (메모리 누수 방지)
     * 부수 효과를 제거하고 경쟁 상태를 방지하기 위해 읽기와 쓰기를 분리
     */
    @org.springframework.scheduling.annotation.Scheduled(fixedRate = CLEANUP_INTERVAL_MS)
    public void cleanupOldConnections() {
        long currentTime = System.currentTimeMillis();
        
        // 1단계: 제거할 IP 목록 수집 (읽기만 수행, 부수 효과 없음)
        List<String> ipsToRemove = connectionCounts.entrySet().stream()
                .filter(entry -> {
                    Long lastTime = lastConnectionTime.get(entry.getKey());
                    return lastTime != null && 
                           (currentTime - lastTime) > Constants.WebSocket.CONNECTION_TIMEOUT_MS;
                })
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
        
        // 2단계: 수집된 IP들을 각 맵에서 제거 (명확한 쓰기 작업)
        for (String ip : ipsToRemove) {
            connectionCounts.remove(ip);
            lastConnectionTime.remove(ip);
            log.debug("오래된 연결 정보 정리: IP={}", ip);
        }
        
        if (!ipsToRemove.isEmpty()) {
            log.info("오래된 연결 정보 정리 완료: {}개 IP 제거", ipsToRemove.size());
        }
    }
    
    /**
     * STOMP 헤더에서 접근 토큰 추출
     */
    private String extractAccessTokenFromHeaders(StompHeaderAccessor accessor) {
        // STOMP 헤더에서 accessToken 추출
        List<String> tokens = accessor.getNativeHeader("accessToken");
        if (tokens != null && !tokens.isEmpty()) {
            return tokens.get(0);
        }
        return null;
    }
}

