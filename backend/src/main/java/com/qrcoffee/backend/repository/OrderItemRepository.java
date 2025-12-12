package com.qrcoffee.backend.repository;

import com.qrcoffee.backend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
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
}

