package com.qrcoffee.backend.controller;

import com.qrcoffee.backend.common.ApiResponse;
import com.qrcoffee.backend.common.BaseController;
import com.qrcoffee.backend.dto.OrderRequest;
import com.qrcoffee.backend.dto.OrderResponse;
import com.qrcoffee.backend.entity.Order;
import com.qrcoffee.backend.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController extends BaseController {
    
    private final OrderService orderService;
    
    /**
     * 주문 생성 (고객용)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody OrderRequest request) {
        log.info("주문 생성 요청: storeId={}, seatId={}", request.getStoreId(), request.getSeatId());
        
        OrderResponse orderResponse = orderService.createOrder(request);
        
        return success("주문이 생성되었습니다.", orderResponse);
    }
    
    /**
     * 주문 조회 (고객용)
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable Long orderId) {
        log.info("주문 조회 요청: orderId={}", orderId);
        
        OrderResponse orderResponse = orderService.getOrder(orderId);
        
        return success("주문 정보를 조회했습니다.", orderResponse);
    }
    
    /**
     * 주문 번호로 조회 (고객용)
     */
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderByNumber(@PathVariable String orderNumber) {
        log.info("주문 번호로 조회 요청: orderNumber={}", orderNumber);
        
        OrderResponse orderResponse = orderService.getOrderByNumber(orderNumber);
        
        return success("주문 정보를 조회했습니다.", orderResponse);
    }
    
    /**
     * 주문 취소 (고객용)
     */
    @DeleteMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable Long orderId) {
        log.info("주문 취소 요청: orderId={}", orderId);
        
        OrderResponse orderResponse = orderService.cancelOrder(orderId);
        
        return success("주문이 취소되었습니다.", orderResponse);
    }
    
    /**
     * 매장별 주문 목록 조회 (관리자용)
     */
    @GetMapping("/store")
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersByStore(HttpServletRequest request) {
        Long storeId = getStoreId(request);
        
        log.info("매장별 주문 목록 조회: storeId={}", storeId);
        
        List<OrderResponse> orders = orderService.getOrdersByStore(storeId);
        
        return success("주문 목록을 조회했습니다.", orders);
    }
    
    /**
     * 매장별 특정 상태 주문 조회 (관리자용)
     */
    @GetMapping("/store/status/{status}")
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersByStatus(
            @PathVariable String status,
            HttpServletRequest request) {
        Long storeId = getStoreId(request);
        
        log.info("매장별 상태별 주문 조회: storeId={}, status={}", storeId, status);
        
        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            List<OrderResponse> orders = orderService.getOrdersByStatus(storeId, orderStatus);
            
            return success("주문 목록을 조회했습니다.", orders);
        } catch (IllegalArgumentException e) {
            return error("유효하지 않은 주문 상태입니다.");
        }
    }
    
    /**
     * 주문 상태 변경 (관리자용)
     */
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status,
            HttpServletRequest request) {
        Long storeId = getStoreId(request);
        
        log.info("주문 상태 변경 요청: orderId={}, storeId={}, status={}", orderId, storeId, status);
        
        try {
            Order.OrderStatus newStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            OrderResponse orderResponse = orderService.updateOrderStatus(orderId, storeId, newStatus);
            
            return success("주문 상태가 변경되었습니다.", orderResponse);
        } catch (IllegalArgumentException e) {
            return error("유효하지 않은 주문 상태입니다.");
        }
    }
    
    /**
     * 매장별 오늘 주문 통계 (관리자용)
     */
    @GetMapping("/store/stats/today")
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<Long>> getTodayOrderCount(HttpServletRequest request) {
        Long storeId = getStoreId(request);
        
        log.info("오늘 주문 통계 조회: storeId={}", storeId);
        
        long count = orderService.getTodayOrderCount(storeId);
        
        return success("오늘 주문 통계를 조회했습니다.", count);
    }
    
    /**
     * 매장별 대기 중인 주문 개수 (관리자용)
     */
    @GetMapping("/store/stats/pending")
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<Long>> getPendingOrderCount(HttpServletRequest request) {
        Long storeId = getStoreId(request);
        
        log.info("대기 중인 주문 개수 조회: storeId={}", storeId);
        
        long count = orderService.getPendingOrderCount(storeId);
        
        return success("대기 중인 주문 개수를 조회했습니다.", count);
    }
}

