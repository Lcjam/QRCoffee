package com.qrcoffee.backend.repository;

import com.qrcoffee.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    /**
     * 매장별 주문 목록 조회 (최신순)
     */
    List<Order> findByStoreIdOrderByCreatedAtDesc(Long storeId);
    
    /**
     * 매장별 특정 상태 주문 조회
     */
    List<Order> findByStoreIdAndStatusOrderByCreatedAtDesc(Long storeId, Order.OrderStatus status);
    
    /**
     * 매장별 주문 ID로 조회
     */
    Optional<Order> findByIdAndStoreId(Long id, Long storeId);
    
    /**
     * 좌석별 진행 중인 주문 조회 (PENDING, PREPARING, COMPLETED)
     */
    @Query("SELECT o FROM Order o WHERE o.seatId = :seatId AND o.status IN ('PENDING', 'PREPARING', 'COMPLETED') ORDER BY o.createdAt DESC")
    List<Order> findActiveBySeatId(@Param("seatId") Long seatId);
    
    /**
     * 매장별 일별 주문 통계
     */
    @Query("SELECT COUNT(o) FROM Order o WHERE o.storeId = :storeId AND DATE(o.createdAt) = DATE(:date)")
    long countByStoreIdAndDate(@Param("storeId") Long storeId, @Param("date") LocalDateTime date);
    
    /**
     * 매장별 기간별 주문 조회
     */
    @Query("SELECT o FROM Order o WHERE o.storeId = :storeId AND o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    List<Order> findByStoreIdAndDateRange(@Param("storeId") Long storeId, 
                                         @Param("startDate") LocalDateTime startDate, 
                                         @Param("endDate") LocalDateTime endDate);
    
    /**
     * 매장별 오늘 주문 조회
     */
    @Query("SELECT o FROM Order o WHERE o.storeId = :storeId AND DATE(o.createdAt) = DATE(CURRENT_TIMESTAMP) ORDER BY o.createdAt DESC")
    List<Order> findTodayOrdersByStoreId(@Param("storeId") Long storeId);
    
    /**
     * 매장별 대기 중인 주문 개수
     */
    long countByStoreIdAndStatus(Long storeId, Order.OrderStatus status);
    
    /**
     * 주문 번호로 조회
     */
    Optional<Order> findByOrderNumber(String orderNumber);
    
    /**
     * 매장별 최근 주문 조회 (페이징)
     */
    @Query("SELECT o FROM Order o WHERE o.storeId = :storeId ORDER BY o.createdAt DESC")
    List<Order> findRecentOrdersByStoreId(@Param("storeId") Long storeId);
} 