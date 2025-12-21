package com.qrcoffee.backend.service;

import com.qrcoffee.backend.entity.Notification;
import com.qrcoffee.backend.entity.Order;
import com.qrcoffee.backend.exception.BusinessException;
import com.qrcoffee.backend.repository.NotificationRepository;
import com.qrcoffee.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final OrderRepository orderRepository;
    
    /**
     * 주문 접수 시 관리자에게 알림 전송
     */
    @Transactional
    public Notification sendOrderReceivedNotification(Long orderId) {
        Order order = findOrderById(orderId);
        
        Notification notification = Notification.builder()
                .orderId(orderId)
                .storeId(order.getStoreId())
                .userType(Notification.UserType.ADMIN)
                .notificationType(Notification.NotificationType.ORDER_RECEIVED)
                .message(String.format("새 주문이 접수되었습니다. 주문번호: %s", order.getOrderNumber()))
                .isRead(false)
                .build();
        
        Notification savedNotification = notificationRepository.save(notification);
        log.info("주문 접수 알림 전송: orderId={}, notificationId={}", orderId, savedNotification.getId());
        
        return savedNotification;
    }
    
    /**
     * 제조 완료 시 고객에게 알림 전송
     */
    @Transactional
    public Notification sendOrderCompletedNotification(Long orderId) {
        Order order = findOrderById(orderId);
        
        Notification notification = Notification.builder()
                .orderId(orderId)
                .storeId(order.getStoreId())
                .userType(Notification.UserType.CUSTOMER)
                .notificationType(Notification.NotificationType.ORDER_COMPLETED)
                .message("주문이 완료되었습니다. 카운터로 와서 수령해주세요!")
                .isRead(false)
                .build();
        
        Notification savedNotification = notificationRepository.save(notification);
        log.info("제조 완료 알림 전송: orderId={}, notificationId={}", orderId, savedNotification.getId());
        
        return savedNotification;
    }
    
    /**
     * 주문 취소 시 양방향 알림 전송
     */
    @Transactional
    public List<Notification> sendOrderCancelledNotification(Long orderId) {
        Order order = findOrderById(orderId);
        
        List<Notification> notifications = new ArrayList<>();
        
        // 관리자에게 알림
        Notification adminNotification = Notification.builder()
                .orderId(orderId)
                .storeId(order.getStoreId())
                .userType(Notification.UserType.ADMIN)
                .notificationType(Notification.NotificationType.ORDER_CANCELLED)
                .message(String.format("주문이 취소되었습니다. 주문번호: %s", order.getOrderNumber()))
                .isRead(false)
                .build();
        notifications.add(notificationRepository.save(adminNotification));
        
        // 고객에게 알림
        Notification customerNotification = Notification.builder()
                .orderId(orderId)
                .storeId(order.getStoreId())
                .userType(Notification.UserType.CUSTOMER)
                .notificationType(Notification.NotificationType.ORDER_CANCELLED)
                .message("주문이 취소되었습니다.")
                .isRead(false)
                .build();
        notifications.add(notificationRepository.save(customerNotification));
        
        log.info("주문 취소 알림 전송: orderId={}, notifications={}", orderId, notifications.size());
        
        return notifications;
    }
    
    /**
     * 결제 완료 시 고객에게 알림 전송
     */
    @Transactional
    public Notification sendPaymentCompletedNotification(Long orderId) {
        Order order = findOrderById(orderId);
        
        Notification notification = Notification.builder()
                .orderId(orderId)
                .storeId(order.getStoreId())
                .userType(Notification.UserType.CUSTOMER)
                .notificationType(Notification.NotificationType.PAYMENT_COMPLETED)
                .message(String.format("결제가 완료되었습니다. 주문번호: %s", order.getOrderNumber()))
                .isRead(false)
                .build();
        
        Notification savedNotification = notificationRepository.save(notification);
        log.info("결제 완료 알림 전송: orderId={}, notificationId={}", orderId, savedNotification.getId());
        
        return savedNotification;
    }
    
    /**
     * 매장별 미읽음 알림 개수 조회
     */
    public long getUnreadNotificationCount(Long storeId, Notification.UserType userType) {
        return notificationRepository.countByStoreIdAndUserTypeAndIsReadFalse(storeId, userType);
    }
    
    /**
     * 매장별 알림 목록 조회 (Pagination 지원)
     */
    public Page<Notification> getNotifications(Long storeId, Notification.UserType userType, Pageable pageable) {
        return notificationRepository.findByStoreIdAndUserTypeOrderBySentAtDesc(storeId, userType, pageable);
    }
    
    /**
     * 매장별 알림 목록 조회 (하위 호환성, 기본 20개)
     */
    public List<Notification> getNotifications(Long storeId, Notification.UserType userType) {
        Pageable pageable = PageRequest.of(0, 20);
        return getNotifications(storeId, userType, pageable).getContent();
    }
    
    /**
     * 알림 읽음 처리
     */
    @Transactional
    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new BusinessException("알림을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        notification.markAsRead();
        return notificationRepository.save(notification);
    }
    
    /**
     * 주문 ID로 주문 조회
     */
    private Order findOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("주문을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
    }
}
