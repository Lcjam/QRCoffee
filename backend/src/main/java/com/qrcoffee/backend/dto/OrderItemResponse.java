package com.qrcoffee.backend.dto;

import com.qrcoffee.backend.entity.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {
    
    private Long id;
    private Long menuId;
    private String menuName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String options;
    private LocalDateTime createdAt;
    
    /**
     * OrderItem 엔티티를 OrderItemResponse로 변환
     */
    public static OrderItemResponse from(OrderItem orderItem) {
        return OrderItemResponse.builder()
                .id(orderItem.getId())
                .menuId(orderItem.getMenuId())
                .menuName(orderItem.getMenuName())
                .quantity(orderItem.getQuantity())
                .unitPrice(orderItem.getUnitPrice())
                .totalPrice(orderItem.getTotalPrice())
                .options(orderItem.getOptions())
                .createdAt(orderItem.getCreatedAt())
                .build();
    }
}

