package com.qrcoffee.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;

@Configuration
public class TossPaymentsConfig {
    
    @Value("${toss.payments.client-key:test_ck_DnyRpQWGrNGxSzNy0nOz8wGvYOiR}")
    private String clientKey;
    
    @Value("${toss.payments.secret-key:test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R:}")
    private String secretKey;
    
    @Value("${toss.payments.base-url:https://api.tosspayments.com}")
    private String baseUrl;
    
    @Bean
    public RestTemplate tossPaymentsRestTemplate() {
        return new RestTemplate();
    }
    
    public HttpHeaders createAuthHeaders() {
        String encodedAuth = Base64.getEncoder()
                .encodeToString((secretKey + ":").getBytes());
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encodedAuth);
        headers.set("Content-Type", "application/json");
        return headers;
    }
    
    public String getClientKey() {
        return clientKey;
    }
    
    public String getSecretKey() {
        return secretKey;
    }
    
    public String getBaseUrl() {
        return baseUrl;
    }
} 