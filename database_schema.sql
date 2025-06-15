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
    seat_number VARCHAR(10) NOT NULL COMMENT '좌석 번호 (A1, B2 등)',
    qr_code_uuid VARCHAR(36) UNIQUE NOT NULL COMMENT 'QR코드용 UUID',
    is_active BOOLEAN DEFAULT TRUE COMMENT '좌석 활성화 상태',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    
    UNIQUE KEY uk_seats_store_number (store_id, seat_number),
    INDEX idx_seats_uuid (qr_code_uuid),
    INDEX idx_seats_active (is_active)
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

-- 결제 테이블
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL COMMENT '주문 ID',
    payment_key VARCHAR(200) UNIQUE NOT NULL COMMENT '토스페이먼츠 결제키',
    order_id_toss VARCHAR(200) NOT NULL COMMENT '토스페이먼츠 주문ID',
    amount DECIMAL(10,0) NOT NULL COMMENT '결제 금액',
    status ENUM('READY', 'IN_PROGRESS', 'WAITING_FOR_DEPOSIT', 'DONE', 'CANCELED', 'PARTIAL_CANCELED', 'ABORTED', 'EXPIRED') 
           DEFAULT 'READY' COMMENT '결제 상태 (토스페이먼츠 기준)',
    method VARCHAR(50) COMMENT '결제 수단 (카드, 간편결제 등)',
    approved_at TIMESTAMP NULL COMMENT '결제 승인 시간',
    failed_reason TEXT COMMENT '결제 실패 사유',
    cancel_reason TEXT COMMENT '결제 취소 사유',
    receipt_url VARCHAR(500) COMMENT '영수증 URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    
    INDEX idx_payments_order (order_id),
    INDEX idx_payments_key (payment_key),
    INDEX idx_payments_status (status),
    INDEX idx_payments_approved (approved_at)
) ENGINE=InnoDB COMMENT='결제 관리';

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