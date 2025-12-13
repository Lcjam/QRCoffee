package com.qrcoffee.backend.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
@Getter
public class TossPaymentsConfig {
    
    @Value("${TOSS_PAYMENTS_SECRET_KEY:}")
    private String secretKey;
    
    @Value("${TOSS_PAYMENTS_CLIENT_KEY:}")
    private String clientKey;
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

