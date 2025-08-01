package com.qrcoffee.backend.controller;

import com.qrcoffee.backend.common.ApiResponse;
import com.qrcoffee.backend.dto.OrderResponse;
import com.qrcoffee.backend.dto.OrderStatsResponse;
import com.qrcoffee.backend.dto.OrderStatusStatsResponse;
import com.qrcoffee.backend.entity.Order;
import com.qrcoffee.backend.service.OrderService;
import com.qrcoffee.backend.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AdminOrderController {
    
    private final OrderService orderService;
    private final JwtUtil jwtUtil;
    
    /**
     * 매장별 주문 목록 조회 (관리자용)
     */
    @GetMapping
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrders(
            HttpServletRequest request,
            @RequestParam(required = false) String status) {
        
        Long storeId = jwtUtil.getStoreIdFromRequest(request);
        log.info("매장 주문 목록 조회: storeId={}, status={}", storeId, status);
        
        try {
            List<OrderResponse> orders;
            
            if (status != null && !status.isEmpty()) {
                Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
                orders = orderService.getOrdersByStatus(storeId, orderStatus);
            } else {
                orders = orderService.getOrdersByStore(storeId);
            }
            
            return ResponseEntity.ok(ApiResponse.success("주문 목록을 조회했습니다.", orders));
            
        } catch (IllegalArgumentException e) {
            log.error("잘못된 주문 상태: status={}", status);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("잘못된 주문 상태입니다."));
        } catch (Exception e) {
            log.error("주문 목록 조회 실패: storeId={}, error={}", storeId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 주문 상세 조회 (관리자용)
     */
    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(
            @PathVariable Long orderId,
            HttpServletRequest request) {
        
        Long storeId = jwtUtil.getStoreIdFromRequest(request);
        log.info("주문 상세 조회: orderId={}, storeId={}", orderId, storeId);
        
        try {
            OrderResponse orderResponse = orderService.getOrder(orderId);
            
            // 매장 소유권 확인
            if (!orderResponse.getStoreId().equals(storeId)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("해당 매장의 주문이 아닙니다."));
            }
            
            return ResponseEntity.ok(ApiResponse.success("주문 상세 정보를 조회했습니다.", orderResponse));
            
        } catch (Exception e) {
            log.error("주문 상세 조회 실패: orderId={}, error={}", orderId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 주문 상태 변경 (관리자용)
     */
    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status,
            HttpServletRequest request) {
        
        Long storeId = jwtUtil.getStoreIdFromRequest(request);
        log.info("주문 상태 변경: orderId={}, newStatus={}, storeId={}", orderId, status, storeId);
        
        try {
            Order.OrderStatus newStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            OrderResponse orderResponse = orderService.updateOrderStatus(orderId, storeId, newStatus);
            
            return ResponseEntity.ok(ApiResponse.success("주문 상태가 변경되었습니다.", orderResponse));
            
        } catch (IllegalArgumentException e) {
            log.error("잘못된 주문 상태: status={}", status);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("잘못된 주문 상태입니다."));
        } catch (Exception e) {
            log.error("주문 상태 변경 실패: orderId={}, error={}", orderId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 주문 취소 (관리자용)
     */
    @DeleteMapping("/{orderId}")
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Long orderId,
            HttpServletRequest request) {
        
        Long storeId = jwtUtil.getStoreIdFromRequest(request);
        log.info("관리자 주문 취소: orderId={}, storeId={}", orderId, storeId);
        
        try {
            // 매장 소유권 확인을 위해 먼저 주문 조회
            OrderResponse orderResponse = orderService.getOrder(orderId);
            if (!orderResponse.getStoreId().equals(storeId)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("해당 매장의 주문이 아닙니다."));
            }
            
            OrderResponse cancelledOrder = orderService.cancelOrder(orderId);
            
            return ResponseEntity.ok(ApiResponse.success("주문이 취소되었습니다.", cancelledOrder));
            
        } catch (Exception e) {
            log.error("관리자 주문 취소 실패: orderId={}, error={}", orderId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 오늘 주문 통계
     */
    @GetMapping("/stats/today")
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<OrderStatsResponse>> getTodayStats(HttpServletRequest request) {
        Long storeId = jwtUtil.getStoreIdFromRequest(request);
        log.info("오늘 주문 통계 조회: storeId={}", storeId);
        
        try {
            long todayOrderCount = orderService.getTodayOrderCount(storeId);
            long pendingOrderCount = orderService.getPendingOrderCount(storeId);
            
            OrderStatsResponse stats = OrderStatsResponse.builder()
                    .todayOrderCount(todayOrderCount)
                    .pendingOrderCount(pendingOrderCount)
                    .build();
            
            return ResponseEntity.ok(ApiResponse.success("오늘 주문 통계를 조회했습니다.", stats));
            
        } catch (Exception e) {
            log.error("오늘 주문 통계 조회 실패: storeId={}, error={}", storeId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 주문 상태별 개수 조회
     */
    @GetMapping("/stats/status")
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<OrderStatusStatsResponse>> getStatusStats(HttpServletRequest request) {
        Long storeId = jwtUtil.getStoreIdFromRequest(request);
        log.info("주문 상태별 통계 조회: storeId={}", storeId);
        
        try {
            OrderStatusStatsResponse stats = OrderStatusStatsResponse.builder()
                    .pendingCount(orderService.getPendingOrderCount(storeId))
                    .preparingCount(orderService.getOrdersByStatus(storeId, Order.OrderStatus.PREPARING).size())
                    .completedCount(orderService.getOrdersByStatus(storeId, Order.OrderStatus.COMPLETED).size())
                    .pickedUpCount(orderService.getOrdersByStatus(storeId, Order.OrderStatus.PICKED_UP).size())
                    .cancelledCount(orderService.getOrdersByStatus(storeId, Order.OrderStatus.CANCELLED).size())
                    .build();
            
            return ResponseEntity.ok(ApiResponse.success("주문 상태별 통계를 조회했습니다.", stats));
            
        } catch (Exception e) {
            log.error("주문 상태별 통계 조회 실패: storeId={}, error={}", storeId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
} 