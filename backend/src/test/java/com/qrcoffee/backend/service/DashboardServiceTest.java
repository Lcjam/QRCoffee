package com.qrcoffee.backend.service;

import com.qrcoffee.backend.dto.DashboardStatsResponse;
import com.qrcoffee.backend.entity.Order;
import com.qrcoffee.backend.entity.Payment;
import com.qrcoffee.backend.repository.OrderRepository;
import com.qrcoffee.backend.repository.OrderItemRepository;
import com.qrcoffee.backend.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DashboardService 테스트")
class DashboardServiceTest {
    
    @Mock
    private OrderRepository orderRepository;
    
    @Mock
    private PaymentRepository paymentRepository;
    
    @Mock
    private OrderItemRepository orderItemRepository;
    
    @InjectMocks
    private DashboardService dashboardService;
    
    private Long testStoreId;
    
    @BeforeEach
    void setUp() {
        testStoreId = 1L;
    }
    
    @Test
    @DisplayName("기본 통계 조회")
    void testGetBasicStats() {
        // given - 단일 쿼리로 통합된 메서드 사용
        Object[] mockResult = new Object[]{
            10L,  // todayOrderCount
            3L,   // pendingOrderCount
            50000L, // todaySalesAmount
            100L   // totalOrderCount
        };
        when(orderRepository.findBasicStatsByStoreId(eq(testStoreId), any(LocalDateTime.class)))
                .thenReturn(mockResult);
        
        // when
        DashboardStatsResponse.BasicStats stats = dashboardService.getBasicStats(testStoreId);
        
        // then
        assertThat(stats).isNotNull();
        assertThat(stats.getTodayOrderCount()).isEqualTo(10L);
        assertThat(stats.getPendingOrderCount()).isEqualTo(3L);
        assertThat(stats.getTodaySalesAmount()).isEqualTo(50000L);
        assertThat(stats.getTotalOrderCount()).isEqualTo(100L);
        
        verify(orderRepository, times(1)).findBasicStatsByStoreId(eq(testStoreId), any(LocalDateTime.class));
    }
    
    @Test
    @DisplayName("매출 통계 조회")
    void testGetSalesStats() {
        // given
        Payment payment1 = Payment.builder()
                .totalAmount(BigDecimal.valueOf(10000))
                .status("DONE")
                .build();
        Payment payment2 = Payment.builder()
                .totalAmount(BigDecimal.valueOf(15000))
                .status("DONE")
                .build();
        
        when(paymentRepository.findByStoreIdAndDateRange(eq(testStoreId), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(Arrays.asList(payment1, payment2));
        
        // when
        DashboardStatsResponse.SalesStats salesStats = dashboardService.getSalesStats(testStoreId);
        
        // then
        assertThat(salesStats).isNotNull();
        assertThat(salesStats.getTodaySales()).isNotNull();
        
        verify(paymentRepository, atLeastOnce()).findByStoreIdAndDateRange(eq(testStoreId), any(LocalDateTime.class), any(LocalDateTime.class));
    }
    
    @Test
    @DisplayName("주문 현황 조회")
    void testGetOrderStats() {
        // given - 단일 쿼리로 통합된 메서드 사용
        Object[] mockResult = new Object[]{
            5L,  // pendingCount
            3L,  // preparingCount
            10L, // completedCount
            20L, // pickedUpCount
            2L   // cancelledCount
        };
        when(orderRepository.findOrderStatsByStoreId(testStoreId))
                .thenReturn(mockResult);
        
        // when
        DashboardStatsResponse.OrderStats orderStats = dashboardService.getOrderStats(testStoreId);
        
        // then
        assertThat(orderStats).isNotNull();
        assertThat(orderStats.getPendingCount()).isEqualTo(5L);
        assertThat(orderStats.getPreparingCount()).isEqualTo(3L);
        assertThat(orderStats.getCompletedCount()).isEqualTo(10L);
        assertThat(orderStats.getPickedUpCount()).isEqualTo(20L);
        assertThat(orderStats.getCancelledCount()).isEqualTo(2L);
        
        verify(orderRepository, times(1)).findOrderStatsByStoreId(testStoreId);
    }
    
    @Test
    @DisplayName("인기 메뉴 조회")
    void testGetPopularMenus() {
        // given - Pageable 파라미터 포함
        Pageable pageable = PageRequest.of(0, 10);
        when(orderItemRepository.findPopularMenusByStoreId(
                eq(testStoreId), eq(Order.OrderStatus.CANCELLED), eq(pageable)))
                .thenReturn(Collections.emptyList());
        
        // when
        List<DashboardStatsResponse.PopularMenu> popularMenus = dashboardService.getPopularMenus(testStoreId, 10);
        
        // then
        assertThat(popularMenus).isNotNull();
        
        verify(orderItemRepository, times(1)).findPopularMenusByStoreId(
                eq(testStoreId), eq(Order.OrderStatus.CANCELLED), any(Pageable.class));
    }
    
    @Test
    @DisplayName("시간대별 통계 조회")
    void testGetHourlyStats() {
        // given
        when(orderRepository.findHourlyStatsByStoreId(eq(testStoreId), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());
        
        // when
        List<DashboardStatsResponse.HourlyStats> hourlyStats = dashboardService.getHourlyStats(testStoreId);
        
        // then
        assertThat(hourlyStats).isNotNull();
        
        verify(orderRepository, times(1)).findHourlyStatsByStoreId(eq(testStoreId), any(LocalDateTime.class));
    }
    
    @Test
    @DisplayName("전체 대시보드 통계 조회")
    void testGetDashboardStats() {
        // given - 수정된 메서드 시그니처에 맞게 수정
        Object[] basicStatsResult = new Object[]{10L, 3L, 50000L, 100L};
        when(orderRepository.findBasicStatsByStoreId(eq(testStoreId), any(LocalDateTime.class)))
                .thenReturn(basicStatsResult);
        
        Object[] orderStatsResult = new Object[]{5L, 3L, 10L, 20L, 2L};
        when(orderRepository.findOrderStatsByStoreId(testStoreId))
                .thenReturn(orderStatsResult);
        
        when(paymentRepository.findByStoreIdAndDateRange(eq(testStoreId), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());
        when(orderItemRepository.findPopularMenusByStoreId(
                eq(testStoreId), eq(Order.OrderStatus.CANCELLED), any(Pageable.class)))
                .thenReturn(Collections.emptyList());
        when(orderRepository.findHourlyStatsByStoreId(eq(testStoreId), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());
        
        // when
        DashboardStatsResponse stats = dashboardService.getDashboardStats(testStoreId);
        
        // then
        assertThat(stats).isNotNull();
        assertThat(stats.getBasicStats()).isNotNull();
        assertThat(stats.getSalesStats()).isNotNull();
        assertThat(stats.getOrderStats()).isNotNull();
        assertThat(stats.getPopularMenus()).isNotNull();
        assertThat(stats.getHourlyStats()).isNotNull();
    }
}
