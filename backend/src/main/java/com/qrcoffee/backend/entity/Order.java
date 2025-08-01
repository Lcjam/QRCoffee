package com.qrcoffee.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "store_id", nullable = false)
    private Long storeId;
    
    @Column(name = "seat_id", nullable = false)
    private Long seatId;
    
    @Column(name = "order_number", unique = true, nullable = false, length = 20)
    private String orderNumber;
    
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 0)
    private BigDecimal totalAmount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    
    @Column(name = "customer_request", columnDefinition = "TEXT")
    private String customerRequest;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // 주문 항목들 (양방향 관계)
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItem> orderItems = new ArrayList<>();
    
    // 주문 상태 열거형
    public enum OrderStatus {
        PENDING("주문접수"),
        PREPARING("제조시작"),
        COMPLETED("제조완료"),
        PICKED_UP("수령완료"),
        CANCELLED("주문취소");
        
        private final String description;
        
        OrderStatus(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    // 결제 상태 열거형
    public enum PaymentStatus {
        PENDING("결제대기"),
        PAID("결제완료"),
        FAILED("결제실패"),
        CANCELLED("결제취소"),
        REFUNDED("환불완료");
        
        private final String description;
        
        PaymentStatus(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    // 편의 메서드들
    public boolean canCancel() {
        return status == OrderStatus.PENDING;
    }
    
    public boolean isPaid() {
        return paymentStatus == PaymentStatus.PAID;
    }
    
    public void addOrderItem(OrderItem orderItem) {
        orderItems.add(orderItem);
        orderItem.setOrder(this);
    }
    
    public void removeOrderItem(OrderItem orderItem) {
        orderItems.remove(orderItem);
        orderItem.setOrder(null);
    }
    
    // 상태 변경 메서드들
    public void startPreparing() {
        if (status != OrderStatus.PENDING) {
            throw new IllegalStateException("제조 시작은 주문접수 상태에서만 가능합니다.");
        }
        this.status = OrderStatus.PREPARING;
    }
    
    public void complete() {
        if (status != OrderStatus.PREPARING) {
            throw new IllegalStateException("제조 완료는 제조시작 상태에서만 가능합니다.");
        }
        this.status = OrderStatus.COMPLETED;
    }
    
    public void pickUp() {
        if (status != OrderStatus.COMPLETED) {
            throw new IllegalStateException("수령 완료는 제조완료 상태에서만 가능합니다.");
        }
        this.status = OrderStatus.PICKED_UP;
    }
    
    public void cancel() {
        if (!canCancel()) {
            throw new IllegalStateException("제조 시작 후에는 주문을 취소할 수 없습니다.");
        }
        this.status = OrderStatus.CANCELLED;
    }
} 