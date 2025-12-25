package com.qrcoffee.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class StoreRequest {
    
    @NotBlank(message = "매장명은 필수입니다")
    @Size(max = 100, message = "매장명은 100자를 초과할 수 없습니다")
    private String name;
    
    private String address;
    
    @Size(max = 20, message = "전화번호는 20자를 초과할 수 없습니다")
    private String phone;
    
    private String businessHours; // JSON 형태로 저장 예: {"mon":"09:00-22:00", "tue":"09:00-22:00", ...}
    
    private Boolean isActive = true;
} 
