package com.qrcoffee.backend.service;

import com.qrcoffee.backend.entity.Notification;
import com.qrcoffee.backend.entity.Order;
import com.qrcoffee.backend.repository.NotificationRepository;
import com.qrcoffee.backend.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationService 테스트")
class NotificationServiceTest {
    
    @Mock
    private NotificationRepository notificationRepository;
    
    @Mock
    private OrderRepository orderRepository;
    
    @InjectMocks
    private NotificationService notificationService;
    
    private Order testOrder;
    private Long testStoreId;
    private Long testOrderId;
    
    @BeforeEach
    void setUp() {
        testStoreId = 1L;
        testOrderId = 1L;
        
        testOrder = Order.builder()
                .id(testOrderId)
                .storeId(testStoreId)
                .seatId(1L)
                .orderNumber("20240101-001-0001")
                .totalAmount(BigDecimal.valueOf(10000))
                .status(Order.OrderStatus.PENDING)
                .paymentStatus(Order.PaymentStatus.PAID)
                .build();
    }
    
    @Test
    @DisplayName("주문 접수 시 관리자에게 알림 전송")
    void testSendOrderReceivedNotification() {
        // given
        when(orderRepository.findById(testOrderId)).thenReturn(Optional.of(testOrder));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> {
            Notification notification = invocation.getArgument(0);
            notification.setId(1L);
            return notification;
        });
        
        // when
        Notification notification = notificationService.sendOrderReceivedNotification(testOrderId);
        
        // then
        assertThat(notification).isNotNull();
        assertThat(notification.getOrderId()).isEqualTo(testOrderId);
        assertThat(notification.getStoreId()).isEqualTo(testStoreId);
        assertThat(notification.getUserType()).isEqualTo(Notification.UserType.ADMIN);
        assertThat(notification.getNotificationType()).isEqualTo(Notification.NotificationType.ORDER_RECEIVED);
        assertThat(notification.getMessage()).contains("새 주문이 접수되었습니다");
        assertThat(notification.getIsRead()).isFalse();
        
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }
    
    @Test
    @DisplayName("제조 완료 시 고객에게 알림 전송")
    void testSendOrderCompletedNotification() {
        // given
        testOrder.setStatus(Order.OrderStatus.COMPLETED);
        when(orderRepository.findById(testOrderId)).thenReturn(Optional.of(testOrder));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> {
            Notification notification = invocation.getArgument(0);
            notification.setId(2L);
            return notification;
        });
        
        // when
        Notification notification = notificationService.sendOrderCompletedNotification(testOrderId);
        
        // then
        assertThat(notification).isNotNull();
        assertThat(notification.getOrderId()).isEqualTo(testOrderId);
        assertThat(notification.getStoreId()).isEqualTo(testStoreId);
        assertThat(notification.getUserType()).isEqualTo(Notification.UserType.CUSTOMER);
        assertThat(notification.getNotificationType()).isEqualTo(Notification.NotificationType.ORDER_COMPLETED);
        assertThat(notification.getMessage()).contains("완료되었습니다");
        assertThat(notification.getIsRead()).isFalse();
        
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }
    
    @Test
    @DisplayName("주문 취소 시 양방향 알림 전송")
    void testSendOrderCancelledNotification() {
        // given
        testOrder.setStatus(Order.OrderStatus.CANCELLED);
        when(orderRepository.findById(testOrderId)).thenReturn(Optional.of(testOrder));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> {
            Notification notification = invocation.getArgument(0);
            notification.setId(3L);
            return notification;
        });
        
        // when
        List<Notification> notifications = notificationService.sendOrderCancelledNotification(testOrderId);
        
        // then
        assertThat(notifications).hasSize(2);
        
        Notification adminNotification = notifications.stream()
                .filter(n -> n.getUserType() == Notification.UserType.ADMIN)
                .findFirst()
                .orElseThrow();
        assertThat(adminNotification.getNotificationType()).isEqualTo(Notification.NotificationType.ORDER_CANCELLED);
        
        Notification customerNotification = notifications.stream()
                .filter(n -> n.getUserType() == Notification.UserType.CUSTOMER)
                .findFirst()
                .orElseThrow();
        assertThat(customerNotification.getNotificationType()).isEqualTo(Notification.NotificationType.ORDER_CANCELLED);
        
        verify(notificationRepository, times(2)).save(any(Notification.class));
    }
    
    @Test
    @DisplayName("결제 완료 시 고객에게 알림 전송")
    void testSendPaymentCompletedNotification() {
        // given
        when(orderRepository.findById(testOrderId)).thenReturn(Optional.of(testOrder));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> {
            Notification notification = invocation.getArgument(0);
            notification.setId(4L);
            return notification;
        });
        
        // when
        Notification notification = notificationService.sendPaymentCompletedNotification(testOrderId);
        
        // then
        assertThat(notification).isNotNull();
        assertThat(notification.getOrderId()).isEqualTo(testOrderId);
        assertThat(notification.getStoreId()).isEqualTo(testStoreId);
        assertThat(notification.getUserType()).isEqualTo(Notification.UserType.CUSTOMER);
        assertThat(notification.getNotificationType()).isEqualTo(Notification.NotificationType.PAYMENT_COMPLETED);
        assertThat(notification.getMessage()).contains("결제가 완료되었습니다");
        assertThat(notification.getIsRead()).isFalse();
        
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }
    
    @Test
    @DisplayName("매장별 미읽음 알림 개수 조회")
    void testGetUnreadNotificationCount() {
        // given
        when(notificationRepository.countByStoreIdAndUserTypeAndIsReadFalse(
                testStoreId, Notification.UserType.ADMIN))
                .thenReturn(5L);
        
        // when
        long count = notificationService.getUnreadNotificationCount(testStoreId, Notification.UserType.ADMIN);
        
        // then
        assertThat(count).isEqualTo(5L);
        verify(notificationRepository, times(1))
                .countByStoreIdAndUserTypeAndIsReadFalse(testStoreId, Notification.UserType.ADMIN);
    }
    
    @Test
    @DisplayName("매장별 알림 목록 조회")
    void testGetNotifications() {
        // given
        Notification notification1 = Notification.builder()
                .id(1L)
                .orderId(testOrderId)
                .storeId(testStoreId)
                .userType(Notification.UserType.ADMIN)
                .notificationType(Notification.NotificationType.ORDER_RECEIVED)
                .message("새 주문이 접수되었습니다")
                .isRead(false)
                .build();
        
        Notification notification2 = Notification.builder()
                .id(2L)
                .orderId(testOrderId)
                .storeId(testStoreId)
                .userType(Notification.UserType.ADMIN)
                .notificationType(Notification.NotificationType.ORDER_CANCELLED)
                .message("주문이 취소되었습니다")
                .isRead(true)
                .build();
        
        when(notificationRepository.findByStoreIdAndUserTypeOrderBySentAtDesc(
                testStoreId, Notification.UserType.ADMIN))
                .thenReturn(Arrays.asList(notification1, notification2));
        
        // when
        List<Notification> notifications = notificationService.getNotifications(
                testStoreId, Notification.UserType.ADMIN);
        
        // then
        assertThat(notifications).hasSize(2);
        assertThat(notifications.get(0).getId()).isEqualTo(1L);
        assertThat(notifications.get(1).getId()).isEqualTo(2L);
        
        verify(notificationRepository, times(1))
                .findByStoreIdAndUserTypeOrderBySentAtDesc(testStoreId, Notification.UserType.ADMIN);
    }
    
    @Test
    @DisplayName("알림 읽음 처리")
    void testMarkAsRead() {
        // given
        Notification notification = Notification.builder()
                .id(1L)
                .orderId(testOrderId)
                .storeId(testStoreId)
                .userType(Notification.UserType.ADMIN)
                .notificationType(Notification.NotificationType.ORDER_RECEIVED)
                .message("새 주문이 접수되었습니다")
                .isRead(false)
                .build();
        
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);
        
        // when
        Notification updatedNotification = notificationService.markAsRead(1L);
        
        // then
        assertThat(updatedNotification.getIsRead()).isTrue();
        assertThat(updatedNotification.getReadAt()).isNotNull();
        
        verify(notificationRepository, times(1)).findById(1L);
        verify(notificationRepository, times(1)).save(notification);
    }
}
