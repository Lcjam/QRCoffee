package com.qrcoffee.backend.repository;

import com.qrcoffee.backend.entity.Order;
import com.qrcoffee.backend.entity.OrderItem;
import org.springframework.data.domain.Pageable;
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
    @Query("SELECT oi.menuId, oi.menuName, COUNT(DISTINCT oi.order.id) as orderCount, " +
           "SUM(oi.quantity) as totalQuantity, SUM(oi.totalPrice) as totalRevenue " +
           "FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE o.storeId = :storeId AND o.status != :cancelledStatus " +
           "GROUP BY oi.menuId, oi.menuName " +
           "ORDER BY totalQuantity DESC, orderCount DESC")
    List<Object[]> findPopularMenusByStoreId(@Param("storeId") Long storeId, 
                                             @Param("cancelledStatus") Order.OrderStatus cancelledStatus,
                                             Pageable pageable);
}

