package com.qrcoffee.backend.config;

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
public class WebSocketChannelInterceptor implements ChannelInterceptor {
    
    // IP별 연결 수 추적
    private final Map<String, AtomicInteger> connectionCounts = new ConcurrentHashMap<>();
    private final Map<String, Long> lastConnectionTime = new ConcurrentHashMap<>();
    
    // Rate Limiting 설정
    private static final int MAX_CONNECTIONS_PER_IP = 5;
    private static final long CONNECTION_RATE_LIMIT_MS = 1000; // 1초당 1개 연결
    private static final long CONNECTION_TIMEOUT_MS = 300000; // 5분 타임아웃
    
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
}
