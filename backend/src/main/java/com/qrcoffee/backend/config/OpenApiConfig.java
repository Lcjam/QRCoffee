package com.qrcoffee.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

/**
 * OpenAPI (Swagger) 설정
 * 개발 환경에서만 활성화됩니다.
 */
@Configuration
public class OpenApiConfig {
    
    private static final String SECURITY_SCHEME_NAME = "bearerAuth";
    
    @Value("${server.port:8080}")
    private String serverPort;
    
    @Value("${openapi.production-url:}")
    private String productionUrl;
    
    @Bean
    public OpenAPI qrCoffeeOpenAPI() {
        List<Server> servers = new ArrayList<>();
        
        // 로컬 개발 서버
        servers.add(new Server()
                .url("http://localhost:" + serverPort)
                .description("로컬 개발 서버"));
        
        // 프로덕션 서버 (설정된 경우에만 추가)
        if (productionUrl != null && !productionUrl.isEmpty()) {
            servers.add(new Server()
                    .url(productionUrl)
                    .description("프로덕션 서버"));
        }
        
        return new OpenAPI()
                .info(new Info()
                        .title("QR Coffee Order System API")
                        .description("QR코드 기반 무인 카페 주문 시스템 REST API 문서")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("QR Coffee Team")
                                .email("support@qrcoffee.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(servers)
                .addSecurityItem(new SecurityRequirement()
                        .addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT 토큰을 입력하세요. 형식: Bearer {token}")));
    }
}
