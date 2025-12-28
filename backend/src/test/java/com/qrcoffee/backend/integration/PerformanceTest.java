package com.qrcoffee.backend.integration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.TestPropertySource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 성능 측정 테스트
 * API 응답 시간을 측정합니다.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@DisplayName("성능 측정 테스트")
class PerformanceTest {
    
    @LocalServerPort
    private int port;
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    @DisplayName("헬스체크 API 응답 시간 측정")
    void testHealthCheckPerformance() {
        long startTime = System.currentTimeMillis();
        
        ResponseEntity<String> response = restTemplate.getForEntity(
                "http://localhost:" + port + "/api/health", String.class);
        
        long endTime = System.currentTimeMillis();
        long responseTime = endTime - startTime;
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(responseTime).isLessThan(1000); // 1초 이내 응답
        
        System.out.println("헬스체크 API 응답 시간: " + responseTime + "ms");
    }
}

