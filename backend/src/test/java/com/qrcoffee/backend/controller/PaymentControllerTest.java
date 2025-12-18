package com.qrcoffee.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qrcoffee.backend.common.ApiResponse;
import com.qrcoffee.backend.dto.CartPaymentRequest;
import com.qrcoffee.backend.dto.OrderItemRequest;
import com.qrcoffee.backend.dto.PaymentConfirmRequest;
import com.qrcoffee.backend.dto.PaymentResponse;
import com.qrcoffee.backend.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import com.qrcoffee.backend.config.TestSecurityConfig;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = PaymentController.class)
@Import(TestSecurityConfig.class)
@DisplayName("PaymentController 테스트")
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PaymentService paymentService;
    
    @MockBean
    private com.qrcoffee.backend.config.TossPaymentsConfig tossPaymentsConfig;
    
    @MockBean
    private org.springframework.web.client.RestTemplate restTemplate;
    
    @MockBean
    private com.qrcoffee.backend.util.JwtUtil jwtUtil;
    
    @MockBean
    private com.qrcoffee.backend.config.JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private ObjectMapper objectMapper;

    private CartPaymentRequest cartPaymentRequest;
    private PaymentConfirmRequest paymentConfirmRequest;
    private PaymentResponse paymentResponse;

    @BeforeEach
    void setUp() {
        // CartPaymentRequest 생성
        List<OrderItemRequest> orderItems = Arrays.asList(
                OrderItemRequest.builder()
                        .menuId(1L)
                        .quantity(2)
                        .build()
        );

        cartPaymentRequest = CartPaymentRequest.builder()
                .totalAmount(new BigDecimal("10000"))
                .orderName("아메리카노 외 1건")
                .customerName("홍길동")
                .customerPhone("010-1234-5678")
                .storeId(1L)
                .seatId(1L)
                .orderItems(orderItems)
                .successUrl("http://localhost:3000/payment/success")
                .failUrl("http://localhost:3000/payment/fail")
                .build();

        // PaymentConfirmRequest 생성
        paymentConfirmRequest = PaymentConfirmRequest.builder()
                .paymentKey("payment_key_123")
                .orderId("order_1234567890_0")
                .amount(new BigDecimal("10000"))
                .build();

        // PaymentResponse 생성
        paymentResponse = PaymentResponse.builder()
                .id(1L)
                .paymentKey("payment_key_123")
                .orderIdToss("order_1234567890_0")
                .orderName("아메리카노 외 1건")
                .totalAmount(new BigDecimal("10000"))
                .status("READY")
                .customerName("홍길동")
                .successUrl("http://localhost:3000/payment/success")
                .failUrl("http://localhost:3000/payment/fail")
                .build();
    }

    @Test
    @DisplayName("결제 준비 API - 성공")
    void preparePayment_Success() throws Exception {
        // given
        when(paymentService.prepareCartPayment(any(CartPaymentRequest.class), any()))
                .thenReturn(paymentResponse);

        // when & then
        mockMvc.perform(post("/api/payments/prepare")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cartPaymentRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("결제 준비가 완료되었습니다."))
                .andExpect(jsonPath("$.data.orderIdToss").value("order_1234567890_0"))
                .andExpect(jsonPath("$.data.totalAmount").value(10000))
                .andExpect(jsonPath("$.data.orderName").value("아메리카노 외 1건"));
    }

    @Test
    @DisplayName("결제 준비 API - 유효하지 않은 요청 (totalAmount 누락)")
    void preparePayment_InvalidRequest_MissingTotalAmount() throws Exception {
        // given
        cartPaymentRequest.setTotalAmount(null);

        // when & then
        mockMvc.perform(post("/api/payments/prepare")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cartPaymentRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("결제 승인 API - 성공")
    void confirmPayment_Success() throws Exception {
        // given
        PaymentResponse confirmedResponse = PaymentResponse.builder()
                .id(1L)
                .paymentKey("payment_key_123")
                .orderIdToss("order_1234567890_0")
                .orderName("아메리카노 외 1건")
                .totalAmount(new BigDecimal("10000"))
                .status("DONE")
                .method("카드")
                .build();

        when(paymentService.confirmPayment(any(PaymentConfirmRequest.class)))
                .thenReturn(confirmedResponse);

        // when & then
        mockMvc.perform(post("/api/payments/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentConfirmRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("결제가 완료되었습니다."))
                .andExpect(jsonPath("$.data.status").value("DONE"))
                .andExpect(jsonPath("$.data.method").value("카드"));
    }

    @Test
    @DisplayName("결제 승인 API - 유효하지 않은 요청 (paymentKey 누락)")
    void confirmPayment_InvalidRequest_MissingPaymentKey() throws Exception {
        // given
        paymentConfirmRequest.setPaymentKey(null);

        // when & then
        mockMvc.perform(post("/api/payments/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentConfirmRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("결제 조회 API - paymentKey로 조회 성공")
    void getPayment_ByPaymentKey_Success() throws Exception {
        // given
        String paymentKey = "payment_key_123";
        when(paymentService.getPaymentByKey(paymentKey))
                .thenReturn(paymentResponse);

        // when & then
        mockMvc.perform(get("/api/payments/{paymentKey}", paymentKey)
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("결제 정보를 조회했습니다."))
                .andExpect(jsonPath("$.data.paymentKey").value(paymentKey));
    }

    @Test
    @DisplayName("결제 조회 API - orderId로 조회 성공")
    void getPayment_ByOrderId_Success() throws Exception {
        // given
        String orderId = "order_1234567890_0";
        when(paymentService.getPaymentByOrderId(orderId))
                .thenReturn(paymentResponse);

        // when & then
        mockMvc.perform(get("/api/payments/order/{orderId}", orderId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("결제 정보를 조회했습니다."))
                .andExpect(jsonPath("$.data.orderIdToss").value(orderId));
    }
}

