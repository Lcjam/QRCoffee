package com.qrcoffee.backend.controller;

import com.qrcoffee.backend.common.ApiResponse;
import com.qrcoffee.backend.dto.CartPaymentRequest;
import com.qrcoffee.backend.dto.PaymentConfirmRequest;
import com.qrcoffee.backend.dto.PaymentResponse;
import com.qrcoffee.backend.service.PaymentService;
import com.qrcoffee.backend.config.TossPaymentsConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;
import com.qrcoffee.backend.entity.User;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final TossPaymentsConfig tossPaymentsConfig;
    
    /**
     * 토스페이먼츠 클라이언트 키 조회 (프론트엔드에서 사용)
     */
    @GetMapping("/config")
    public ResponseEntity<ApiResponse<Map<String, String>>> getPaymentConfig() {
        log.info("결제 설정 정보 조회 요청");
        
        Map<String, String> config = Map.of(
            "clientKey", tossPaymentsConfig.getClientKey(),
            "currency", "KRW"
        );
        
        return ResponseEntity.ok(ApiResponse.success(config));
    }
    
    /**
     * 장바구니에서 직접 결제 준비
     */
    @PostMapping("/prepare-cart")
    public ResponseEntity<ApiResponse<PaymentResponse>> prepareCartPayment(
            @Valid @RequestBody CartPaymentRequest request) {
        
        log.info("장바구니 결제 준비 요청: orderName={}, amount={}", 
                request.getOrderName(), request.getTotalAmount());
        
        try {
            // 임시 사용자 생성 (실제로는 인증된 사용자 정보 사용)
            User testUser = User.builder()
                    .id(1L)
                    .name("테스트 사용자")
                    .email("test@example.com")
                    .build();
            
            PaymentResponse response = paymentService.prepareCartPayment(request, testUser);
            
            log.info("장바구니 결제 준비 완료: orderId={}", response.getOrderId());
            return ResponseEntity.ok(ApiResponse.success(response));
            
        } catch (Exception e) {
            log.error("장바구니 결제 준비 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("결제 준비에 실패했습니다: " + e.getMessage()));
        }
    }
    
    /**
     * 결제 승인 (토스페이먼츠 쿼리 파라미터 방식)
     */
    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<PaymentResponse>> confirmPayment(
            @RequestParam("paymentKey") String paymentKey,
            @RequestParam("orderId") String orderId,
            @RequestParam("amount") String amount) {
        
        log.info("결제 승인 요청: paymentKey={}, orderId={}, amount={}", 
                paymentKey, orderId, amount);
        
        try {
            // 쿼리 파라미터를 DTO로 변환
            PaymentConfirmRequest request = PaymentConfirmRequest.builder()
                    .paymentKey(paymentKey)
                    .orderId(orderId)
                    .amount(new java.math.BigDecimal(amount))
                    .build();
            
            PaymentResponse response = paymentService.confirmPayment(request);
            
            log.info("결제 승인 완료: paymentKey={}, status={}", 
                    response.getPaymentKey(), response.getStatus());
            return ResponseEntity.ok(ApiResponse.success(response));
            
        } catch (Exception e) {
            log.error("결제 승인 실패: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("결제 승인에 실패했습니다: " + e.getMessage()));
        }
    }
    
    /**
     * 결제 조회 (paymentKey로)
     */
    @GetMapping("/{paymentKey}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByKey(
            @PathVariable String paymentKey) {
        
        log.info("결제 조회 요청: paymentKey={}", paymentKey);
        
        try {
            PaymentResponse response = paymentService.getPaymentByKey(paymentKey);
            return ResponseEntity.ok(ApiResponse.success(response));
            
        } catch (Exception e) {
            log.error("결제 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * 결제 조회 (orderId로)
     */
    @GetMapping("/orders/{orderId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByOrderId(
            @PathVariable String orderId) {
        
        log.info("주문 결제 조회 요청: orderId={}", orderId);
        
        try {
            PaymentResponse response = paymentService.getPaymentByOrderId(orderId);
            return ResponseEntity.ok(ApiResponse.success(response));
            
        } catch (Exception e) {
            log.error("주문 결제 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }
} 