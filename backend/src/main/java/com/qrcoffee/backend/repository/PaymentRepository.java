package com.qrcoffee.backend.repository;

import com.qrcoffee.backend.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    // 주문 ID로 결제 정보 조회
    Optional<Payment> findByOrderId(Long orderId);
    
    // 토스 주문 ID로 결제 정보 조회
    Optional<Payment> findByOrderIdToss(String orderIdToss);
    
    // 토스 결제 키로 결제 정보 조회
    Optional<Payment> findByPaymentKey(String paymentKey);
    
    // 결제 상태로 조회
    List<Payment> findByStatus(String status);
    
    // 결제 수단으로 조회
    List<Payment> findByMethod(String method);
    
    // 특정 기간 결제 내역 조회
    @Query("SELECT p FROM Payment p WHERE p.requestedAt >= :startDate AND p.requestedAt <= :endDate")
    List<Payment> findByRequestedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                         @Param("endDate") LocalDateTime endDate);
    
    // 완료된 결제 내역 조회 (페이징)
    Page<Payment> findByStatus(String status, Pageable pageable);
    
    // 주문과 연결된 결제 조회
    @Query("SELECT p FROM Payment p WHERE p.orderId IS NOT NULL ORDER BY p.createdAt DESC")
    List<Payment> findPaymentsWithOrder();
    
    // 주문과 연결되지 않은 결제 조회 (장바구니 직결제 중 실패한 경우)
    @Query("SELECT p FROM Payment p WHERE p.orderId IS NULL AND p.status NOT IN ('DONE', 'CANCELED')")
    List<Payment> findOrphanedPayments();
    
    // 만료된 결제 조회
    @Query("SELECT p FROM Payment p WHERE p.status = 'READY' AND p.requestedAt < :cutoffTime")
    List<Payment> findExpiredPayments(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    // 특정 금액 이상의 결제 조회
    @Query("SELECT p FROM Payment p WHERE p.totalAmount >= :minAmount ORDER BY p.totalAmount DESC")
    List<Payment> findByTotalAmountGreaterThanEqual(@Param("minAmount") java.math.BigDecimal minAmount);
    
    // 매장별 결제 목록 조회 - Order 엔티티 조인으로 수정
    @Query("SELECT p FROM Payment p " +
           "JOIN com.qrcoffee.backend.entity.Order o ON p.orderId = o.id " +
           "WHERE o.storeId = :storeId " +
           "ORDER BY p.createdAt DESC")
    Page<Payment> findByStoreId(@Param("storeId") Long storeId, Pageable pageable);
    
    // 특정 상태의 결제 목록 조회
    List<Payment> findByStatusOrderByCreatedAtDesc(String status);
    
    // 매장별 특정 상태의 결제 목록 조회 - Order 엔티티 조인으로 수정
    @Query("SELECT p FROM Payment p " +
           "JOIN com.qrcoffee.backend.entity.Order o ON p.orderId = o.id " +
           "WHERE o.storeId = :storeId AND p.status = :status " +
           "ORDER BY p.createdAt DESC")
    List<Payment> findByStoreIdAndStatus(@Param("storeId") Long storeId, 
                                       @Param("status") String status);
    
    // 기간별 매출 통계 - totalAmount로 수정, Order 엔티티 조인으로 수정
    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM Payment p " +
           "JOIN com.qrcoffee.backend.entity.Order o ON p.orderId = o.id " +
           "WHERE o.storeId = :storeId " +
           "AND p.status = 'DONE' " +
           "AND p.approvedAt BETWEEN :startDate AND :endDate")
    BigDecimal calculateTotalRevenue(@Param("storeId") Long storeId,
                                   @Param("startDate") LocalDateTime startDate,
                                   @Param("endDate") LocalDateTime endDate);
    
    // 오늘 매출 - totalAmount로 수정, Order 엔티티 조인으로 수정
    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM Payment p " +
           "JOIN com.qrcoffee.backend.entity.Order o ON p.orderId = o.id " +
           "WHERE o.storeId = :storeId " +
           "AND p.status = 'DONE' " +
           "AND DATE(p.approvedAt) = CURRENT_DATE")
    BigDecimal getTodayRevenue(@Param("storeId") Long storeId);
    
    // 이번 달 매출 - totalAmount로 수정, Order 엔티티 조인으로 수정
    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM Payment p " +
           "JOIN com.qrcoffee.backend.entity.Order o ON p.orderId = o.id " +
           "WHERE o.storeId = :storeId " +
           "AND p.status = 'DONE' " +
           "AND YEAR(p.approvedAt) = YEAR(CURRENT_DATE) " +
           "AND MONTH(p.approvedAt) = MONTH(CURRENT_DATE)")
    BigDecimal getThisMonthRevenue(@Param("storeId") Long storeId);
    
    // 결제 수단별 통계 - totalAmount로 수정, Order 엔티티 조인으로 수정
    @Query("SELECT p.method, COUNT(p), SUM(p.totalAmount) FROM Payment p " +
           "JOIN com.qrcoffee.backend.entity.Order o ON p.orderId = o.id " +
           "WHERE o.storeId = :storeId " +
           "AND p.status = 'DONE' " +
           "AND p.approvedAt BETWEEN :startDate AND :endDate " +
           "GROUP BY p.method")
    List<Object[]> getPaymentMethodStats(@Param("storeId") Long storeId,
                                       @Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate);
    
    // 미완료 결제 조회 (정리용)
    @Query("SELECT p FROM Payment p " +
           "WHERE p.status IN ('READY', 'IN_PROGRESS') " +
           "AND p.createdAt < :cutoffTime")
    List<Payment> findIncompletePayments(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    // 매장의 최근 결제 내역 - Order 엔티티 조인으로 수정
    @Query("SELECT p FROM Payment p " +
           "JOIN com.qrcoffee.backend.entity.Order o ON p.orderId = o.id " +
           "WHERE o.storeId = :storeId " +
           "AND p.status = 'DONE' " +
           "ORDER BY p.approvedAt DESC")
    Page<Payment> findRecentPaymentsByStore(@Param("storeId") Long storeId, Pageable pageable);
} 