package com.qrcoffee.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "payments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 주문 연관관계 (nullable = true - 장바구니 직결제에서는 결제 성공 후 주문 생성)
    @Column(name = "order_id", nullable = true)
    private Long orderId;

    // === 토스페이먼츠 v1 API 핵심 필드들 ===
    
    // 결제 키 (토스페이먼츠에서 제공하는 고유한 결제 식별자)
    @Column(name = "payment_key", length = 200, unique = true)
    private String paymentKey;
    
    // 주문 ID (상점에서 생성하는 주문 식별자)
    @Column(name = "order_id_toss", length = 64, nullable = false, unique = true)
    private String orderIdToss;
    
    // 구매 상품명
    @Column(name = "order_name", length = 100)
    private String orderName;
    
    // 결제 상태
    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private String status = "READY";
    
    // 결제 타입
    @Column(name = "type", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentType type = PaymentType.NORMAL;
    
    // 결제 수단 (토스페이먼츠 실제 반환값)
    @Column(name = "method", length = 50)
    private String method;
    
    // === 금액 관련 필드들 ===
    
    // 총 결제 금액
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 0)
    private BigDecimal totalAmount;
    
    // 취소 가능 금액
    @Column(name = "balance_amount", nullable = false, precision = 10, scale = 0)
    @Builder.Default
    private BigDecimal balanceAmount = BigDecimal.ZERO;
    
    // 공급가액
    @Column(name = "supplied_amount", nullable = false, precision = 10, scale = 0)
    @Builder.Default
    private BigDecimal suppliedAmount = BigDecimal.ZERO;
    
    // 부가세
    @Column(name = "vat", nullable = false, precision = 10, scale = 0)
    @Builder.Default
    private BigDecimal vat = BigDecimal.ZERO;
    
    // 면세 금액
    @Column(name = "tax_free_amount", nullable = false, precision = 10, scale = 0)
    @Builder.Default
    private BigDecimal taxFreeAmount = BigDecimal.ZERO;
    
    // 과세 제외 금액
    @Column(name = "tax_exemption_amount", nullable = false, precision = 10, scale = 0)
    @Builder.Default
    private BigDecimal taxExemptionAmount = BigDecimal.ZERO;
    
    // === 시간 관련 필드들 ===
    
    // 결제 요청 시간
    @Column(name = "requested_at")
    private LocalDateTime requestedAt;
    
    // 결제 승인 시간
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    
    // === 기타 필드들 ===
    
    // 통화
    @Column(name = "currency", length = 3)
    @Builder.Default
    private String currency = "KRW";
    
    // 국가 코드
    @Column(name = "country", length = 2)
    @Builder.Default
    private String country = "KR";
    
    // 에스크로 사용 여부
    @Column(name = "use_escrow")
    @Builder.Default
    private Boolean useEscrow = false;
    
    // 문화비 여부
    @Column(name = "culture_expense")
    @Builder.Default
    private Boolean cultureExpense = false;
    
    // 부분 취소 가능 여부
    @Column(name = "is_partial_cancelable")
    @Builder.Default
    private Boolean isPartialCancelable = true;
    
    // 버전
    @Column(name = "version", length = 20)
    @Builder.Default
    private String version = "2022-11-16";
    
    // 상점 ID
    @Column(name = "m_id", length = 14)
    private String mId;
    
    // 마지막 거래 키
    @Column(name = "last_transaction_key", length = 64)
    private String lastTransactionKey;
    
    // 메타데이터 (JSON)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "JSON")
    private Map<String, Object> metadata;
    
    // 웹훅 검증용 시크릿
    @Column(name = "secret", length = 50)
    private String secret;
    
    // === 결제 타입 ENUM ===
    public enum PaymentType {
        NORMAL,     // 일반 결제
        BILLING,    // 자동 결제
        BRANDPAY    // 브랜드페이
    }
    

    
    // === 생성/수정 시간 ===
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // === 편의 메서드들 ===
    
    public boolean isCompleted() {
        return status != null && status.equals("DONE");
    }
    
    public boolean isPending() {
        return status != null && (status.equals("READY") || status.equals("IN_PROGRESS"));
    }
    
    public boolean isCanceled() {
        return status != null && (status.equals("CANCELED") || status.equals("PARTIAL_CANCELED"));
    }
    
    public boolean isFailed() {
        return status != null && (status.equals("ABORTED") || status.equals("EXPIRED"));
    }
} 