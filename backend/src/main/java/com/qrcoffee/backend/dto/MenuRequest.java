package com.qrcoffee.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MenuRequest {
    
    @NotNull(message = "카테고리 ID는 필수입니다")
    private Long categoryId;
    
    @NotBlank(message = "메뉴명은 필수입니다")
    @Size(max = 100, message = "메뉴명은 100자를 초과할 수 없습니다")
    private String name;
    
    @Size(max = 1000, message = "메뉴 설명은 1000자를 초과할 수 없습니다")
    private String description;
    
    @NotNull(message = "가격은 필수입니다")
    @Positive(message = "가격은 0보다 큰 값이어야 합니다")
    private BigDecimal price;
    
    @Size(max = 500, message = "이미지 URL은 500자를 초과할 수 없습니다")
    private String imageUrl;
    
    private Boolean isAvailable = true;
    
    private Integer displayOrder = 0;
} 
