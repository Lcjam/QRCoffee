package com.qrcoffee.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatRequest {
    
    @NotBlank(message = "좌석번호는 필수입니다")
    @Size(max = 100, message = "좌석번호는 100자 이하여야 합니다")
    private String seatNumber;
    
    @Size(max = 255, message = "좌석 설명은 255자 이하여야 합니다")
    private String description;
    
    @Min(value = 1, message = "최대 수용 인원은 1명 이상이어야 합니다")
    @Max(value = 20, message = "최대 수용 인원은 20명 이하여야 합니다")
    private Integer maxCapacity = 4;
    
    private Boolean isActive = true;
    
    @Size(max = 500, message = "QR코드 이미지 URL은 500자 이하여야 합니다")
    private String qrCodeImageUrl;
} 
