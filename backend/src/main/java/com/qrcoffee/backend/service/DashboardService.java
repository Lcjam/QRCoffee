package com.qrcoffee.backend.service;

import com.qrcoffee.backend.common.Constants;
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
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern(Constants.Dashboard.DATE_FORMAT_PATTERN);
    
    /**
     * 전체 대시보드 통계 조회
     */
    public DashboardStatsResponse getDashboardStats(Long storeId) {
        log.info("대시보드 통계 조회: storeId={}", storeId);
        
        return DashboardStatsResponse.builder()
                .basicStats(getBasicStats(storeId))
                .salesStats(getSalesStats(storeId))
                .orderStats(getOrderStats(storeId))
                .popularMenus(getPopularMenus(storeId, Constants.Dashboard.DEFAULT_POPULAR_MENU_LIMIT))
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
        
        // 안전한 타입 변환 (null 체크 및 타입 확인)
        long todayOrderCount = extractLongValue(result, 0);
        long pendingOrderCount = extractLongValue(result, 1);
        BigDecimal todaySalesAmount = extractBigDecimalValue(result, 2);
        long totalOrderCount = extractLongValue(result, 3);
        
        return DashboardStatsResponse.BasicStats.builder()
                .todayOrderCount(todayOrderCount)
                .pendingOrderCount(pendingOrderCount)
                .todaySalesAmount(todaySalesAmount.longValue())
                .totalOrderCount(totalOrderCount)
                .build();
    }
    
    /**
     * Object[]에서 Long 값 안전하게 추출
     */
    private long extractLongValue(Object[] result, int index) {
        if (result == null || index >= result.length || result[index] == null) {
            return 0L;
        }
        Object value = result[index];
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException e) {
            log.warn("Long 값 추출 실패: index={}, value={}", index, value);
            return 0L;
        }
    }
    
    /**
     * Object[]에서 BigDecimal 값 안전하게 추출
     */
    private BigDecimal extractBigDecimalValue(Object[] result, int index) {
        if (result == null || index >= result.length || result[index] == null) {
            return BigDecimal.ZERO;
        }
        Object value = result[index];
        if (value instanceof BigDecimal) {
            return (BigDecimal) value;
        }
        if (value instanceof Number) {
            return BigDecimal.valueOf(((Number) value).doubleValue());
        }
        try {
            return new BigDecimal(value.toString());
        } catch (NumberFormatException e) {
            log.warn("BigDecimal 값 추출 실패: index={}, value={}", index, value);
            return BigDecimal.ZERO;
        }
    }
    
    /**
     * Object[]에서 Integer 값 안전하게 추출
     */
    private Integer extractIntegerValue(Object[] result, int index) {
        if (result == null || index >= result.length || result[index] == null) {
            return null;
        }
        Object value = result[index];
        if (value instanceof Integer) {
            return (Integer) value;
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException e) {
            log.warn("Integer 값 추출 실패: index={}, value={}", index, value);
            return null;
        }
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
                .pendingCount(extractLongValue(result, 0))
                .preparingCount(extractLongValue(result, 1))
                .completedCount(extractLongValue(result, 2))
                .pickedUpCount(extractLongValue(result, 3))
                .cancelledCount(extractLongValue(result, 4))
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
                .filter(result -> result != null && result.length >= 5)
                .map(result -> {
                    Long menuId = extractLongValue(result, 0);
                    String menuName = result[1] != null ? result[1].toString() : "";
                    Long orderCount = extractLongValue(result, 2);
                    Long totalQuantity = extractLongValue(result, 3);
                    BigDecimal totalRevenue = extractBigDecimalValue(result, 4);
                    
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
            if (result == null || result.length < 3) {
                continue;
            }
            Integer hour = extractIntegerValue(result, 0);
            Long orderCount = extractLongValue(result, 1);
            BigDecimal salesAmount = extractBigDecimalValue(result, 2);
            
            if (hour != null && hour >= 0 && hour < 24) {
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
                            Long orderCount = extractLongValue(result, 1);
                            BigDecimal amount = extractBigDecimalValue(result, 2);
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
