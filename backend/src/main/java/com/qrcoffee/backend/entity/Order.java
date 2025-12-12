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
    @Column(name = "payment_status", nullable = false)
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
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItem> orderItems = new ArrayList<>();
    
    public enum OrderStatus {
        PENDING,      // 주문접수
        PREPARING,    // 제조시작
        COMPLETED,    // 제조완료
        PICKED_UP,    // 수령완료
        CANCELLED     // 취소됨
    }
    
    public enum PaymentStatus {
        PENDING,      // 결제 대기
        PAID,         // 결제 완료
        FAILED,       // 결제 실패
        CANCELLED,    // 결제 취소
        REFUNDED      // 환불됨
    }
    
    /**
     * 주문 항목 추가
     */
    public void addOrderItem(OrderItem orderItem) {
        orderItems.add(orderItem);
        orderItem.setOrder(this);
    }
    
    /**
     * 주문 취소 가능 여부 확인
     */
    public boolean canCancel() {
        return status == OrderStatus.PENDING;
    }
    
    /**
     * 제조 시작
     */
    public void startPreparing() {
        if (status != OrderStatus.PENDING) {
            throw new IllegalStateException("주문접수 상태에서만 제조를 시작할 수 있습니다.");
        }
        this.status = OrderStatus.PREPARING;
    }
    
    /**
     * 제조 완료
     */
    public void complete() {
        if (status != OrderStatus.PREPARING) {
            throw new IllegalStateException("제조중 상태에서만 완료 처리할 수 있습니다.");
        }
        this.status = OrderStatus.COMPLETED;
    }
    
    /**
     * 수령 완료
     */
    public void pickUp() {
        if (status != OrderStatus.COMPLETED) {
            throw new IllegalStateException("제조완료 상태에서만 수령 완료 처리할 수 있습니다.");
        }
        this.status = OrderStatus.PICKED_UP;
    }
    
    /**
     * 주문 취소
     */
    public void cancel() {
        if (!canCancel()) {
            throw new IllegalStateException("제조가 시작된 주문은 취소할 수 없습니다.");
        }
        this.status = OrderStatus.CANCELLED;
        this.paymentStatus = PaymentStatus.CANCELLED;
    }
}

