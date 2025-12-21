package com.qrcoffee.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    /**
     * 메시지 브로커 설정
     * - /topic: 구독용 (브로드캐스트)
     * - /queue: 개인 메시지용 (점대점)
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 메시지 브로커 활성화 (인메모리 브로커 사용)
        config.enableSimpleBroker("/topic", "/queue");
        
        // 클라이언트에서 서버로 메시지를 보낼 때 사용하는 prefix
        config.setApplicationDestinationPrefixes("/app");
    }
    
    /**
     * STOMP 엔드포인트 설정
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 고객용 WebSocket 엔드포인트
        registry.addEndpoint("/ws/customer")
                .setAllowedOriginPatterns("*") // 개발 환경에서는 모든 origin 허용
                .withSockJS(); // SockJS 지원 (폴백 옵션)
        
        // 관리자용 WebSocket 엔드포인트
        registry.addEndpoint("/ws/admin")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
