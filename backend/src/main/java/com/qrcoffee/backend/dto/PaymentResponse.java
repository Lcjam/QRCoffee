package com.qrcoffee.backend.dto;

import com.qrcoffee.backend.entity.Payment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    
    // 기본 정보
    private Long id;
    private Long orderId;
    private String orderIdToss;
    private String paymentKey;
    private String orderName;
    
    // 결제 상태 및 수단
    private String status;
    private String method;
    
    // 금액 정보
    private BigDecimal amount;
    private BigDecimal totalAmount;
    private BigDecimal balanceAmount;
    private BigDecimal suppliedAmount;
    private BigDecimal vat;
    private BigDecimal taxFreeAmount;
    
    // 시간 정보
    private String requestedAt;
    private String approvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 기타 정보
    private String currency;
    private String country;
    private String version;
    
    // 고객 정보 (프론트엔드에서 사용)
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    
    // 결제창 URL (프론트엔드에서 사용)
    private String successUrl;
    private String failUrl;
    
    // 주문 정보 (조회 시 포함)
    private String orderNumber;
    private String seatNumber;
    
    /**
     * Payment 엔티티로부터 PaymentResponse 생성
     */
    public static PaymentResponse from(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .orderIdToss(payment.getOrderIdToss())
                .paymentKey(payment.getPaymentKey())
                .orderName(payment.getOrderName())
                .status(payment.getStatus())
                .method(payment.getMethod())
                .totalAmount(payment.getTotalAmount())
                .balanceAmount(payment.getBalanceAmount())
                .suppliedAmount(payment.getSuppliedAmount())
                .vat(payment.getVat())
                .taxFreeAmount(payment.getTaxFreeAmount())
                .requestedAt(payment.getRequestedAt() != null ? payment.getRequestedAt().toString() : null)
                .approvedAt(payment.getApprovedAt() != null ? payment.getApprovedAt().toString() : null)
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .currency(payment.getCurrency())
                .country(payment.getCountry())
                .version(payment.getVersion())
                .build();
    }
} 