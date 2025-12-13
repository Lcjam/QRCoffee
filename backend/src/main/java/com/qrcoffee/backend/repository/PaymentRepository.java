package com.qrcoffee.backend.repository;

import com.qrcoffee.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    /**
     * 토스페이먼츠 orderId로 결제 정보 조회
     */
    Optional<Payment> findByOrderIdToss(String orderIdToss);
    
    /**
     * paymentKey로 결제 정보 조회
     */
    Optional<Payment> findByPaymentKey(String paymentKey);
    
    /**
     * 주문 ID로 결제 정보 조회
     */
    Optional<Payment> findByOrderId(Long orderId);
}

