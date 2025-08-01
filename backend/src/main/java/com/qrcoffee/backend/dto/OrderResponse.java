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
    private String orderNumber;
    private BigDecimal totalAmount;
    private String status;
    private String statusDescription;
    private String paymentStatus;
    private String paymentStatusDescription;
    private String customerRequest;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 좌석 정보
    private String seatNumber;
    
    // 주문 항목들
    private List<OrderItemResponse> orderItems;
    
    // 주문 상태 관련 플래그들
    private Boolean canCancel;
    private Boolean isPaid;
    
    public static OrderResponse from(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .storeId(order.getStoreId())
                .seatId(order.getSeatId())
                .orderNumber(order.getOrderNumber())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .statusDescription(order.getStatus().getDescription())
                .paymentStatus(order.getPaymentStatus().name())
                .paymentStatusDescription(order.getPaymentStatus().getDescription())
                .customerRequest(order.getCustomerRequest())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .orderItems(order.getOrderItems().stream()
                        .map(OrderItemResponse::from)
                        .collect(Collectors.toList()))
                .canCancel(order.canCancel())
                .isPaid(order.isPaid())
                .build();
    }
    
    public static OrderResponse fromWithSeat(Order order, String seatNumber) {
        OrderResponse response = from(order);
        response.setSeatNumber(seatNumber);
        return response;
    }
} 