package com.qrcoffee.backend.repository;

import com.qrcoffee.backend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    /**
     * 주문별 주문 항목 조회
     */
    List<OrderItem> findByOrderIdOrderByIdAsc(Long orderId);
    
    /**
     * 메뉴별 주문 항목 조회
     */
    List<OrderItem> findByMenuId(Long menuId);
    
    /**
     * 매장별 인기 메뉴 조회 (판매량 기준)
     */
    @Query("SELECT oi.menuId, m.name, COUNT(DISTINCT oi.orderId) as orderCount, " +
           "SUM(oi.quantity) as totalQuantity, SUM(oi.totalPrice) as totalRevenue " +
           "FROM OrderItem oi " +
           "JOIN Order o ON oi.orderId = o.id " +
           "JOIN Menu m ON oi.menuId = m.id " +
           "WHERE o.storeId = :storeId AND o.status != 'CANCELLED' " +
           "GROUP BY oi.menuId, m.name " +
           "ORDER BY totalQuantity DESC, orderCount DESC " +
           "LIMIT :limit")
    List<Object[]> findPopularMenusByStoreId(@Param("storeId") Long storeId, @Param("limit") int limit);
}

