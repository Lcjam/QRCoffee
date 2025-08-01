package com.qrcoffee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentConfirmRequest {
    
    @NotBlank(message = "결제 키는 필수입니다")
    private String paymentKey;
    
    @NotBlank(message = "주문 ID는 필수입니다")
    private String orderId;
    
    @NotNull(message = "결제 금액은 필수입니다")
    private BigDecimal amount;
} 