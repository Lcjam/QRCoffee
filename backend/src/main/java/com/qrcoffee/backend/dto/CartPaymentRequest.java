package com.qrcoffee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotEmpty;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartPaymentRequest {
    
    @NotNull(message = "매장 ID는 필수입니다")
    private Long storeId;
    
    @NotNull(message = "좌석 ID는 필수입니다")
    private Long seatId;
    
    @NotEmpty(message = "주문 항목은 하나 이상 있어야 합니다")
    private List<OrderItemRequest> orderItems;
    
    @NotNull(message = "총 금액은 필수입니다")
    @Positive(message = "총 금액은 0보다 커야 합니다")
    private BigDecimal totalAmount;
    
    @NotNull(message = "주문명은 필수입니다")
    private String orderName;
    
    private String customerRequest;
    
    private String customerEmail;
    private String customerName;
    private String customerPhone;
    private String successUrl;
    private String failUrl;
} 