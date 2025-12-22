package com.qrcoffee.backend.dto;

import com.qrcoffee.backend.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    
    private Long id;
    private Long storeId;
    private Long seatId;
    private String seatNumber; // 좌석 번호 (편의 필드)
    private String orderNumber;
    private BigDecimal totalAmount;
    private String status;
    private String paymentStatus;
    private String customerRequest;
    private String accessToken; // 주문 접근 토큰 (소유권 검증용)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 주문 항목 목록
    private List<OrderItemResponse> orderItems;
    
    /**
     * Order 엔티티를 OrderResponse로 변환 (좌석 번호 포함)
     */
    public static OrderResponse fromWithSeat(Order order, String seatNumber) {
        List<OrderItemResponse> orderItemResponses = order.getOrderItems().stream()
                .map(OrderItemResponse::from)
                .collect(Collectors.toList());
        
        return OrderResponse.builder()
                .id(order.getId())
                .storeId(order.getStoreId())
                .seatId(order.getSeatId())
                .seatNumber(seatNumber)
                .orderNumber(order.getOrderNumber())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .paymentStatus(order.getPaymentStatus().name())
                .customerRequest(order.getCustomerRequest())
                .accessToken(order.getAccessToken())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .orderItems(orderItemResponses)
                .build();
    }
    
    /**
     * Order 엔티티를 OrderResponse로 변환 (좌석 번호 없이)
     */
    public static OrderResponse from(Order order) {
        return fromWithSeat(order, null);
    }
}

