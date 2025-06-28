package com.qrcoffee.backend.service;

import com.qrcoffee.backend.dto.OrderRequest;
import com.qrcoffee.backend.dto.OrderResponse;
import com.qrcoffee.backend.dto.OrderItemRequest;
import com.qrcoffee.backend.entity.*;
import com.qrcoffee.backend.exception.BusinessException;
import com.qrcoffee.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class OrderService {
    
    // 상수 정의
    private static final String ORDER_NUMBER_DATE_FORMAT = "yyyyMMdd";
    private static final String ORDER_NUMBER_FORMAT = "%s-%03d-%s";
    private static final String UNKNOWN_SEAT = "알 수 없음";
    private static final String DEFAULT_CUSTOMER_REQUEST = "";
    
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final MenuRepository menuRepository;
    private final SeatRepository seatRepository;
    private final StoreRepository storeRepository;
    
    /**
     * 주문 생성
     */
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        log.info("주문 생성 시작: storeId={}, seatId={}", request.getStoreId(), request.getSeatId());
        
        // 매장 및 좌석 검증
        Store store = validateStore(request.getStoreId());
        Seat seat = validateSeat(request.getSeatId(), request.getStoreId());
        
        // 주문 엔티티 생성
        Order order = createOrderEntity(request, store);
        
        // 주문 항목 처리 및 총액 계산
        BigDecimal totalAmount = processOrderItems(order, request);
        order.setTotalAmount(totalAmount);
        
        // 주문 저장
        Order savedOrder = orderRepository.save(order);
        
        log.info("주문 생성 완료: orderId={}, orderNumber={}, totalAmount={}", 
                savedOrder.getId(), savedOrder.getOrderNumber(), savedOrder.getTotalAmount());
        
        return OrderResponse.fromWithSeat(savedOrder, seat.getSeatNumber());
    }
    
    /**
     * 매장 검증
     */
    private Store validateStore(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException("존재하지 않는 매장입니다.", HttpStatus.NOT_FOUND));
        
        if (!store.getIsActive()) {
            throw new BusinessException("운영 중이지 않은 매장입니다.", HttpStatus.BAD_REQUEST);
        }
        
        return store;
    }
    
    /**
     * 좌석 검증
     */
    private Seat validateSeat(Long seatId, Long storeId) {
        Seat seat = seatRepository.findByIdAndStoreId(seatId, storeId)
                .orElseThrow(() -> new BusinessException("존재하지 않는 좌석입니다.", HttpStatus.NOT_FOUND));
        
        if (!seat.getIsActive()) {
            throw new BusinessException("사용할 수 없는 좌석입니다.", HttpStatus.BAD_REQUEST);
        }
        
        return seat;
    }
    
    /**
     * 주문 엔티티 생성
     */
    private Order createOrderEntity(OrderRequest request, Store store) {
        return Order.builder()
                .storeId(request.getStoreId())
                .seatId(request.getSeatId())
                .orderNumber(generateOrderNumber(request.getStoreId()))
                .totalAmount(BigDecimal.ZERO)
                .status(Order.OrderStatus.PENDING)
                .paymentStatus(Order.PaymentStatus.PENDING)
                .customerRequest(request.getCustomerRequest() != null ? 
                    request.getCustomerRequest() : DEFAULT_CUSTOMER_REQUEST)
                .build();
    }
    
    /**
     * 주문 항목 처리 및 총액 계산
     */
    private BigDecimal processOrderItems(Order order, OrderRequest request) {
        BigDecimal totalAmount = BigDecimal.ZERO;
        
        // 주문 항목 생성 및 총액 계산
        for (OrderItemRequest itemRequest : request.getOrderItems()) {
            // 메뉴 존재 및 판매 가능 확인
            Menu menu = menuRepository.findByIdAndStoreId(itemRequest.getMenuId(), request.getStoreId())
                    .orElseThrow(() -> new BusinessException("존재하지 않는 메뉴입니다: " + itemRequest.getMenuId(), HttpStatus.NOT_FOUND));
            
            if (!menu.getIsAvailable()) {
                throw new BusinessException(menu.getName() + "은(는) 현재 품절입니다.", HttpStatus.BAD_REQUEST);
            }
            
            OrderItem orderItem = createOrderItem(order, menu, itemRequest);
            order.addOrderItem(orderItem);
            totalAmount = totalAmount.add(orderItem.getTotalPrice());
        }
        
        return totalAmount;
    }
    
    /**
     * 주문 항목 생성
     */
    private OrderItem createOrderItem(Order order, Menu menu, OrderItemRequest itemRequest) {
        String options = itemRequest.getOptions() != null ? 
                String.join(",", itemRequest.getOptions()) : null;
                
        return OrderItem.createOrderItem(
                order,
                menu.getId(),
                menu.getName(),
                itemRequest.getQuantity(),
                menu.getPrice(),
                options
        );
    }
    
    /**
     * 주문 조회 (고객용)
     */
    public OrderResponse getOrder(Long orderId) {
        Order order = findOrderById(orderId);
        Seat seat = findSeatById(order.getSeatId());
        
        return OrderResponse.fromWithSeat(order, seat.getSeatNumber());
    }
    
    /**
     * 주문 번호로 조회
     */
    public OrderResponse getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new BusinessException("주문을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        Seat seat = findSeatById(order.getSeatId());
        
        return OrderResponse.fromWithSeat(order, seat.getSeatNumber());
    }
    
    /**
     * 매장별 주문 목록 조회 (관리자용) - N+1 쿼리 해결
     */
    public List<OrderResponse> getOrdersByStore(Long storeId) {
        List<Order> orders = orderRepository.findByStoreIdOrderByCreatedAtDesc(storeId);
        
        if (orders.isEmpty()) {
            return List.of();
        }
        
        // 좌석 정보 배치 조회
        Map<Long, String> seatNumberMap = getSeatNumberMap(orders);
        
        return orders.stream()
                .map(order -> {
                    String seatNumber = seatNumberMap.getOrDefault(order.getSeatId(), UNKNOWN_SEAT);
                    return OrderResponse.fromWithSeat(order, seatNumber);
                })
                .collect(Collectors.toList());
    }
    
    /**
     * 매장별 특정 상태 주문 조회 - N+1 쿼리 해결
     */
    public List<OrderResponse> getOrdersByStatus(Long storeId, Order.OrderStatus status) {
        List<Order> orders = orderRepository.findByStoreIdAndStatusOrderByCreatedAtDesc(storeId, status);
        
        if (orders.isEmpty()) {
            return List.of();
        }
        
        // 좌석 정보 배치 조회
        Map<Long, String> seatNumberMap = getSeatNumberMap(orders);
        
        return orders.stream()
                .map(order -> {
                    String seatNumber = seatNumberMap.getOrDefault(order.getSeatId(), UNKNOWN_SEAT);
                    return OrderResponse.fromWithSeat(order, seatNumber);
                })
                .collect(Collectors.toList());
    }
    
    /**
     * 좌석 번호 맵 생성 (개선된 조회)
     */
    private Map<Long, String> getSeatNumberMap(List<Order> orders) {
        return orders.stream()
                .map(Order::getSeatId)
                .distinct()
                .collect(Collectors.toMap(
                    Function.identity(),
                    seatId -> {
                        Seat seat = seatRepository.findById(seatId).orElse(null);
                        return seat != null ? seat.getSeatNumber() : UNKNOWN_SEAT;
                    }
                ));
    }
    
    /**
     * 주문 상태 변경 (관리자용)
     */
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, Long storeId, Order.OrderStatus newStatus) {
        Order order = findOrderByIdAndStoreId(orderId, storeId);
        Order.OrderStatus currentStatus = order.getStatus();
        
        try {
            updateOrderStatusSafely(order, newStatus);
            
            Order updatedOrder = orderRepository.save(order);
            
            log.info("주문 상태 변경: orderId={}, {} -> {}", 
                    orderId, currentStatus, newStatus);
            
            Seat seat = findSeatById(order.getSeatId());
            return OrderResponse.fromWithSeat(updatedOrder, seat.getSeatNumber());
            
        } catch (IllegalStateException e) {
            throw new BusinessException(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
    
    /**
     * 주문 상태 안전하게 변경
     */
    private void updateOrderStatusSafely(Order order, Order.OrderStatus newStatus) {
        switch (newStatus) {
            case PREPARING:
                order.startPreparing();
                break;
            case COMPLETED:
                order.complete();
                break;
            case PICKED_UP:
                order.pickUp();
                break;
            case CANCELLED:
                order.cancel();
                break;
            default:
                throw new BusinessException("지원하지 않는 상태 변경입니다.", HttpStatus.BAD_REQUEST);
        }
    }
    
    /**
     * 주문 취소 (고객용)
     */
    @Transactional
    public OrderResponse cancelOrder(Long orderId) {
        Order order = findOrderById(orderId);
        
        if (!order.canCancel()) {
            throw new BusinessException("제조가 시작된 주문은 취소할 수 없습니다.", HttpStatus.BAD_REQUEST);
        }
        
        order.cancel();
        Order cancelledOrder = orderRepository.save(order);
        
        log.info("주문 취소: orderId={}, orderNumber={}", orderId, order.getOrderNumber());
        
        Seat seat = findSeatById(order.getSeatId());
        return OrderResponse.fromWithSeat(cancelledOrder, seat.getSeatNumber());
    }
    
    /**
     * 매장별 오늘 주문 통계
     */
    public long getTodayOrderCount(Long storeId) {
        return orderRepository.countByStoreIdAndDate(storeId, LocalDateTime.now());
    }
    
    /**
     * 매장별 대기 중인 주문 개수
     */
    public long getPendingOrderCount(Long storeId) {
        return orderRepository.countByStoreIdAndStatus(storeId, Order.OrderStatus.PENDING);
    }
    
    /**
     * 동시성 안전한 주문 번호 생성
     */
    private String generateOrderNumber(Long storeId) {
        String today = LocalDateTime.now().format(DateTimeFormatter.ofPattern(ORDER_NUMBER_DATE_FORMAT));
        String uniqueId = generateUniqueId();
        
        return String.format(ORDER_NUMBER_FORMAT, today, storeId, uniqueId);
    }
    
    /**
     * 고유 식별자 생성 (동시성 안전)
     */
    private String generateUniqueId() {
        // UUID의 앞 8자리 사용하여 충돌 가능성 최소화
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }
    
    /**
     * 주문 ID로 조회 (공통 메서드)
     */
    private Order findOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("주문을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
    }
    
    /**
     * 주문 ID와 매장 ID로 조회 (공통 메서드)
     */
    private Order findOrderByIdAndStoreId(Long orderId, Long storeId) {
        return orderRepository.findByIdAndStoreId(orderId, storeId)
                .orElseThrow(() -> new BusinessException("주문을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
    }
    
    /**
     * 좌석 ID로 조회 (공통 메서드)
     */
    private Seat findSeatById(Long seatId) {
        return seatRepository.findById(seatId)
                .orElse(null); // null 허용 (UNKNOWN_SEAT으로 처리)
    }
} 