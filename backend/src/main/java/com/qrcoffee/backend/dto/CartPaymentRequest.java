package com.qrcoffee.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartPaymentRequest {
    
    @NotNull(message = "총 금액은 필수입니다.")
    @Min(value = 1, message = "총 금액은 1원 이상이어야 합니다.")
    private BigDecimal totalAmount;
    
    @NotBlank(message = "주문명은 필수입니다.")
    private String orderName;
    
    // 고객 정보는 선택사항 (토스페이먼츠 API에서도 선택사항)
    private String customerName;
    
    private String customerPhone;
    
    @NotNull(message = "매장 ID는 필수입니다.")
    private Long storeId;
    
    @NotNull(message = "좌석 ID는 필수입니다.")
    private Long seatId;
    
    @NotNull(message = "주문 항목은 필수입니다.")
    private List<OrderItemRequest> orderItems;
    
    @NotBlank(message = "결제 성공 URL은 필수입니다.")
    private String successUrl;
    
    @NotBlank(message = "결제 실패 URL은 필수입니다.")
    private String failUrl;
}

