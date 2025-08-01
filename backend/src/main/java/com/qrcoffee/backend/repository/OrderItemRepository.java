package com.qrcoffee.backend.repository;

import com.qrcoffee.backend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    /**
     * 주문별 주문 항목 조회
     */
    List<OrderItem> findByOrderIdOrderByCreatedAt(Long orderId);
    
    /**
     * 특정 메뉴의 주문 항목 조회 (인기 메뉴 분석용)
     */
    List<OrderItem> findByMenuIdOrderByCreatedAtDesc(Long menuId);
    
    /**
     * 매장별 메뉴 판매량 조회 (기간별)
     */
    @Query("SELECT oi FROM OrderItem oi JOIN oi.order o WHERE o.storeId = :storeId " +
           "AND oi.createdAt BETWEEN :startDate AND :endDate ORDER BY oi.createdAt DESC")
    List<OrderItem> findByStoreIdAndDateRange(@Param("storeId") Long storeId,
                                            @Param("startDate") LocalDateTime startDate,
                                            @Param("endDate") LocalDateTime endDate);
    
    /**
     * 매장별 인기 메뉴 조회 (판매량 기준)
     */
    @Query("SELECT oi.menuId, oi.menuName, SUM(oi.quantity) as totalQuantity " +
           "FROM OrderItem oi JOIN oi.order o WHERE o.storeId = :storeId " +
           "GROUP BY oi.menuId, oi.menuName ORDER BY totalQuantity DESC")
    List<Object[]> findPopularMenusByStoreId(@Param("storeId") Long storeId);
    
    /**
     * 매장별 오늘 판매된 메뉴 통계
     */
    @Query("SELECT oi.menuId, oi.menuName, SUM(oi.quantity) as totalQuantity, SUM(oi.totalPrice) as totalAmount " +
           "FROM OrderItem oi JOIN oi.order o WHERE o.storeId = :storeId " +
           "AND DATE(oi.createdAt) = DATE(CURRENT_TIMESTAMP) " +
           "GROUP BY oi.menuId, oi.menuName ORDER BY totalQuantity DESC")
    List<Object[]> findTodayMenuStatsByStoreId(@Param("storeId") Long storeId);
} 