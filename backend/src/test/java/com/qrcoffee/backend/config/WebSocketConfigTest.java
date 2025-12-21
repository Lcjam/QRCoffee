package com.qrcoffee.backend.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@DisplayName("WebSocketConfig 테스트")
class WebSocketConfigTest {
    
    @Autowired(required = false)
    private WebSocketMessageBrokerConfigurer webSocketConfig;
    
    @Test
    @DisplayName("WebSocket 설정이 로드되어야 함")
    void testWebSocketConfigLoaded() {
        // WebSocket 설정이 Spring 컨텍스트에 등록되어 있는지 확인
        // 실제 구현에서는 WebSocketConfig가 @Configuration으로 등록되어 있어야 함
        assertThat(webSocketConfig).isNotNull();
    }
}
