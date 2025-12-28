package com.qrcoffee.backend.service;

import com.qrcoffee.backend.entity.Notification;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("WebSocketNotificationService 테스트")
class WebSocketNotificationServiceTest {
    
    @Mock
    private SimpMessagingTemplate messagingTemplate;
    
    @InjectMocks
    private WebSocketNotificationService webSocketNotificationService;
    
    private Notification testNotification;
    private Long testStoreId;
    private Long testOrderId;
    
    @BeforeEach
    void setUp() {
        testStoreId = 1L;
        testOrderId = 1L;
        
        testNotification = Notification.builder()
                .id(1L)
                .orderId(testOrderId)
                .storeId(testStoreId)
                .userType(Notification.UserType.ADMIN)
                .notificationType(Notification.NotificationType.ORDER_RECEIVED)
                .message("새 주문이 접수되었습니다")
                .isRead(false)
                .build();
    }
    
    @Test
    @DisplayName("관리자에게 알림 전송")
    void testSendToAdmin() {
        // when
        webSocketNotificationService.sendToAdmin(testStoreId, testNotification);
        
        // then
        verify(messagingTemplate, times(1))
                .convertAndSend(eq("/topic/admin/" + testStoreId), eq(testNotification));
    }
    
    @Test
    @DisplayName("고객에게 알림 전송")
    void testSendToCustomer() {
        // when
        webSocketNotificationService.sendToCustomer(testOrderId, testNotification);
        
        // then
        verify(messagingTemplate, times(1))
                .convertAndSend(eq("/topic/customer/" + testOrderId), eq(testNotification));
    }
    
    @Test
    @DisplayName("주문 접수 알림 전송 (관리자에게)")
    void testNotifyOrderReceived() {
        // when
        webSocketNotificationService.notifyOrderReceived(testStoreId, testNotification);
        
        // then
        verify(messagingTemplate, times(1))
                .convertAndSend(eq("/topic/admin/" + testStoreId), eq(testNotification));
    }
    
    @Test
    @DisplayName("제조 완료 알림 전송 (고객에게)")
    void testNotifyOrderCompleted() {
        // given
        Notification customerNotification = Notification.builder()
                .id(2L)
                .orderId(testOrderId)
                .storeId(testStoreId)
                .userType(Notification.UserType.CUSTOMER)
                .notificationType(Notification.NotificationType.ORDER_COMPLETED)
                .message("주문이 완료되었습니다")
                .isRead(false)
                .build();
        
        // when
        webSocketNotificationService.notifyOrderCompleted(testOrderId, customerNotification);
        
        // then
        verify(messagingTemplate, times(1))
                .convertAndSend(eq("/topic/customer/" + testOrderId), eq(customerNotification));
    }
    
    @Test
    @DisplayName("주문 취소 알림 전송 (양방향)")
    void testNotifyOrderCancelled() {
        // given
        Notification adminNotification = Notification.builder()
                .id(3L)
                .orderId(testOrderId)
                .storeId(testStoreId)
                .userType(Notification.UserType.ADMIN)
                .notificationType(Notification.NotificationType.ORDER_CANCELLED)
                .message("주문이 취소되었습니다")
                .isRead(false)
                .build();
        
        Notification customerNotification = Notification.builder()
                .id(4L)
                .orderId(testOrderId)
                .storeId(testStoreId)
                .userType(Notification.UserType.CUSTOMER)
                .notificationType(Notification.NotificationType.ORDER_CANCELLED)
                .message("주문이 취소되었습니다")
                .isRead(false)
                .build();
        
        // when
        webSocketNotificationService.notifyOrderCancelled(
                testStoreId, testOrderId, adminNotification, customerNotification);
        
        // then
        verify(messagingTemplate, times(1))
                .convertAndSend(eq("/topic/admin/" + testStoreId), eq(adminNotification));
        verify(messagingTemplate, times(1))
                .convertAndSend(eq("/topic/customer/" + testOrderId), eq(customerNotification));
    }
    
    @Test
    @DisplayName("결제 완료 알림 전송 (고객에게)")
    void testNotifyPaymentCompleted() {
        // given
        Notification paymentNotification = Notification.builder()
                .id(5L)
                .orderId(testOrderId)
                .storeId(testStoreId)
                .userType(Notification.UserType.CUSTOMER)
                .notificationType(Notification.NotificationType.PAYMENT_COMPLETED)
                .message("결제가 완료되었습니다")
                .isRead(false)
                .build();
        
        // when
        webSocketNotificationService.notifyPaymentCompleted(testOrderId, paymentNotification);
        
        // then
        verify(messagingTemplate, times(1))
                .convertAndSend(eq("/topic/customer/" + testOrderId), eq(paymentNotification));
    }
}

