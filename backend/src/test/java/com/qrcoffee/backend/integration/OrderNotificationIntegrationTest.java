package com.qrcoffee.backend.integration;

import com.qrcoffee.backend.dto.OrderRequest;
import com.qrcoffee.backend.dto.OrderItemRequest;
import com.qrcoffee.backend.dto.OrderResponse;
import com.qrcoffee.backend.entity.Notification;
import com.qrcoffee.backend.entity.Order;
import com.qrcoffee.backend.repository.NotificationRepository;
import com.qrcoffee.backend.repository.OrderRepository;
import com.qrcoffee.backend.service.OrderService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 주문-알림 통합 테스트
 * 실제 데이터베이스가 필요합니다. 테스트 실행 전에 데이터베이스가 실행 중이어야 합니다.
 * 
 * 주의: 이 테스트는 실제 데이터베이스 연결이 필요하므로 기본적으로 비활성화되어 있습니다.
 * 실행하려면 @Disabled 어노테이션을 제거하고 데이터베이스를 준비하세요.
 */
@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.show-sql=true"
})
@Transactional
@Disabled("실제 데이터베이스 연결 필요 - 통합 테스트는 실제 환경에서만 실행")
@DisplayName("주문-알림 통합 테스트")
class OrderNotificationIntegrationTest {
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Test
    @DisplayName("주문 생성 시 관리자 알림이 생성되어야 함")
    void testOrderCreationCreatesAdminNotification() {
        // given
        OrderRequest orderRequest = OrderRequest.builder()
                .storeId(1L)
                .seatId(1L)
                .orderItems(Arrays.asList(
                        OrderItemRequest.builder()
                                .menuId(1L)
                                .quantity(2)
                                .build()
                ))
                .build();
        
        // when
        OrderResponse orderResponse = orderService.createOrder(orderRequest);
        
        // then - 주문이 생성되었는지 확인
        assertThat(orderResponse).isNotNull();
        assertThat(orderResponse.getId()).isNotNull();
        
        // 알림이 생성되었는지 확인
        List<Notification> notifications = notificationRepository.findByOrderIdOrderBySentAtDesc(orderResponse.getId());
        assertThat(notifications).isNotEmpty();
        
        // 관리자 알림이 있는지 확인
        Notification adminNotification = notifications.stream()
                .filter(n -> n.getUserType() == Notification.UserType.ADMIN)
                .filter(n -> n.getNotificationType() == Notification.NotificationType.ORDER_RECEIVED)
                .findFirst()
                .orElse(null);
        
        assertThat(adminNotification).isNotNull();
        assertThat(adminNotification.getOrderId()).isEqualTo(orderResponse.getId());
        assertThat(adminNotification.getStoreId()).isEqualTo(orderRequest.getStoreId());
        assertThat(adminNotification.getMessage()).contains("새 주문이 접수되었습니다");
        assertThat(adminNotification.getIsRead()).isFalse();
    }
    
    @Test
    @DisplayName("주문 상태를 제조완료로 변경 시 고객 알림이 생성되어야 함")
    void testOrderStatusChangeToCompletedCreatesCustomerNotification() {
        // given - 주문 생성
        OrderRequest orderRequest = OrderRequest.builder()
                .storeId(1L)
                .seatId(1L)
                .orderItems(Arrays.asList(
                        OrderItemRequest.builder()
                                .menuId(1L)
                                .quantity(1)
                                .build()
                ))
                .build();
        
        OrderResponse orderResponse = orderService.createOrder(orderRequest);
        Long orderId = orderResponse.getId();
        
        // when - 주문 상태를 제조완료로 변경
        orderService.updateOrderStatus(orderId, 1L, Order.OrderStatus.COMPLETED);
        
        // then - 고객 알림이 생성되었는지 확인
        List<Notification> notifications = notificationRepository.findByOrderIdOrderBySentAtDesc(orderId);
        
        Notification customerNotification = notifications.stream()
                .filter(n -> n.getUserType() == Notification.UserType.CUSTOMER)
                .filter(n -> n.getNotificationType() == Notification.NotificationType.ORDER_COMPLETED)
                .findFirst()
                .orElse(null);
        
        assertThat(customerNotification).isNotNull();
        assertThat(customerNotification.getOrderId()).isEqualTo(orderId);
        assertThat(customerNotification.getMessage()).contains("완료되었습니다");
        assertThat(customerNotification.getIsRead()).isFalse();
    }
    
    @Test
    @DisplayName("주문 취소 시 양방향 알림이 생성되어야 함")
    void testOrderCancellationCreatesBidirectionalNotifications() {
        // given - 주문 생성
        OrderRequest orderRequest = OrderRequest.builder()
                .storeId(1L)
                .seatId(1L)
                .orderItems(Arrays.asList(
                        OrderItemRequest.builder()
                                .menuId(1L)
                                .quantity(1)
                                .build()
                ))
                .build();
        
        OrderResponse orderResponse = orderService.createOrder(orderRequest);
        Long orderId = orderResponse.getId();
        
        // when - 주문 취소
        orderService.updateOrderStatus(orderId, 1L, Order.OrderStatus.CANCELLED);
        
        // then - 양방향 알림이 생성되었는지 확인
        List<Notification> notifications = notificationRepository.findByOrderIdOrderBySentAtDesc(orderId);
        
        // 관리자 알림 확인
        Notification adminNotification = notifications.stream()
                .filter(n -> n.getUserType() == Notification.UserType.ADMIN)
                .filter(n -> n.getNotificationType() == Notification.NotificationType.ORDER_CANCELLED)
                .findFirst()
                .orElse(null);
        
        assertThat(adminNotification).isNotNull();
        assertThat(adminNotification.getMessage()).contains("취소되었습니다");
        
        // 고객 알림 확인
        Notification customerNotification = notifications.stream()
                .filter(n -> n.getUserType() == Notification.UserType.CUSTOMER)
                .filter(n -> n.getNotificationType() == Notification.NotificationType.ORDER_CANCELLED)
                .findFirst()
                .orElse(null);
        
        assertThat(customerNotification).isNotNull();
        assertThat(customerNotification.getMessage()).contains("취소되었습니다");
    }
}

