package com.qrcoffee.backend.repository;

import com.qrcoffee.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
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
    
    /**
     * 매장별 기간 내 완료된 결제 조회 (매출 통계용)
     */
    @Query("SELECT p FROM Payment p JOIN Order o ON p.orderId = o.id " +
           "WHERE o.storeId = :storeId AND p.status = 'DONE' " +
           "AND p.approvedAt >= :startDate AND p.approvedAt < :endDate " +
           "ORDER BY p.approvedAt DESC")
    List<Payment> findByStoreIdAndDateRange(
            @Param("storeId") Long storeId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}

