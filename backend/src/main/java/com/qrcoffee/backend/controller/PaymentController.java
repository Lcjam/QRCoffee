package com.qrcoffee.backend.controller;

import com.qrcoffee.backend.common.ApiResponse;
import com.qrcoffee.backend.dto.CartPaymentRequest;
import com.qrcoffee.backend.dto.PaymentConfirmRequest;
import com.qrcoffee.backend.dto.PaymentResponse;
import com.qrcoffee.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
    
    private final PaymentService paymentService;
    
    /**
     * 결제 준비 (장바구니에서 결제 준비)
     */
    @PostMapping("/prepare")
    public ResponseEntity<ApiResponse<PaymentResponse>> preparePayment(
            @Valid @RequestBody CartPaymentRequest request) {
        log.info("결제 준비 요청: orderName={}, totalAmount={}", request.getOrderName(), request.getTotalAmount());
        
        // 비회원 결제 지원: 사용자 정보는 선택적
        // 고객용 결제이므로 사용자 인증 불필요
        PaymentResponse paymentResponse = paymentService.prepareCartPayment(request, null);
        
        return ResponseEntity.ok(ApiResponse.success("결제 준비가 완료되었습니다.", paymentResponse));
    }
    
    /**
     * 결제 승인 (토스페이먼츠 결제 승인 API 호출)
     */
    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<PaymentResponse>> confirmPayment(
            @Valid @RequestBody PaymentConfirmRequest request) {
        log.info("결제 승인 요청: paymentKey={}, orderId={}, amount={}", 
                request.getPaymentKey(), request.getOrderId(), request.getAmount());
        
        PaymentResponse paymentResponse = paymentService.confirmPayment(request);
        
        return ResponseEntity.ok(ApiResponse.success("결제가 완료되었습니다.", paymentResponse));
    }
    
    /**
     * 결제 조회 (paymentKey로)
     */
    @GetMapping("/{paymentKey}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPayment(@PathVariable String paymentKey) {
        log.info("결제 조회 요청: paymentKey={}", paymentKey);
        
        PaymentResponse paymentResponse = paymentService.getPaymentByKey(paymentKey);
        
        return ResponseEntity.ok(ApiResponse.success("결제 정보를 조회했습니다.", paymentResponse));
    }
    
    /**
     * 결제 조회 (orderId로)
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByOrderId(@PathVariable String orderId) {
        log.info("결제 조회 요청: orderId={}", orderId);
        
        PaymentResponse paymentResponse = paymentService.getPaymentByOrderId(orderId);
        
        return ResponseEntity.ok(ApiResponse.success("결제 정보를 조회했습니다.", paymentResponse));
    }
}

