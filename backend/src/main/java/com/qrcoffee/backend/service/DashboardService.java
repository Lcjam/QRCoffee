package com.qrcoffee.backend.service;

import com.qrcoffee.backend.dto.DashboardStatsResponse;
import com.qrcoffee.backend.entity.Order;
import com.qrcoffee.backend.entity.Payment;
import com.qrcoffee.backend.repository.OrderItemRepository;
import com.qrcoffee.backend.repository.OrderRepository;
import com.qrcoffee.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.qrcoffee.backend.entity.Order.OrderStatus.CANCELLED;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardService {
    
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final OrderItemRepository orderItemRepository;
    
    private static final int DEFAULT_POPULAR_MENU_LIMIT = 10;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    
    /**
     * 전체 대시보드 통계 조회
     */
    public DashboardStatsResponse getDashboardStats(Long storeId) {
        log.info("대시보드 통계 조회: storeId={}", storeId);
        
        return DashboardStatsResponse.builder()
                .basicStats(getBasicStats(storeId))
                .salesStats(getSalesStats(storeId))
                .orderStats(getOrderStats(storeId))
                .popularMenus(getPopularMenus(storeId, DEFAULT_POPULAR_MENU_LIMIT))
                .hourlyStats(getHourlyStats(storeId))
                .build();
    }
    
    /**
     * 기본 통계 조회
     */
    public DashboardStatsResponse.BasicStats getBasicStats(Long storeId) {
        LocalDateTime today = LocalDateTime.now();
        LocalDateTime startOfToday = today.toLocalDate().atStartOfDay();
        LocalDateTime endOfToday = today.toLocalDate().atTime(23, 59, 59);
        
        long todayOrderCount = orderRepository.countByStoreIdAndDate(storeId, today);
        long pendingOrderCount = orderRepository.countByStoreIdAndStatus(storeId, Order.OrderStatus.PENDING);
        
        // 오늘 매출액 계산
        List<Payment> todayPayments = paymentRepository.findByStoreIdAndDateRange(
                storeId, startOfToday, endOfToday.plusSeconds(1));
        BigDecimal todaySalesAmount = todayPayments.stream()
                .map(Payment::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // 전체 주문 수 (취소 제외)
        long totalOrderCount = orderRepository.findByStoreIdOrderByCreatedAtDesc(storeId).stream()
                .filter(order -> order.getStatus() != Order.OrderStatus.CANCELLED)
                .count();
        
        return DashboardStatsResponse.BasicStats.builder()
                .todayOrderCount(todayOrderCount)
                .pendingOrderCount(pendingOrderCount)
                .todaySalesAmount(todaySalesAmount.longValue())
                .totalOrderCount(totalOrderCount)
                .build();
    }
    
    /**
     * 매출 통계 조회
     */
    public DashboardStatsResponse.SalesStats getSalesStats(Long storeId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfWeek = now.toLocalDate().minusDays(now.getDayOfWeek().getValue() - 1).atStartOfDay();
        LocalDateTime startOfMonth = now.toLocalDate().withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfToday = now.toLocalDate().atTime(23, 59, 59).plusSeconds(1);
        
        // 오늘 매출
        List<Payment> todayPayments = paymentRepository.findByStoreIdAndDateRange(
                storeId, startOfToday, endOfToday);
        BigDecimal todaySales = calculateTotalSales(todayPayments);
        
        // 이번 주 매출
        List<Payment> weekPayments = paymentRepository.findByStoreIdAndDateRange(
                storeId, startOfWeek, endOfToday);
        BigDecimal weekSales = calculateTotalSales(weekPayments);
        
        // 이번 달 매출
        List<Payment> monthPayments = paymentRepository.findByStoreIdAndDateRange(
                storeId, startOfMonth, endOfToday);
        BigDecimal monthSales = calculateTotalSales(monthPayments);
        
        // 최근 7일 일별 매출
        List<DashboardStatsResponse.DailySales> dailySales = getDailySales(storeId, 7);
        
        return DashboardStatsResponse.SalesStats.builder()
                .todaySales(todaySales)
                .weekSales(weekSales)
                .monthSales(monthSales)
                .dailySales(dailySales)
                .build();
    }
    
    /**
     * 주문 현황 조회
     */
    public DashboardStatsResponse.OrderStats getOrderStats(Long storeId) {
        return DashboardStatsResponse.OrderStats.builder()
                .pendingCount(orderRepository.countByStoreIdAndStatus(storeId, Order.OrderStatus.PENDING))
                .preparingCount(orderRepository.countByStoreIdAndStatus(storeId, Order.OrderStatus.PREPARING))
                .completedCount(orderRepository.countByStoreIdAndStatus(storeId, Order.OrderStatus.COMPLETED))
                .pickedUpCount(orderRepository.countByStoreIdAndStatus(storeId, Order.OrderStatus.PICKED_UP))
                .cancelledCount(orderRepository.countByStoreIdAndStatus(storeId, Order.OrderStatus.CANCELLED))
                .build();
    }
    
    /**
     * 인기 메뉴 조회
     */
    public List<DashboardStatsResponse.PopularMenu> getPopularMenus(Long storeId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Object[]> results = orderItemRepository.findPopularMenusByStoreId(
                storeId, Order.OrderStatus.CANCELLED, pageable);
        
        return results.stream()
                .map(result -> {
                    Long menuId = ((Number) result[0]).longValue();
                    String menuName = (String) result[1];
                    Long orderCount = ((Number) result[2]).longValue();
                    Long totalQuantity = ((Number) result[3]).longValue();
                    BigDecimal totalRevenue = result[4] != null ? 
                            new BigDecimal(result[4].toString()) : BigDecimal.ZERO;
                    
                    return DashboardStatsResponse.PopularMenu.builder()
                            .menuId(menuId)
                            .menuName(menuName)
                            .orderCount(orderCount)
                            .totalQuantity(totalQuantity)
                            .totalRevenue(totalRevenue)
                            .build();
                })
                .collect(Collectors.toList());
    }
    
    /**
     * 시간대별 통계 조회 (오늘)
     */
    public List<DashboardStatsResponse.HourlyStats> getHourlyStats(Long storeId) {
        LocalDateTime today = LocalDateTime.now();
        List<Object[]> results = orderRepository.findHourlyStatsByStoreId(storeId, today);
        
        // 0-23시까지 모든 시간대 초기화
        List<DashboardStatsResponse.HourlyStats> hourlyStats = new ArrayList<>();
        for (int hour = 0; hour < 24; hour++) {
            hourlyStats.add(DashboardStatsResponse.HourlyStats.builder()
                    .hour(hour)
                    .orderCount(0L)
                    .salesAmount(BigDecimal.ZERO)
                    .build());
        }
        
        // 실제 데이터로 채우기
        for (Object[] result : results) {
            Integer hour = ((Number) result[0]).intValue();
            Long orderCount = ((Number) result[1]).longValue();
            BigDecimal salesAmount = result[2] != null ? 
                    new BigDecimal(result[2].toString()) : BigDecimal.ZERO;
            
            if (hour >= 0 && hour < 24) {
                hourlyStats.set(hour, DashboardStatsResponse.HourlyStats.builder()
                        .hour(hour)
                        .orderCount(orderCount)
                        .salesAmount(salesAmount)
                        .build());
            }
        }
        
        return hourlyStats;
    }
    
    /**
     * 결제 목록에서 총 매출 계산
     */
    private BigDecimal calculateTotalSales(List<Payment> payments) {
        return payments.stream()
                .filter(p -> "DONE".equals(p.getStatus()))
                .map(Payment::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(0, RoundingMode.HALF_UP);
    }
    
    /**
     * 일별 매출 조회 (최근 N일)
     */
    private List<DashboardStatsResponse.DailySales> getDailySales(Long storeId, int days) {
        List<DashboardStatsResponse.DailySales> dailySales = new ArrayList<>();
        LocalDate today = LocalDate.now();
        
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.atTime(23, 59, 59).plusSeconds(1);
            
            List<Payment> payments = paymentRepository.findByStoreIdAndDateRange(
                    storeId, startOfDay, endOfDay);
            
            BigDecimal amount = calculateTotalSales(payments);
            long orderCount = payments.stream()
                    .filter(p -> "DONE".equals(p.getStatus()))
                    .count();
            
            dailySales.add(DashboardStatsResponse.DailySales.builder()
                    .date(date.format(DATE_FORMATTER))
                    .amount(amount)
                    .orderCount(orderCount)
                    .build());
        }
        
        return dailySales;
    }
}
