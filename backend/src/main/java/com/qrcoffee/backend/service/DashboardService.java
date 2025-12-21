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
import java.util.Map;
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
     * CASE WHEN을 사용한 단일 쿼리로 N+1 문제 해결
     */
    public DashboardStatsResponse.BasicStats getBasicStats(Long storeId) {
        LocalDateTime today = LocalDateTime.now();
        
        // 단일 쿼리로 모든 기본 통계 조회
        Object[] result = orderRepository.findBasicStatsByStoreId(storeId, today);
        
        long todayOrderCount = ((Number) result[0]).longValue();
        long pendingOrderCount = ((Number) result[1]).longValue();
        BigDecimal todaySalesAmount = result[2] != null ? 
                new BigDecimal(result[2].toString()) : BigDecimal.ZERO;
        long totalOrderCount = ((Number) result[3]).longValue();
        
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
     * CASE WHEN을 사용한 단일 쿼리로 N+1 문제 해결
     */
    public DashboardStatsResponse.OrderStats getOrderStats(Long storeId) {
        // 단일 쿼리로 모든 주문 상태별 개수 조회
        Object[] result = orderRepository.findOrderStatsByStoreId(storeId);
        
        return DashboardStatsResponse.OrderStats.builder()
                .pendingCount(((Number) result[0]).longValue())
                .preparingCount(((Number) result[1]).longValue())
                .completedCount(((Number) result[2]).longValue())
                .pickedUpCount(((Number) result[3]).longValue())
                .cancelledCount(((Number) result[4]).longValue())
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
     * GROUP BY를 사용한 단일 쿼리로 N+1 문제 해결
     */
    private List<DashboardStatsResponse.DailySales> getDailySales(Long storeId, int days) {
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(days - 1);
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = today.atTime(23, 59, 59).plusSeconds(1);
        
        // 단일 쿼리로 모든 일별 데이터 조회
        List<Object[]> results = paymentRepository.findDailySalesByStoreId(
                storeId, startDateTime, endDateTime);
        
        // 결과를 Map으로 변환 (날짜를 키로)
        Map<String, DashboardStatsResponse.DailySales> salesMap = results.stream()
                .collect(Collectors.toMap(
                        result -> {
                            // Native query의 DATE() 결과는 java.sql.Date 또는 String일 수 있음
                            Object dateObj = result[0];
                            if (dateObj instanceof java.sql.Date) {
                                return ((java.sql.Date) dateObj).toLocalDate().format(DATE_FORMATTER);
                            } else if (dateObj instanceof String) {
                                return (String) dateObj;
                            } else {
                                return dateObj.toString();
                            }
                        },
                        result -> {
                            Object dateObj = result[0];
                            String dateStr;
                            if (dateObj instanceof java.sql.Date) {
                                dateStr = ((java.sql.Date) dateObj).toLocalDate().format(DATE_FORMATTER);
                            } else if (dateObj instanceof String) {
                                dateStr = (String) dateObj;
                            } else {
                                dateStr = dateObj.toString();
                            }
                            Long orderCount = ((Number) result[1]).longValue();
                            BigDecimal amount = result[2] != null ? 
                                    new BigDecimal(result[2].toString()) : BigDecimal.ZERO;
                            return DashboardStatsResponse.DailySales.builder()
                                    .date(dateStr)
                                    .amount(amount)
                                    .orderCount(orderCount)
                                    .build();
                        }
                ));
        
        // 모든 날짜에 대해 결과 생성 (데이터가 없는 날은 0으로 채움)
        List<DashboardStatsResponse.DailySales> dailySales = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            String dateStr = date.format(DATE_FORMATTER);
            
            dailySales.add(salesMap.getOrDefault(dateStr,
                    DashboardStatsResponse.DailySales.builder()
                            .date(dateStr)
                            .amount(BigDecimal.ZERO)
                            .orderCount(0L)
                            .build()));
        }
        
        return dailySales;
    }
}
