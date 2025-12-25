package com.qrcoffee.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final Environment environment;
    
    @Value("${cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;
    
    @Value("${cors.allowed-methods:GET,POST,PUT,DELETE,OPTIONS}")
    private String allowedMethods;
    
    @Value("${cors.allowed-headers:*}")
    private String allowedHeaders;
    
    @Value("${cors.allow-credentials:true}")
    private boolean allowCredentials;
    
    /**
     * 개발 환경 여부 확인
     */
    private boolean isDevProfile() {
        String[] activeProfiles = environment.getActiveProfiles();
        return activeProfiles.length == 0 || Arrays.asList(activeProfiles).contains("dev");
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CSRF 비활성화 (JWT 사용)
            .csrf(AbstractHttpConfigurer::disable)
            
            // CORS 설정
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 세션 관리 - JWT 사용으로 STATELESS 설정
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // 요청 권한 설정
            .authorizeHttpRequests(auth -> {
                // Swagger/OpenAPI 문서 엔드포인트 (개발 환경에서만 공개)
                if (isDevProfile()) {
                    auth.requestMatchers(
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/v3/api-docs/**",
                        "/v3/api-docs.yaml",
                        "/swagger-resources/**",
                        "/webjars/**"
                    ).permitAll();
                } else {
                    // 프로덕션 환경에서는 Swagger 경로 차단
                    auth.requestMatchers(
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/v3/api-docs/**",
                        "/v3/api-docs.yaml",
                        "/swagger-resources/**",
                        "/webjars/**"
                    ).denyAll();
                }
                
                // 공개 엔드포인트
                auth
                .requestMatchers(
                    "/api/auth/login",
                    "/api/auth/signup", 
                    "/api/health",
                    "/actuator/**",
                    "/api/qr/**",  // QR코드 스캔용
                    "/api/public/seats/**",  // 퍼블릭 좌석 API
                    "/api/public/stores/**", // 고객용 매장/메뉴 조회 API
                    "/api/public/menus/**",  // 고객용 메뉴 조회 (하위 호환성)
                    "/api/payments/**",      // 고객용 결제 API
                    "/ws/**"                 // WebSocket 엔드포인트
                ).permitAll()
                
                // 관리자 전용 엔드포인트
                .requestMatchers("/api/admin/**").hasRole("MASTER")
                
                // 사용자 관리 API (마스터 계정만)
                .requestMatchers("/api/users/sub-accounts/**").hasRole("MASTER")
                
                // 나머지는 인증 필요
                .anyRequest().authenticated();
            })
            
            // JWT 인증 필터 추가
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 허용할 오리진 설정 (설정 파일에서 읽어오거나 기본값 사용)
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        if (origins.size() == 1 && "*".equals(origins.get(0).trim())) {
            configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        } else {
            configuration.setAllowedOrigins(origins);
        }
        
        // 허용할 HTTP 메서드
        configuration.setAllowedMethods(Arrays.asList(allowedMethods.split(",")));
        
        // 허용할 헤더
        if ("*".equals(allowedHeaders)) {
            configuration.setAllowedHeaders(Arrays.asList("*"));
        } else {
            configuration.setAllowedHeaders(Arrays.asList(allowedHeaders.split(",")));
        }
        
        // 자격 증명 허용
        configuration.setAllowCredentials(allowCredentials);
        
        // 노출할 헤더
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
} 
