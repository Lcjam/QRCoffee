package com.qrcoffee.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequest {
    
    @NotNull(message = "매장 ID는 필수입니다")
    private Long storeId;
    
    @NotNull(message = "좌석 ID는 필수입니다")
    private Long seatId;
    
    @NotEmpty(message = "주문 항목은 최소 1개 이상이어야 합니다")
    private List<OrderItemRequest> orderItems;
    
    @Size(max = 500, message = "고객 요청사항은 500자를 초과할 수 없습니다")
    private String customerRequest;
    
    // 결제 관련 필드 (선택사항)
    private String customerName;
    private String customerPhone;
}

