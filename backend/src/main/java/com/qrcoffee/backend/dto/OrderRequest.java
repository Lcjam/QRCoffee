package com.qrcoffee.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    
    @NotNull(message = "매장 ID는 필수입니다")
    private Long storeId;
    
    @NotNull(message = "좌석 ID는 필수입니다")
    private Long seatId;
    
    @NotEmpty(message = "주문 항목이 필요합니다")
    @Valid
    private List<OrderItemRequest> orderItems;
    
    @Size(max = 500, message = "요청사항은 500자를 초과할 수 없습니다")
    private String customerRequest;
    
    // 결제 시 필요한 필드들
    private BigDecimal totalAmount;
    private String customerName;
    private String customerPhone;
} 