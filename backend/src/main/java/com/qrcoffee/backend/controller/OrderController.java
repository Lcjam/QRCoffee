package com.qrcoffee.backend.controller;

import com.qrcoffee.backend.common.ApiResponse;
import com.qrcoffee.backend.dto.MenuResponse;
import com.qrcoffee.backend.dto.OrderRequest;
import com.qrcoffee.backend.dto.OrderResponse;
import com.qrcoffee.backend.service.MenuService;
import com.qrcoffee.backend.service.OrderService;
import com.qrcoffee.backend.service.SeatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class OrderController {
    
    private final OrderService orderService;
    private final MenuService menuService;
    private final SeatService seatService;
    
    /**
     * QR코드를 통한 매장 정보 및 메뉴 조회
     */
    @GetMapping("/qr/{qrCode}")
    public ResponseEntity<ApiResponse<List<MenuResponse>>> getMenusByQrCode(@PathVariable String qrCode) {
        log.info("QR코드로 메뉴 조회: qrCode={}", qrCode);
        
        try {
            // QR코드로 좌석 정보 조회
            var seatResponse = seatService.getActiveSeatByQRCode(qrCode);
            
            // 매장 메뉴 조회 (고객용 - 활성 메뉴만)
            List<MenuResponse> menus = menuService.getMenusForCustomer(seatResponse.getStoreId());
            
            return ResponseEntity.ok(ApiResponse.success("메뉴 조회가 완료되었습니다.", menus));
            
        } catch (Exception e) {
            log.error("QR코드로 메뉴 조회 실패: qrCode={}, error={}", qrCode, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("유효하지 않은 QR코드입니다."));
        }
    }
    
    /**
     * 주문 생성
     */
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody OrderRequest request) {
        log.info("주문 생성 요청: storeId={}, seatId={}, items={}", 
                request.getStoreId(), request.getSeatId(), request.getOrderItems().size());
        
        try {
            OrderResponse orderResponse = orderService.createOrder(request);
            
            return ResponseEntity.ok(ApiResponse.success("주문이 생성되었습니다.", orderResponse));
            
        } catch (Exception e) {
            log.error("주문 생성 실패: error={}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 주문 조회
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable Long orderId) {
        log.info("주문 조회: orderId={}", orderId);
        
        try {
            OrderResponse orderResponse = orderService.getOrder(orderId);
            
            return ResponseEntity.ok(ApiResponse.success("주문 조회가 완료되었습니다.", orderResponse));
            
        } catch (Exception e) {
            log.error("주문 조회 실패: orderId={}, error={}", orderId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 주문 번호로 조회
     */
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderByNumber(@PathVariable String orderNumber) {
        log.info("주문 번호로 조회: orderNumber={}", orderNumber);
        
        try {
            OrderResponse orderResponse = orderService.getOrderByNumber(orderNumber);
            
            return ResponseEntity.ok(ApiResponse.success("주문 조회가 완료되었습니다.", orderResponse));
            
        } catch (Exception e) {
            log.error("주문 번호로 조회 실패: orderNumber={}, error={}", orderNumber, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 주문 취소 (고객용)
     */
    @DeleteMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable Long orderId) {
        log.info("주문 취소 요청: orderId={}", orderId);
        
        try {
            OrderResponse orderResponse = orderService.cancelOrder(orderId);
            
            return ResponseEntity.ok(ApiResponse.success("주문이 취소되었습니다.", orderResponse));
            
        } catch (Exception e) {
            log.error("주문 취소 실패: orderId={}, error={}", orderId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
} 