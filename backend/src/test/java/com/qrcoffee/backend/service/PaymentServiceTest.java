package com.qrcoffee.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qrcoffee.backend.config.TossPaymentsConfig;
import com.qrcoffee.backend.dto.CartPaymentRequest;
import com.qrcoffee.backend.dto.OrderItemRequest;
import com.qrcoffee.backend.dto.PaymentConfirmRequest;
import com.qrcoffee.backend.dto.OrderResponse;
import com.qrcoffee.backend.dto.PaymentResponse;
import com.qrcoffee.backend.entity.Order;
import com.qrcoffee.backend.entity.Payment;
import com.qrcoffee.backend.entity.User;
import com.qrcoffee.backend.exception.BusinessException;
import com.qrcoffee.backend.repository.OrderRepository;
import com.qrcoffee.backend.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("PaymentService 테스트")
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private OrderService orderService;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private TossPaymentsConfig tossPaymentsConfig;

    @Mock
    private RestTemplate restTemplate;

    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private PaymentService paymentService;

    private CartPaymentRequest cartPaymentRequest;
    private Payment payment;
    private User user;

    @BeforeEach
    void setUp() {
        // PaymentService의 objectMapper 필드에 실제 인스턴스 주입
        org.springframework.test.util.ReflectionTestUtils.setField(paymentService, "objectMapper", objectMapper);
        
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

        // Payment 엔티티 생성
        payment = Payment.builder()
                .id(1L)
                .orderIdToss("order_1234567890_0")
                .orderName("아메리카노 외 1건")
                .totalAmount(new BigDecimal("10000"))
                .status("READY")
                .build();

        // User 생성
        user = User.builder()
                .id(1L)
                .email("test@example.com")
                .build();

        // TossPaymentsConfig Mock 설정
        when(tossPaymentsConfig.getSecretKey()).thenReturn("test_secret_key");
        when(tossPaymentsConfig.getClientKey()).thenReturn("test_client_key");
    }

    @Test
    @DisplayName("결제 준비 - 성공")
    void prepareCartPayment_Success() {
        // given
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            p.setId(1L);
            return p;
        });

        // when
        PaymentResponse response = paymentService.prepareCartPayment(cartPaymentRequest, user);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getOrderIdToss()).isNotNull();
        assertThat(response.getTotalAmount()).isEqualByComparingTo(new BigDecimal("10000"));
        assertThat(response.getOrderName()).isEqualTo("아메리카노 외 1건");
        assertThat(response.getCustomerName()).isEqualTo("홍길동");
        assertThat(response.getSuccessUrl()).isEqualTo("http://localhost:3000/payment/success");
        assertThat(response.getFailUrl()).isEqualTo("http://localhost:3000/payment/fail");

        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    @DisplayName("결제 준비 - 비회원 결제 (user가 null)")
    void prepareCartPayment_AnonymousUser_Success() {
        // given
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            p.setId(1L);
            return p;
        });

        // when
        PaymentResponse response = paymentService.prepareCartPayment(cartPaymentRequest, null);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getOrderIdToss()).isNotNull();
        assertThat(response.getTotalAmount()).isEqualByComparingTo(new BigDecimal("10000"));
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    @DisplayName("결제 승인 - 성공")
    void confirmPayment_Success() throws Exception {
        // given
        PaymentConfirmRequest confirmRequest = PaymentConfirmRequest.builder()
                .paymentKey("payment_key_123")
                .orderId("order_1234567890_0")
                .amount(new BigDecimal("10000"))
                .build();

        Payment savedPayment = Payment.builder()
                .id(1L)
                .orderIdToss("order_1234567890_0")
                .orderName("아메리카노 외 1건")
                .totalAmount(new BigDecimal("10000"))
                .status("READY")
                .build();

        // 메타데이터 설정 (주문 생성에 필요한 정보)
        Map<String, Object> metadata = new java.util.HashMap<>();
        List<Map<String, Object>> cartItems = new java.util.ArrayList<>();
        Map<String, Object> cartItem = new java.util.HashMap<>();
        cartItem.put("menuId", 1L);
        cartItem.put("quantity", 2);
        cartItem.put("options", Arrays.asList());
        cartItems.add(cartItem);
        metadata.put("cartItems", cartItems);
        metadata.put("storeId", 1L);
        metadata.put("seatId", 1L);
        metadata.put("customerName", "홍길동");
        metadata.put("customerPhone", "010-1234-5678");
        savedPayment.setMetadata(metadata);

        when(paymentRepository.findByOrderIdToss("order_1234567890_0"))
                .thenReturn(Optional.of(savedPayment));

        // 토스페이먼츠 API 응답 Mock
        String tossResponseBody = "{\"paymentKey\":\"payment_key_123\",\"orderId\":\"order_1234567890_0\"," +
                "\"orderName\":\"아메리카노 외 1건\",\"status\":\"DONE\",\"method\":\"카드\"," +
                "\"totalAmount\":10000,\"balanceAmount\":10000,\"suppliedAmount\":9091,\"vat\":909}";

        ResponseEntity<String> responseEntity = new ResponseEntity<>(tossResponseBody, HttpStatus.OK);
        when(restTemplate.exchange(anyString(), any(), any(), eq(String.class)))
                .thenReturn(responseEntity);

        // OrderService Mock 설정
        OrderResponse orderResponse = OrderResponse.builder()
                .id(1L)
                .storeId(1L)
                .seatId(1L)
                .orderNumber("20241212-001-0001")
                .totalAmount(new BigDecimal("10000"))
                .build();

        when(orderService.createOrder(any(com.qrcoffee.backend.dto.OrderRequest.class)))
                .thenReturn(orderResponse);

        // OrderRepository Mock 설정
        com.qrcoffee.backend.entity.Order orderEntity = com.qrcoffee.backend.entity.Order.builder()
                .id(1L)
                .storeId(1L)
                .seatId(1L)
                .orderNumber("20241212-001-0001")
                .totalAmount(new BigDecimal("10000"))
                .build();

        when(orderRepository.findById(1L))
                .thenReturn(Optional.of(orderEntity));

        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment payment = invocation.getArgument(0);
            payment.setId(1L);
            return payment;
        });

        // when
        PaymentResponse response = paymentService.confirmPayment(confirmRequest);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getPaymentKey()).isEqualTo("payment_key_123");
        assertThat(response.getOrderIdToss()).isEqualTo("order_1234567890_0");
        assertThat(response.getStatus()).isEqualTo("DONE");
        assertThat(response.getMethod()).isEqualTo("카드");

        verify(paymentRepository, atLeastOnce()).findByOrderIdToss("order_1234567890_0");
        verify(restTemplate, atLeastOnce()).exchange(anyString(), any(), any(), eq(String.class));
        verify(orderService, times(1)).createOrder(any(com.qrcoffee.backend.dto.OrderRequest.class));
    }

    @Test
    @DisplayName("결제 승인 - 결제 정보를 찾을 수 없음")
    void confirmPayment_PaymentNotFound_ThrowsException() {
        // given
        PaymentConfirmRequest confirmRequest = PaymentConfirmRequest.builder()
                .paymentKey("payment_key_123")
                .orderId("order_not_found")
                .amount(new BigDecimal("10000"))
                .build();

        when(paymentRepository.findByOrderIdToss("order_not_found"))
                .thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> paymentService.confirmPayment(confirmRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("결제 정보를 찾을 수 없습니다");

        verify(paymentRepository, times(1)).findByOrderIdToss("order_not_found");
        verify(restTemplate, never()).exchange(anyString(), any(), any(), eq(String.class));
    }

    @Test
    @DisplayName("결제 승인 - 결제 금액 불일치")
    void confirmPayment_AmountMismatch_ThrowsException() {
        // given
        PaymentConfirmRequest confirmRequest = PaymentConfirmRequest.builder()
                .paymentKey("payment_key_123")
                .orderId("order_1234567890_0")
                .amount(new BigDecimal("20000")) // 다른 금액
                .build();

        Payment savedPayment = Payment.builder()
                .id(1L)
                .orderIdToss("order_1234567890_0")
                .totalAmount(new BigDecimal("10000"))
                .status("READY")
                .build();

        when(paymentRepository.findByOrderIdToss("order_1234567890_0"))
                .thenReturn(Optional.of(savedPayment));

        // when & then
        assertThatThrownBy(() -> paymentService.confirmPayment(confirmRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("결제 금액이 일치하지 않습니다");

        verify(paymentRepository, times(1)).findByOrderIdToss("order_1234567890_0");
        verify(restTemplate, never()).exchange(anyString(), any(), any(), eq(String.class));
    }

    @Test
    @DisplayName("결제 승인 - 토스페이먼츠 API 호출 실패")
    void confirmPayment_TossApiFailure_ThrowsException() {
        // given
        PaymentConfirmRequest confirmRequest = PaymentConfirmRequest.builder()
                .paymentKey("payment_key_123")
                .orderId("order_1234567890_0")
                .amount(new BigDecimal("10000"))
                .build();

        Payment savedPayment = Payment.builder()
                .id(1L)
                .orderIdToss("order_1234567890_0")
                .totalAmount(new BigDecimal("10000"))
                .status("READY")
                .build();

        when(paymentRepository.findByOrderIdToss("order_1234567890_0"))
                .thenReturn(Optional.of(savedPayment));

        // 토스페이먼츠 API 호출 실패 시뮬레이션
        when(restTemplate.exchange(anyString(), any(), any(), eq(String.class)))
                .thenThrow(new org.springframework.web.client.HttpClientErrorException(
                        HttpStatus.BAD_REQUEST, "API 호출 실패"));

        // when & then
        assertThatThrownBy(() -> paymentService.confirmPayment(confirmRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("결제 승인에 실패했습니다");

        verify(paymentRepository, times(1)).findByOrderIdToss("order_1234567890_0");
        verify(restTemplate, atLeastOnce()).exchange(anyString(), any(), any(), eq(String.class));
    }

    @Test
    @DisplayName("결제 승인 - 주문 생성 실패")
    void confirmPayment_OrderCreationFailure_ThrowsException() throws Exception {
        // given
        PaymentConfirmRequest confirmRequest = PaymentConfirmRequest.builder()
                .paymentKey("payment_key_123")
                .orderId("order_1234567890_0")
                .amount(new BigDecimal("10000"))
                .build();

        Payment savedPayment = Payment.builder()
                .id(1L)
                .orderIdToss("order_1234567890_0")
                .orderName("아메리카노 외 1건")
                .totalAmount(new BigDecimal("10000"))
                .status("READY")
                .build();

        Map<String, Object> metadata = new java.util.HashMap<>();
        List<Map<String, Object>> cartItems = new java.util.ArrayList<>();
        Map<String, Object> cartItem = new java.util.HashMap<>();
        cartItem.put("menuId", 1L);
        cartItem.put("quantity", 2);
        cartItem.put("options", Arrays.asList());
        cartItems.add(cartItem);
        metadata.put("cartItems", cartItems);
        metadata.put("storeId", 1L);
        metadata.put("seatId", 1L);
        metadata.put("customerName", "홍길동");
        metadata.put("customerPhone", "010-1234-5678");
        savedPayment.setMetadata(metadata);

        when(paymentRepository.findByOrderIdToss("order_1234567890_0"))
                .thenReturn(Optional.of(savedPayment));

        // 토스페이먼츠 API 응답 Mock
        String tossResponseBody = "{\"paymentKey\":\"payment_key_123\",\"orderId\":\"order_1234567890_0\"," +
                "\"orderName\":\"아메리카노 외 1건\",\"status\":\"DONE\",\"method\":\"카드\"," +
                "\"totalAmount\":10000,\"balanceAmount\":10000,\"suppliedAmount\":9091,\"vat\":909}";

        ResponseEntity<String> responseEntity = new ResponseEntity<>(tossResponseBody, HttpStatus.OK);
        when(restTemplate.exchange(anyString(), any(), any(), eq(String.class)))
                .thenReturn(responseEntity);

        // OrderService.createOrder 실패 시뮬레이션
        when(orderService.createOrder(any(com.qrcoffee.backend.dto.OrderRequest.class)))
                .thenThrow(new BusinessException("주문 생성에 실패했습니다."));

        // when & then
        assertThatThrownBy(() -> paymentService.confirmPayment(confirmRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("결제 승인에 실패했습니다");

        verify(orderService, times(1)).createOrder(any(com.qrcoffee.backend.dto.OrderRequest.class));
    }

    @Test
    @DisplayName("결제 조회 - paymentKey로 조회 성공")
    void getPaymentByKey_Success() {
        // given
        String paymentKey = "payment_key_123";
        Payment savedPayment = Payment.builder()
                .id(1L)
                .paymentKey(paymentKey)
                .orderIdToss("order_1234567890_0")
                .orderName("아메리카노 외 1건")
                .totalAmount(new BigDecimal("10000"))
                .status("DONE")
                .method("카드")
                .build();

        when(paymentRepository.findByPaymentKey(paymentKey))
                .thenReturn(Optional.of(savedPayment));

        // when
        PaymentResponse response = paymentService.getPaymentByKey(paymentKey);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getPaymentKey()).isEqualTo(paymentKey);
        assertThat(response.getOrderIdToss()).isEqualTo("order_1234567890_0");
        assertThat(response.getStatus()).isEqualTo("DONE");
        assertThat(response.getMethod()).isEqualTo("카드");

        verify(paymentRepository, times(1)).findByPaymentKey(paymentKey);
    }

    @Test
    @DisplayName("결제 조회 - paymentKey로 조회 실패")
    void getPaymentByKey_NotFound_ThrowsException() {
        // given
        String paymentKey = "payment_key_not_found";
        when(paymentRepository.findByPaymentKey(paymentKey))
                .thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> paymentService.getPaymentByKey(paymentKey))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("결제 정보를 찾을 수 없습니다");

        verify(paymentRepository, times(1)).findByPaymentKey(paymentKey);
    }

    @Test
    @DisplayName("결제 조회 - orderId로 조회 성공")
    void getPaymentByOrderId_Success() {
        // given
        String orderIdToss = "order_1234567890_0";
        Payment savedPayment = Payment.builder()
                .id(1L)
                .paymentKey("payment_key_123")
                .orderIdToss(orderIdToss)
                .orderName("아메리카노 외 1건")
                .totalAmount(new BigDecimal("10000"))
                .status("DONE")
                .method("카드")
                .build();

        when(paymentRepository.findByOrderIdToss(orderIdToss))
                .thenReturn(Optional.of(savedPayment));

        // when
        PaymentResponse response = paymentService.getPaymentByOrderId(orderIdToss);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getOrderIdToss()).isEqualTo(orderIdToss);
        assertThat(response.getStatus()).isEqualTo("DONE");

        verify(paymentRepository, times(1)).findByOrderIdToss(orderIdToss);
    }

    @Test
    @DisplayName("결제 조회 - orderId로 조회 실패")
    void getPaymentByOrderId_NotFound_ThrowsException() {
        // given
        String orderIdToss = "order_not_found";
        when(paymentRepository.findByOrderIdToss(orderIdToss))
                .thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> paymentService.getPaymentByOrderId(orderIdToss))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("결제 정보를 찾을 수 없습니다");

        verify(paymentRepository, times(1)).findByOrderIdToss(orderIdToss);
    }
}

