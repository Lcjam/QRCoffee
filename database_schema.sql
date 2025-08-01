-- QR코드 기반 주문 시스템 MySQL 데이터베이스 스키마
-- 작성일: 2024
-- 데이터베이스: MySQL 8.0+

-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS qr_coffee_order 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE qr_coffee_order;

-- ================================================================================
-- 1. 매장 관리 테이블
-- ================================================================================

-- 매장 정보 테이블
CREATE TABLE stores (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '매장명',
    address TEXT COMMENT '매장 주소',
    phone VARCHAR(20) COMMENT '매장 전화번호',
    business_hours JSON COMMENT '영업시간 (JSON 형태)',
    is_active BOOLEAN DEFAULT TRUE COMMENT '매장 활성화 상태',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_stores_active (is_active),
    INDEX idx_stores_created (created_at)
) ENGINE=InnoDB COMMENT='매장 정보';

-- ================================================================================
-- 2. 사용자 관리 테이블
-- ================================================================================

-- 사용자 테이블 (관리자 및 서브계정)
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '이메일 (로그인 ID)',
    password VARCHAR(255) NOT NULL COMMENT '암호화된 비밀번호',
    name VARCHAR(50) NOT NULL COMMENT '사용자명',
    phone VARCHAR(20) COMMENT '전화번호',
    role ENUM('MASTER', 'SUB') DEFAULT 'MASTER' COMMENT '계정 유형',
    store_id BIGINT NOT NULL COMMENT '소속 매장 ID',
    parent_user_id BIGINT NULL COMMENT '서브계정의 경우 마스터 계정 ID',
    is_active BOOLEAN DEFAULT TRUE COMMENT '계정 활성화 상태',
    last_login_at TIMESTAMP NULL COMMENT '마지막 로그인 시간',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_users_email (email),
    INDEX idx_users_store (store_id),
    INDEX idx_users_parent (parent_user_id),
    INDEX idx_users_active (is_active)
) ENGINE=InnoDB COMMENT='사용자 관리 (관리자/서브계정)';

-- ================================================================================
-- 3. 좌석 및 QR코드 관리 테이블
-- ================================================================================

-- 좌석 테이블
CREATE TABLE seats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    store_id BIGINT NOT NULL COMMENT '매장 ID',
    seat_number VARCHAR(100) NOT NULL COMMENT '좌석 번호',
    description VARCHAR(255) COMMENT '좌석 설명',
    qr_code VARCHAR(36) UNIQUE NOT NULL COMMENT 'QR코드 UUID',
    is_active BOOLEAN DEFAULT TRUE COMMENT '좌석 사용 가능 여부',
    is_occupied BOOLEAN DEFAULT FALSE COMMENT '현재 사용 중 여부',
    max_capacity INT DEFAULT 4 COMMENT '최대 수용 인원',
    qr_code_image_url TEXT COMMENT 'QR코드 이미지 Base64',
    qr_generated_at TIMESTAMP COMMENT 'QR코드 생성 시점',
    last_used_at TIMESTAMP COMMENT '마지막 사용 시점',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    
    UNIQUE KEY uk_seats_store_number (store_id, seat_number),
    UNIQUE KEY uk_seats_qr_code (qr_code),
    INDEX idx_seats_store_active (store_id, is_active),
    INDEX idx_seats_store_occupied (store_id, is_occupied),
    INDEX idx_seats_last_used (last_used_at)
) ENGINE=InnoDB COMMENT='좌석 관리';

-- ================================================================================
-- 4. 메뉴 관리 테이블
-- ================================================================================

-- 메뉴 카테고리 테이블
CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    store_id BIGINT NOT NULL COMMENT '매장 ID',
    name VARCHAR(50) NOT NULL COMMENT '카테고리명',
    display_order INT DEFAULT 0 COMMENT '진열 순서',
    is_active BOOLEAN DEFAULT TRUE COMMENT '카테고리 활성화 상태',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    
    INDEX idx_categories_store (store_id),
    INDEX idx_categories_order (display_order),
    INDEX idx_categories_active (is_active)
) ENGINE=InnoDB COMMENT='메뉴 카테고리';

-- 메뉴 테이블
CREATE TABLE menus (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    store_id BIGINT NOT NULL COMMENT '매장 ID',
    category_id BIGINT NOT NULL COMMENT '카테고리 ID',
    name VARCHAR(100) NOT NULL COMMENT '메뉴명',
    description TEXT COMMENT '메뉴 설명',
    price DECIMAL(10,0) NOT NULL COMMENT '가격 (원 단위)',
    image_url VARCHAR(500) COMMENT '메뉴 이미지 URL',
    is_available BOOLEAN DEFAULT TRUE COMMENT '판매 가능 상태 (품절 관리)',
    display_order INT DEFAULT 0 COMMENT '진열 순서',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    
    INDEX idx_menus_store (store_id),
    INDEX idx_menus_category (category_id),
    INDEX idx_menus_available (is_available),
    INDEX idx_menus_order (display_order)
) ENGINE=InnoDB COMMENT='메뉴 관리';

-- ================================================================================
-- 5. 주문 관리 테이블
-- ================================================================================

-- 주문 테이블
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    store_id BIGINT NOT NULL COMMENT '매장 ID',
    seat_id BIGINT NOT NULL COMMENT '좌석 ID',
    order_number VARCHAR(20) UNIQUE NOT NULL COMMENT '주문 번호 (자동생성)',
    total_amount DECIMAL(10,0) NOT NULL COMMENT '총 주문 금액',
    status ENUM('PENDING', 'PREPARING', 'COMPLETED', 'PICKED_UP', 'CANCELLED') 
           DEFAULT 'PENDING' COMMENT '주문 상태',
    payment_status ENUM('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED') 
                   DEFAULT 'PENDING' COMMENT '결제 상태',
    customer_request TEXT COMMENT '고객 요청사항',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE,
    
    INDEX idx_orders_store (store_id),
    INDEX idx_orders_seat (seat_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_payment_status (payment_status),
    INDEX idx_orders_created (created_at),
    INDEX idx_orders_number (order_number)
) ENGINE=InnoDB COMMENT='주문 관리';

-- 주문 상세 테이블
CREATE TABLE order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL COMMENT '주문 ID',
    menu_id BIGINT NOT NULL COMMENT '메뉴 ID',
    menu_name VARCHAR(100) NOT NULL COMMENT '주문 당시 메뉴명 (히스토리 보존)',
    quantity INT NOT NULL COMMENT '수량',
    unit_price DECIMAL(10,0) NOT NULL COMMENT '단가 (주문 당시 가격)',
    total_price DECIMAL(10,0) NOT NULL COMMENT '총액 (수량 × 단가)',
    options JSON COMMENT '메뉴 옵션 (추후 확장용)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE RESTRICT,
    
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_menu (menu_id)
) ENGINE=InnoDB COMMENT='주문 상세 항목';

-- ================================================================================
-- 6. 결제 관리 테이블
-- ================================================================================

-- 결제 테이블 (토스페이먼츠 v1 규격)
CREATE TABLE payments (
    -- 기본 식별자
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NULL COMMENT '주문 ID (장바구니 직결제시 null 가능)',
    
    -- 토스페이먼츠 v1 핵심 필드들
    payment_key VARCHAR(200) COMMENT '토스페이먼츠 결제키 (paymentKey)',
    order_id_toss VARCHAR(64) NOT NULL COMMENT '토스페이먼츠 주문ID (orderId)',
    
    -- 결제 기본 정보  
    type ENUM('NORMAL', 'BILLING', 'BRANDPAY') DEFAULT 'NORMAL' COMMENT '결제 타입',
    order_name VARCHAR(100) COMMENT '주문명',
    currency VARCHAR(3) DEFAULT 'KRW' COMMENT '통화',
    country VARCHAR(2) DEFAULT 'KR' COMMENT '국가코드',
    version VARCHAR(20) DEFAULT '2022-11-16' COMMENT 'API 버전',
    
    -- 결제 상태 (토스페이먼츠 v1 공식 상태값)
    status ENUM(
        'READY',                -- 결제 요청
        'IN_PROGRESS',          -- 결제 진행 중
        'WAITING_FOR_DEPOSIT',  -- 입금 대기 (가상계좌)
        'DONE',                 -- 결제 완료
        'CANCELED',             -- 결제 취소
        'PARTIAL_CANCELED',     -- 부분 취소
        'ABORTED',              -- 결제 중단
        'EXPIRED'               -- 결제 만료
    ) DEFAULT 'READY' COMMENT '토스페이먼츠 결제 상태',
    
    -- 결제 수단 (토스페이먼츠 v1 실제 반환값 저장용)
    method VARCHAR(50) COMMENT '토스페이먼츠 결제 수단 (실제 반환값)',
    
    -- 금액 정보
    total_amount DECIMAL(10,0) NOT NULL COMMENT '총 결제 금액',
    balance_amount DECIMAL(10,0) NOT NULL COMMENT '취소 가능 금액',
    supplied_amount DECIMAL(10,0) NOT NULL COMMENT '공급가액',
    vat DECIMAL(10,0) NOT NULL COMMENT '부가세',
    tax_free_amount DECIMAL(10,0) DEFAULT 0 COMMENT '면세 금액',
    tax_exemption_amount DECIMAL(10,0) DEFAULT 0 COMMENT '비과세 금액',
    
    -- 거래 식별자
    last_transaction_key VARCHAR(64) COMMENT '마지막 거래키 (lastTransactionKey)',
    transaction_key VARCHAR(64) COMMENT '거래키 (transactionKey)',
    mid VARCHAR(14) COMMENT '가맹점 ID',
    
    -- 결제 수단별 상세 정보 (JSON)
    card JSON COMMENT '카드 결제 상세 정보',
    virtual_account JSON COMMENT '가상계좌 정보',
    easy_pay JSON COMMENT '간편결제 정보',
    mobile_phone JSON COMMENT '휴대폰 결제 정보',
    transfer JSON COMMENT '계좌이체 정보',
    gift_certificate JSON COMMENT '상품권 결제 정보',
    
    -- 현금영수증 정보
    cash_receipt JSON COMMENT '현금영수증 정보',
    cash_receipts JSON COMMENT '현금영수증 목록',
    
    -- 할인 및 취소 정보
    discount JSON COMMENT '할인 정보',
    cancels JSON COMMENT '취소 내역',
    
    -- 메타데이터 및 기타 정보
    metadata JSON COMMENT '커스텀 메타데이터 (장바구니 정보 임시 저장용)',
    receipt JSON COMMENT '영수증 정보',
    checkout JSON COMMENT '체크아웃 정보',
    failure JSON COMMENT '결제 실패 상세 정보',
    
    -- 고급 기능 플래그
    use_escrow BOOLEAN DEFAULT FALSE COMMENT '에스크로 사용 여부',
    culture_expense BOOLEAN DEFAULT FALSE COMMENT '문화비 지출 여부',
    is_partial_cancelable BOOLEAN DEFAULT TRUE COMMENT '부분취소 가능 여부',
    
    -- 웹훅 검증용
    secret VARCHAR(50) COMMENT '웹훅 검증용 시크릿값',
    
    -- 타임스탬프
    requested_at TIMESTAMP NULL COMMENT '결제 요청 시간',
    approved_at TIMESTAMP NULL COMMENT '결제 승인 시간',
    
    -- 기본 타임스탬프
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- 외래키 제약조건 (nullable)
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    
    -- UNIQUE 제약조건
    UNIQUE KEY uk_payments_payment_key (payment_key),
    UNIQUE KEY uk_payments_order_id_toss (order_id_toss),
    
    -- 기본 조회 인덱스
    INDEX idx_payments_order (order_id),
    INDEX idx_payments_last_transaction_key (last_transaction_key),
    INDEX idx_payments_transaction_key (transaction_key),
    INDEX idx_payments_status (status),
    INDEX idx_payments_method (method),
    INDEX idx_payments_approved (approved_at),
    
    -- 고급 검색 인덱스
    INDEX idx_payments_type (type),
    INDEX idx_payments_currency (currency),
    INDEX idx_payments_balance_amount (balance_amount),
    INDEX idx_payments_mid (mid),
    
    -- 복합 인덱스 (성능 최적화)
    INDEX idx_payments_order_status_approved (order_id, status, approved_at),
    INDEX idx_payments_status_method_created (status, method, created_at),
    INDEX idx_payments_toss_order_status (order_id_toss, status)
    
) ENGINE=InnoDB COMMENT='결제 관리 (토스페이먼츠 v1 규격)';

-- ================================================================================
-- 7. 알림 관리 테이블
-- ================================================================================

-- 알림 테이블
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NULL COMMENT '관련 주문 ID',
    store_id BIGINT NOT NULL COMMENT '매장 ID',
    user_type ENUM('CUSTOMER', 'ADMIN') NOT NULL COMMENT '알림 대상 (고객/관리자)',
    message TEXT NOT NULL COMMENT '알림 메시지',
    notification_type ENUM('ORDER_RECEIVED', 'ORDER_COMPLETED', 'ORDER_CANCELLED', 'PAYMENT_COMPLETED') 
                     NOT NULL COMMENT '알림 유형',
    is_read BOOLEAN DEFAULT FALSE COMMENT '읽음 상태',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '알림 발송 시간',
    read_at TIMESTAMP NULL COMMENT '읽음 처리 시간',
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    
    INDEX idx_notifications_order (order_id),
    INDEX idx_notifications_store (store_id),
    INDEX idx_notifications_type (notification_type),
    INDEX idx_notifications_read (is_read),
    INDEX idx_notifications_sent (sent_at)
) ENGINE=InnoDB COMMENT='알림 관리';

-- ================================================================================
-- 8. 파일 업로드 관리 테이블
-- ================================================================================

-- 업로드된 파일 관리 테이블
CREATE TABLE uploaded_files (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    original_filename VARCHAR(255) NOT NULL COMMENT '원본 파일명',
    stored_filename VARCHAR(255) NOT NULL COMMENT '저장된 파일명',
    file_path VARCHAR(500) NOT NULL COMMENT '파일 저장 경로',
    file_size BIGINT NOT NULL COMMENT '파일 크기 (bytes)',
    mime_type VARCHAR(100) NOT NULL COMMENT 'MIME 타입',
    uploaded_by BIGINT NULL COMMENT '업로드한 사용자 ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_files_filename (stored_filename),
    INDEX idx_files_uploaded_by (uploaded_by),
    INDEX idx_files_created (created_at)
) ENGINE=InnoDB COMMENT='업로드 파일 관리';

-- ================================================================================
-- 9. 시스템 설정 테이블 (확장용)
-- ================================================================================

-- 매장별 설정 테이블
CREATE TABLE store_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    store_id BIGINT NOT NULL COMMENT '매장 ID',
    setting_key VARCHAR(100) NOT NULL COMMENT '설정 키',
    setting_value TEXT COMMENT '설정 값',
    description VARCHAR(255) COMMENT '설정 설명',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    
    UNIQUE KEY uk_store_settings (store_id, setting_key),
    INDEX idx_store_settings_key (setting_key)
) ENGINE=InnoDB COMMENT='매장별 설정 관리';

-- ================================================================================
-- 10. 초기 데이터 삽입
-- ================================================================================

-- 기본 매장 데이터 (테스트용)
INSERT INTO stores (name, address, phone, business_hours) VALUES 
('테스트 카페', '서울시 강남구 테스트로 123', '02-1234-5678', 
 JSON_OBJECT('mon', '09:00-22:00', 'tue', '09:00-22:00', 'wed', '09:00-22:00', 
             'thu', '09:00-22:00', 'fri', '09:00-22:00', 'sat', '10:00-23:00', 
             'sun', '10:00-21:00'));

-- 기본 관리자 계정 (패스워드: admin123, BCrypt 암호화 필요)
INSERT INTO users (email, password, name, phone, role, store_id) VALUES 
('admin@test.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaLyqDHzCHGqy', 
 '관리자', '010-1234-5678', 'MASTER', 1);

-- ================================================================================
-- 11. 인덱스 최적화 및 성능 튜닝
-- ================================================================================

-- 주문 조회 최적화를 위한 복합 인덱스
CREATE INDEX idx_orders_store_status_created ON orders(store_id, status, created_at);
CREATE INDEX idx_orders_store_created_desc ON orders(store_id, created_at DESC);

-- 메뉴 조회 최적화를 위한 복합 인덱스  
CREATE INDEX idx_menus_store_category_available ON menus(store_id, category_id, is_available);
CREATE INDEX idx_menus_store_available_order ON menus(store_id, is_available, display_order);

-- 알림 조회 최적화를 위한 복합 인덱스
CREATE INDEX idx_notifications_store_type_read ON notifications(store_id, user_type, is_read);
CREATE INDEX idx_notifications_store_sent_desc ON notifications(store_id, sent_at DESC);

-- ================================================================================
-- 12. 트리거 설정 (자동화)
-- ================================================================================

-- 주문 번호 자동 생성 트리거
DELIMITER $$
CREATE TRIGGER before_order_insert 
BEFORE INSERT ON orders 
FOR EACH ROW 
BEGIN 
    DECLARE order_count INT;
    DECLARE today_str VARCHAR(8);
    
    SET today_str = DATE_FORMAT(NOW(), '%Y%m%d');
    
    SELECT COUNT(*) + 1 INTO order_count 
    FROM orders 
    WHERE DATE(created_at) = CURDATE() AND store_id = NEW.store_id;
    
    SET NEW.order_number = CONCAT(today_str, '-', LPAD(NEW.store_id, 3, '0'), '-', LPAD(order_count, 4, '0'));
END$$
DELIMITER ;

-- 주문 상태 변경 시 알림 생성 트리거
DELIMITER $$
CREATE TRIGGER after_order_status_update 
AFTER UPDATE ON orders 
FOR EACH ROW 
BEGIN 
    DECLARE notification_msg TEXT;
    DECLARE notification_type_val VARCHAR(50);
    
    IF OLD.status != NEW.status THEN
        CASE NEW.status
            WHEN 'PREPARING' THEN
                SET notification_msg = '주문이 제조를 시작했습니다.';
                SET notification_type_val = 'ORDER_RECEIVED';
            WHEN 'COMPLETED' THEN
                SET notification_msg = '주문이 완료되었습니다. 카운터로 와서 수령해주세요!';
                SET notification_type_val = 'ORDER_COMPLETED';
            WHEN 'CANCELLED' THEN
                SET notification_msg = '주문이 취소되었습니다.';
                SET notification_type_val = 'ORDER_CANCELLED';
            ELSE
                SET notification_msg = NULL;
        END CASE;
        
        IF notification_msg IS NOT NULL THEN
            INSERT INTO notifications (order_id, store_id, user_type, message, notification_type)
            VALUES (NEW.id, NEW.store_id, 'CUSTOMER', notification_msg, notification_type_val);
        END IF;
    END IF;
END$$
DELIMITER ; 