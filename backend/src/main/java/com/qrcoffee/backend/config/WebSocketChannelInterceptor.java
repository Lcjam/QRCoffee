package com.qrcoffee.backend.config;

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

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

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
    
    // Rate Limiting 설정
    private static final int MAX_CONNECTIONS_PER_IP = 5;
    private static final long CONNECTION_RATE_LIMIT_MS = 1000; // 1초당 1개 연결
    private static final long CONNECTION_TIMEOUT_MS = 300000; // 5분 타임아웃
    private static final long CLEANUP_INTERVAL_MS = 600000; // 10분마다 정리
    
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
                
                // orderId로 주문 조회하여 존재 여부 확인
                // 실제 소유권 검증은 주문 생성 시 제공된 QR 코드나 세션 정보로 확인해야 함
                // 여기서는 최소한 주문이 존재하는지만 확인
                boolean orderExists = orderRepository.findById(orderId).isPresent();
                if (!orderExists) {
                    log.warn("고객 채널 구독 거부: 주문이 존재하지 않음. OrderId: {}", orderId);
                    return false;
                }
                
                // TODO: 실제로는 주문 생성 시 제공된 세션 ID나 토큰으로 소유권 검증 필요
                // 현재는 존재 여부만 확인 (추가 보안 강화 필요)
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
        if (count != null && count.get() >= MAX_CONNECTIONS_PER_IP) {
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
     */
    @org.springframework.scheduling.annotation.Scheduled(fixedRate = CLEANUP_INTERVAL_MS)
    public void cleanupOldConnections() {
        long currentTime = System.currentTimeMillis();
        connectionCounts.entrySet().removeIf(entry -> {
            Long lastTime = lastConnectionTime.get(entry.getKey());
            if (lastTime != null && (currentTime - lastTime) > CONNECTION_TIMEOUT_MS) {
                lastConnectionTime.remove(entry.getKey());
                log.debug("오래된 연결 정보 정리: IP={}", entry.getKey());
                return true;
            }
            return false;
        });
    }
}

