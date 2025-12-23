package com.qrcoffee.backend.dto;

import com.qrcoffee.backend.entity.Payment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    
    private Long id;
    private Long orderId;
    private String paymentKey;
    private String orderIdToss;
    private String orderName;
    private BigDecimal totalAmount;
    private BigDecimal balanceAmount;
    private BigDecimal suppliedAmount;
    private BigDecimal vat;
    private String status;
    private String method;
    private String currency;
    private String country;
    private String version;
    private String requestedAt;
    private String approvedAt;
    private String createdAt;
    private String updatedAt;
    
    // 결제 위젯용 추가 필드
    private String customerName;
    private String successUrl;
    private String failUrl;
    
    /**
     * Payment 엔티티에서 PaymentResponse 생성
     */
    public static PaymentResponse from(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .paymentKey(payment.getPaymentKey())
                .orderIdToss(payment.getOrderIdToss())
                .orderName(payment.getOrderName())
                .totalAmount(payment.getTotalAmount())
                .balanceAmount(payment.getBalanceAmount())
                .suppliedAmount(payment.getSuppliedAmount())
                .vat(payment.getVat())
                .status(payment.getStatus())
                .method(payment.getMethod())
                .currency(payment.getCurrency())
                .country(payment.getCountry())
                .version(payment.getVersion())
                .requestedAt(payment.getRequestedAt() != null ? payment.getRequestedAt().toString() : null)
                .approvedAt(payment.getApprovedAt() != null ? payment.getApprovedAt().toString() : null)
                .createdAt(payment.getCreatedAt() != null ? payment.getCreatedAt().toString() : null)
                .updatedAt(payment.getUpdatedAt() != null ? payment.getUpdatedAt().toString() : null)
                .build();
    }
}

