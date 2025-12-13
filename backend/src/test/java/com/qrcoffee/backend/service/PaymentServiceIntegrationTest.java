package com.qrcoffee.backend.service;

import com.qrcoffee.backend.dto.CartPaymentRequest;
import com.qrcoffee.backend.dto.OrderItemRequest;
import com.qrcoffee.backend.dto.PaymentConfirmRequest;
import com.qrcoffee.backend.dto.PaymentResponse;
import com.qrcoffee.backend.entity.Payment;
import com.qrcoffee.backend.repository.PaymentRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Disabled("DB 연결 필요 - 실제 환경에서만 실행")
@DisplayName("PaymentService 통합 테스트")
class PaymentServiceIntegrationTest {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PaymentRepository paymentRepository;

    @Test
    @DisplayName("결제 준비 및 조회 통합 테스트")
    void prepareAndRetrievePayment_Integration() {
        // given
        List<OrderItemRequest> orderItems = Arrays.asList(
                OrderItemRequest.builder()
                        .menuId(1L)
                        .quantity(2)
                        .build()
        );

        CartPaymentRequest request = CartPaymentRequest.builder()
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

        // when - 결제 준비
        PaymentResponse prepareResponse = paymentService.prepareCartPayment(request, null);

        // then - 결제 준비 확인
        assertThat(prepareResponse).isNotNull();
        assertThat(prepareResponse.getOrderIdToss()).isNotNull();
        assertThat(prepareResponse.getTotalAmount()).isEqualByComparingTo(new BigDecimal("10000"));

        // when - orderId로 조회
        PaymentResponse retrieveResponse = paymentService.getPaymentByOrderId(prepareResponse.getOrderIdToss());

        // then - 조회 결과 확인
        assertThat(retrieveResponse).isNotNull();
        assertThat(retrieveResponse.getOrderIdToss()).isEqualTo(prepareResponse.getOrderIdToss());
        assertThat(retrieveResponse.getTotalAmount()).isEqualByComparingTo(new BigDecimal("10000"));

        // DB에서 직접 확인
        Optional<Payment> savedPayment = paymentRepository.findByOrderIdToss(prepareResponse.getOrderIdToss());
        assertThat(savedPayment).isPresent();
        assertThat(savedPayment.get().getTotalAmount()).isEqualByComparingTo(new BigDecimal("10000"));
        assertThat(savedPayment.get().getStatus()).isEqualTo("READY");
    }
}

