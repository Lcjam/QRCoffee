package com.qrcoffee.backend.common;

/**
 * 공통 상수 정의 클래스
 */
public final class Constants {
    
    private Constants() {
        // 인스턴스화 방지
    }
    
    // 주문 관련 상수
    public static final class Order {
        public static final String ORDER_NUMBER_DATE_FORMAT = "yyyyMMdd";
        public static final String ORDER_NUMBER_FORMAT = "%s-%03d-%s";
        public static final String UNKNOWN_SEAT = "알 수 없음";
        public static final String DEFAULT_CUSTOMER_REQUEST = "";
        
        private Order() {}
    }
    
    // 사용자 관련 상수
    public static final class User {
        public static final String LOGIN_SUCCESS_MESSAGE = "로그인 성공";
        public static final String SIGNUP_SUCCESS_MESSAGE = "회원가입 완료";
        public static final String USER_STATUS_CHANGE_MESSAGE = "사용자 상태 변경";
        
        private User() {}
    }
    
    // 좌석 관련 상수
    public static final class Seat {
        public static final int DEFAULT_MAX_CAPACITY = 4;
        public static final int QR_CODE_GENERATION_MAX_ATTEMPTS = 100;
        public static final String SEAT_CREATED_MESSAGE = "좌석 생성 완료";
        public static final String SEAT_UPDATED_MESSAGE = "좌석 수정 완료";
        public static final String SEAT_DELETED_MESSAGE = "좌석 삭제 완료";
        public static final String SEAT_STATUS_CHANGED_MESSAGE = "좌석 상태 변경";
        public static final String QR_CODE_REGENERATED_MESSAGE = "QR코드 재생성 완료";
        
        private Seat() {}
    }
    
    // 결제 관련 상수
    public static final class Payment {
        public static final String TOSS_API_URL = "https://api.tosspayments.com/v1/payments/confirm";
        public static final Long DEFAULT_STORE_ID = 1L;
        public static final int MAX_RETRY_COUNT = 3;
        public static final String PROVIDER_ERROR = "PROVIDER_ERROR";
        public static final String ORDER_ID_PREFIX = "order_";
        public static final java.math.BigDecimal VAT_RATE = java.math.BigDecimal.valueOf(1.1);
        public static final String DEFAULT_PAYMENT_METHOD = "간편결제";
        
        private Payment() {}
    }
    
    // 대시보드 관련 상수
    public static final class Dashboard {
        public static final int DEFAULT_POPULAR_MENU_LIMIT = 10;
        public static final String DATE_FORMAT_PATTERN = "yyyy-MM-dd";
        
        private Dashboard() {}
    }
    
    // WebSocket 관련 상수
    public static final class WebSocket {
        public static final int MAX_CONNECTIONS_PER_IP = 5;
        public static final long CONNECTION_RATE_LIMIT_MS = 1000; // 1초당 1개 연결
        public static final long CONNECTION_TIMEOUT_MS = 300000; // 5분 타임아웃
        public static final long CLEANUP_INTERVAL_MS = 600000; // 10분마다 정리
        
        private WebSocket() {}
    }
}
