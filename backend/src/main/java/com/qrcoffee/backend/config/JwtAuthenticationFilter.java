package com.qrcoffee.backend.config;

import com.qrcoffee.backend.util.JwtUtil;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtUtil jwtUtil;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        try {
            String jwt = getJwtFromRequest(request);
            
            if (StringUtils.hasText(jwt)) {
                String email = jwtUtil.getEmailFromToken(jwt);
                
                if (StringUtils.hasText(email) && SecurityContextHolder.getContext().getAuthentication() == null) {
                    
                    if (jwtUtil.isTokenValid(jwt, email)) {
                        // JWT에서 사용자 정보 추출
                        Long userId = jwtUtil.getUserIdFromToken(jwt);
                        String role = jwtUtil.getRoleFromToken(jwt);
                        Long storeId = jwtUtil.getStoreIdFromToken(jwt);
                        
                        // 권한 설정
                        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
                        
                        // Authentication 객체 생성
                        UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(
                                email, 
                                null, 
                                Collections.singletonList(authority)
                            );
                        
                        // 추가 정보 설정 (사용자 ID, 매장 ID 등)
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        
                        // SecurityContext에 인증 정보 설정
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        
                        // 요청에 사용자 정보 추가 (컨트롤러에서 사용하기 위해)
                        request.setAttribute("userId", userId);
                        request.setAttribute("userEmail", email);
                        request.setAttribute("userRole", role);
                        request.setAttribute("storeId", storeId);
                        
                        log.debug("JWT 인증 성공: {} (역할: {}, 매장: {})", email, role, storeId);
                    } else {
                        log.warn("유효하지 않은 JWT 토큰: {}", email);
                    }
                }
            }
        } catch (ExpiredJwtException e) {
            log.warn("만료된 JWT 토큰: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"토큰이 만료되었습니다.\"}");
            return;
        } catch (UnsupportedJwtException e) {
            log.warn("지원되지 않는 JWT 토큰: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"지원되지 않는 토큰 형식입니다.\"}");
            return;
        } catch (MalformedJwtException e) {
            log.warn("잘못된 JWT 토큰: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"잘못된 토큰 형식입니다.\"}");
            return;
        } catch (SignatureException e) {
            log.warn("JWT 서명 검증 실패: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"토큰 서명이 유효하지 않습니다.\"}");
            return;
        } catch (IllegalArgumentException e) {
            log.warn("JWT 토큰이 비어있음: {}", e.getMessage());
        } catch (Exception e) {
            log.error("JWT 토큰 처리 중 오류 발생: {}", e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }
    
    /**
     * HTTP 요청에서 JWT 토큰 추출
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
} 