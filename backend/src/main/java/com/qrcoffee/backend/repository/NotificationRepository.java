package com.qrcoffee.backend.repository;

import com.qrcoffee.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    /**
     * 매장별 미읽음 알림 개수 조회
     */
    long countByStoreIdAndUserTypeAndIsReadFalse(Long storeId, Notification.UserType userType);
    
    /**
     * 주문별 알림 조회
     */
    List<Notification> findByOrderIdOrderBySentAtDesc(Long orderId);
    
    /**
     * 매장별 알림 목록 조회 (최신순)
     */
    List<Notification> findByStoreIdAndUserTypeOrderBySentAtDesc(Long storeId, Notification.UserType userType);
    
    /**
     * 매장별 미읽음 알림 목록 조회
     */
    List<Notification> findByStoreIdAndUserTypeAndIsReadFalseOrderBySentAtDesc(
            Long storeId, Notification.UserType userType);
    
    /**
     * 특정 주문의 특정 타입 알림 조회
     */
    Optional<Notification> findByOrderIdAndNotificationType(Long orderId, Notification.NotificationType notificationType);
}
