package com.qrcoffee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    
    @NotNull(message = "주문 ID는 필수입니다")
    private Long orderId;
    
    @NotNull(message = "결제 금액은 필수입니다")
    @Positive(message = "결제 금액은 0보다 커야 합니다")
    private BigDecimal amount;
    
    @NotNull(message = "주문명은 필수입니다")
    private String orderName;
    
    private String customerEmail;
    private String customerName;
    private String successUrl;
    private String failUrl;
} 