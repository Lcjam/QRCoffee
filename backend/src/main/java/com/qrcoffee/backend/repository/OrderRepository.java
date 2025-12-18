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
     * 주문 번호로 조회
     */
    Optional<Order> findByOrderNumber(String orderNumber);
    
    /**
     * 매장별 주문 목록 조회 (최신순)
     */
    List<Order> findByStoreIdOrderByCreatedAtDesc(Long storeId);
    
    /**
     * 매장별 특정 상태 주문 조회 (최신순)
     */
    List<Order> findByStoreIdAndStatusOrderByCreatedAtDesc(Long storeId, Order.OrderStatus status);
    
    /**
     * 매장 및 주문 ID로 조회
     */
    Optional<Order> findByIdAndStoreId(Long id, Long storeId);
    
    /**
     * 매장별 특정 날짜 주문 개수
     */
    @Query("SELECT COUNT(o) FROM Order o WHERE o.storeId = :storeId AND DATE(o.createdAt) = DATE(:date)")
    long countByStoreIdAndDate(@Param("storeId") Long storeId, @Param("date") LocalDateTime date);
    
    /**
     * 매장별 특정 상태 주문 개수
     */
    long countByStoreIdAndStatus(Long storeId, Order.OrderStatus status);
}

