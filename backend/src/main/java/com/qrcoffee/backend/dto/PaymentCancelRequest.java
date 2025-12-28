package com.qrcoffee.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentCancelRequest {
    
    @NotBlank(message = "결제 키는 필수입니다.")
    private String paymentKey;
    
    @NotBlank(message = "취소 사유는 필수입니다.")
    private String cancelReason;
}









