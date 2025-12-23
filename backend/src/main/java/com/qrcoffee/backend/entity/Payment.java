package com.qrcoffee.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Payment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "order_id", nullable = true)
    private Long orderId; // 주문 생성 전에는 null 가능 (스키마 수정 필요)
    
    @Column(name = "payment_key", unique = true, nullable = true, length = 200)
    private String paymentKey; // 결제 준비 단계에서는 null
    
    @Column(name = "order_id_toss", nullable = false, length = 200)
    private String orderIdToss; // 토스페이먼츠 주문 ID
    
    @Column(name = "order_name", length = 100)
    private String orderName;
    
    @Column(name = "amount", nullable = false, precision = 10, scale = 0)
    private BigDecimal totalAmount; // 스키마의 amount 컬럼과 매핑, 필드명은 totalAmount 유지
    
    @Column(name = "balance_amount", precision = 10, scale = 0)
    private BigDecimal balanceAmount;
    
    @Column(name = "supplied_amount", precision = 10, scale = 0)
    private BigDecimal suppliedAmount;
    
    @Column(name = "vat", precision = 10, scale = 0)
    private BigDecimal vat;
    
    @Column(name = "tax_free_amount", precision = 10, scale = 0)
    private BigDecimal taxFreeAmount;
    
    @Column(name = "tax_exemption_amount", precision = 10, scale = 0)
    private BigDecimal taxExemptionAmount;
    
    @Column(name = "status", length = 50)
    private String status; // READY, IN_PROGRESS, WAITING_FOR_DEPOSIT, DONE, CANCELED, PARTIAL_CANCELED, ABORTED, EXPIRED
    
    @Column(name = "method", length = 50)
    private String method; // 카드, 간편결제, 가상계좌 등
    
    @Column(name = "currency", length = 10)
    @Builder.Default
    private String currency = "KRW";
    
    @Column(name = "country", length = 10)
    @Builder.Default
    private String country = "KR";
    
    @Column(name = "version", length = 20)
    private String version;
    
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    
    @Column(name = "requested_at")
    private LocalDateTime requestedAt;
    
    @Column(name = "failed_reason", columnDefinition = "TEXT")
    private String failedReason;
    
    @Column(name = "cancel_reason", columnDefinition = "TEXT")
    private String cancelReason;
    
    @Column(name = "receipt_url", length = 500)
    private String receiptUrl;
    
    @Column(name = "metadata", columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> metadata; // 장바구니 정보 등 메타데이터 저장
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

