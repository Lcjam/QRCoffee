package com.qrcoffee.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequest {
    
    @NotBlank(message = "카테고리명은 필수입니다")
    @Size(max = 50, message = "카테고리명은 50자를 초과할 수 없습니다")
    private String name;
    
    private Integer displayOrder = 0;
    
    private Boolean isActive = true;
} 