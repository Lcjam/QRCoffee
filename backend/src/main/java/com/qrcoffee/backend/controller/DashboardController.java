package com.qrcoffee.backend.controller;

import com.qrcoffee.backend.common.ApiResponse;
import com.qrcoffee.backend.common.BaseController;
import com.qrcoffee.backend.dto.DashboardStatsResponse;
import com.qrcoffee.backend.service.DashboardService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Validated
public class DashboardController extends BaseController {
    
    private final DashboardService dashboardService;
    
    /**
     * 전체 대시보드 통계 조회
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats(HttpServletRequest request) {
        Long storeId = getStoreId(request);
        
        DashboardStatsResponse stats = dashboardService.getDashboardStats(storeId);
        
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    /**
     * 기본 통계 조회
     */
    @GetMapping("/stats/basic")
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<DashboardStatsResponse.BasicStats>> getBasicStats(HttpServletRequest request) {
        Long storeId = getStoreId(request);
        
        DashboardStatsResponse.BasicStats stats = dashboardService.getBasicStats(storeId);
        
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    /**
     * 매출 통계 조회
     */
    @GetMapping("/stats/sales")
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<DashboardStatsResponse.SalesStats>> getSalesStats(HttpServletRequest request) {
        Long storeId = getStoreId(request);
        
        DashboardStatsResponse.SalesStats stats = dashboardService.getSalesStats(storeId);
        
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    /**
     * 주문 현황 조회
     */
    @GetMapping("/stats/orders")
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<DashboardStatsResponse.OrderStats>> getOrderStats(HttpServletRequest request) {
        Long storeId = getStoreId(request);
        
        DashboardStatsResponse.OrderStats stats = dashboardService.getOrderStats(storeId);
        
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    /**
     * 인기 메뉴 조회
     */
    @GetMapping("/stats/popular-menus")
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<java.util.List<DashboardStatsResponse.PopularMenu>>> getPopularMenus(
            @RequestParam(defaultValue = "10") 
            @jakarta.validation.constraints.Min(value = 1, message = "limit은 최소 1 이상이어야 합니다")
            @jakarta.validation.constraints.Max(value = 100, message = "limit은 최대 100 이하여야 합니다")
            int limit,
            HttpServletRequest request) {
        Long storeId = getStoreId(request);
        
        java.util.List<DashboardStatsResponse.PopularMenu> popularMenus = 
                dashboardService.getPopularMenus(storeId, limit);
        
        return ResponseEntity.ok(ApiResponse.success(popularMenus));
    }
    
    /**
     * 시간대별 통계 조회
     */
    @GetMapping("/stats/hourly")
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<java.util.List<DashboardStatsResponse.HourlyStats>>> getHourlyStats(
            HttpServletRequest request) {
        Long storeId = getStoreId(request);
        
        java.util.List<DashboardStatsResponse.HourlyStats> hourlyStats = 
                dashboardService.getHourlyStats(storeId);
        
        return ResponseEntity.ok(ApiResponse.success(hourlyStats));
    }
}
