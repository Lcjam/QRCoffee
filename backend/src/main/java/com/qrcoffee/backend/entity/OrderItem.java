package com.qrcoffee.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class OrderItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    @Column(name = "menu_id", nullable = false)
    private Long menuId;
    
    @Column(name = "menu_name", nullable = false, length = 100)
    private String menuName;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(name = "unit_price", nullable = false, precision = 10, scale = 0)
    private BigDecimal unitPrice;
    
    @Column(name = "total_price", nullable = false, precision = 10, scale = 0)
    private BigDecimal totalPrice;
    
    @Column(columnDefinition = "JSON")
    private String options;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    // 편의 메서드들
    public void calculateTotalPrice() {
        this.totalPrice = this.unitPrice.multiply(BigDecimal.valueOf(this.quantity));
    }
    
    public static OrderItem createOrderItem(Order order, Long menuId, String menuName, 
                                          Integer quantity, BigDecimal unitPrice, String options) {
        OrderItem orderItem = OrderItem.builder()
                .order(order)
                .menuId(menuId)
                .menuName(menuName)
                .quantity(quantity)
                .unitPrice(unitPrice)
                .options(options)
                .build();
        
        orderItem.calculateTotalPrice();
        return orderItem;
    }
} 