package com.qrcoffee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JwtResponse {
    
    private String accessToken;
    private String refreshToken;
    private String type = "Bearer";
    private Long userId;
    private String email;
    private String name;
    private String role;
    private Long storeId;
    
    public JwtResponse(String accessToken, String refreshToken, Long userId, 
                      String email, String name, String role, Long storeId) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.role = role;
        this.storeId = storeId;
    }
} 
