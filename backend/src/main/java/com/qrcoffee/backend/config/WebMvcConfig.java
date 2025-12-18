package com.qrcoffee.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC 설정
 * 정적 리소스 핸들러가 API 경로를 처리하지 않도록 설정
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // API 경로는 정적 리소스 핸들러가 처리하지 않도록 설정
        // 정적 리소스는 /static/** 또는 /public/** 경로만 처리
        // /api/** 경로는 명시적으로 제외하여 컨트롤러가 처리하도록 함
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
        registry.addResourceHandler("/public/**")
                .addResourceLocations("classpath:/public/");
        
        // API 경로를 정적 리소스로 처리하지 않도록 설정
        // Spring Boot의 기본 정적 리소스 핸들러가 /api/** 경로를 가로채지 않도록 함
        registry.setOrder(Integer.MAX_VALUE - 1);
    }
}
