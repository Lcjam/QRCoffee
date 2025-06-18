package com.qrcoffee.backend.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
public class JwtUtil {
    
    private final SecretKey secretKey;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;
    
    public JwtUtil(@Value("${jwt.secret}") String secret,
                   @Value("${jwt.expiration}") long accessTokenExpiration,
                   @Value("${jwt.refresh-expiration}") long refreshTokenExpiration) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }
    
    /**
     * Access Token 생성
     */
    public String generateAccessToken(String email, Long userId, String role, Long storeId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("role", role);
        claims.put("storeId", storeId);
        
        return createToken(claims, email, accessTokenExpiration);
    }
    
    /**
     * Refresh Token 생성
     */
    public String generateRefreshToken(String email) {
        return createToken(new HashMap<>(), email, refreshTokenExpiration);
    }
    
    /**
     * 토큰 생성 공통 메서드
     */
    private String createToken(Map<String, Object> claims, String subject, long expiration) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }
    
    /**
     * 토큰에서 이메일 추출
     */
    public String getEmailFromToken(String token) {
        return getClaims(token).getSubject();
    }
    
    /**
     * 토큰에서 사용자 ID 추출
     */
    public Long getUserIdFromToken(String token) {
        return getClaims(token).get("userId", Long.class);
    }
    
    /**
     * 토큰에서 역할 추출
     */
    public String getRoleFromToken(String token) {
        return getClaims(token).get("role", String.class);
    }
    
    /**
     * 토큰에서 매장 ID 추출
     */
    public Long getStoreIdFromToken(String token) {
        return getClaims(token).get("storeId", Long.class);
    }
    
    /**
     * 토큰에서 만료 시간 추출
     */
    public Date getExpirationDateFromToken(String token) {
        return getClaims(token).getExpiration();
    }
    
    /**
     * 토큰 유효성 검증
     */
    public boolean isTokenValid(String token, String email) {
        try {
            final String tokenEmail = getEmailFromToken(token);
            return (tokenEmail.equals(email) && !isTokenExpired(token));
        } catch (Exception e) {
            log.error("Token validation error: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * 토큰 만료 여부 확인
     */
    private boolean isTokenExpired(String token) {
        return getExpirationDateFromToken(token).before(new Date());
    }
    
    /**
     * 토큰에서 Claims 추출
     */
    private Claims getClaims(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
            throw e;
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
            throw e;
        } catch (MalformedJwtException e) {
            log.error("JWT token is invalid: {}", e.getMessage());
            throw e;
        } catch (SignatureException e) {
            log.error("JWT signature does not match: {}", e.getMessage());
            throw e;
        } catch (IllegalArgumentException e) {
            log.error("JWT token compact of handler are invalid: {}", e.getMessage());
            throw e;
        }
    }
} 