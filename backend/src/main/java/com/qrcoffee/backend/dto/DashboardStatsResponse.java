package com.qrcoffee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {
    
    // 기본 통계
    private BasicStats basicStats;
    
    // 매출 통계
    private SalesStats salesStats;
    
    // 주문 현황
    private OrderStats orderStats;
    
    // 인기 메뉴
    private List<PopularMenu> popularMenus;
    
    // 시간대별 통계
    private List<HourlyStats> hourlyStats;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BasicStats {
        private Long todayOrderCount;      // 오늘 주문 수
        private Long pendingOrderCount;    // 대기 중인 주문 수
        private Long todaySalesAmount;     // 오늘 매출액
        private Long totalOrderCount;      // 전체 주문 수
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SalesStats {
        private BigDecimal todaySales;      // 오늘 매출
        private BigDecimal weekSales;       // 이번 주 매출
        private BigDecimal monthSales;      // 이번 달 매출
        private List<DailySales> dailySales; // 일별 매출 (최근 7일)
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailySales {
        private String date;                // 날짜 (YYYY-MM-DD)
        private BigDecimal amount;          // 매출액
        private Long orderCount;            // 주문 수
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderStats {
        private Long pendingCount;          // 주문접수
        private Long preparingCount;        // 제조중
        private Long completedCount;         // 제조완료
        private Long pickedUpCount;         // 수령완료
        private Long cancelledCount;        // 취소됨
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PopularMenu {
        private Long menuId;                // 메뉴 ID
        private String menuName;            // 메뉴명
        private Long orderCount;            // 주문 횟수
        private Long totalQuantity;         // 총 판매 수량
        private BigDecimal totalRevenue;    // 총 매출액
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HourlyStats {
        private Integer hour;               // 시간 (0-23)
        private Long orderCount;            // 주문 수
        private BigDecimal salesAmount;     // 매출액
    }
}
