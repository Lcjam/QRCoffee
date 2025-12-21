package com.qrcoffee.backend.service;

import com.qrcoffee.backend.entity.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * WebSocket을 통한 실시간 알림 전송 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketNotificationService {
    
    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * 관리자에게 알림 전송
     * @param storeId 매장 ID
     * @param notification 알림 객체
     */
    public void sendToAdmin(Long storeId, Notification notification) {
        String destination = "/topic/admin/" + storeId;
        messagingTemplate.convertAndSend(destination, notification);
        log.info("관리자 알림 전송: storeId={}, destination={}, notificationId={}", 
                storeId, destination, notification.getId());
    }
    
    /**
     * 고객에게 알림 전송
     * @param orderId 주문 ID
     * @param notification 알림 객체
     */
    public void sendToCustomer(Long orderId, Notification notification) {
        String destination = "/topic/customer/" + orderId;
        messagingTemplate.convertAndSend(destination, notification);
        log.info("고객 알림 전송: orderId={}, destination={}, notificationId={}", 
                orderId, destination, notification.getId());
    }
    
    /**
     * 주문 접수 알림 (관리자에게)
     */
    public void notifyOrderReceived(Long storeId, Notification notification) {
        sendToAdmin(storeId, notification);
    }
    
    /**
     * 제조 완료 알림 (고객에게)
     */
    public void notifyOrderCompleted(Long orderId, Notification notification) {
        sendToCustomer(orderId, notification);
    }
    
    /**
     * 주문 취소 알림 (양방향)
     */
    public void notifyOrderCancelled(Long storeId, Long orderId, Notification adminNotification, Notification customerNotification) {
        sendToAdmin(storeId, adminNotification);
        sendToCustomer(orderId, customerNotification);
    }
    
    /**
     * 결제 완료 알림 (고객에게)
     */
    public void notifyPaymentCompleted(Long orderId, Notification notification) {
        sendToCustomer(orderId, notification);
    }
}
