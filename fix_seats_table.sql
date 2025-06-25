USE qr_coffee_order;

-- 1. 외래키 제약조건 제거
ALTER TABLE orders DROP FOREIGN KEY orders_ibfk_2;

-- 2. 기존 seats 테이블 삭제
DROP TABLE IF EXISTS seats;

-- 3. 새로운 seats 테이블 생성 (우리 엔티티에 맞게)
CREATE TABLE seats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    store_id BIGINT NOT NULL COMMENT '매장 ID',
    seat_number VARCHAR(100) NOT NULL COMMENT '좌석 번호',
    description VARCHAR(255) COMMENT '좌석 설명',
    qr_code VARCHAR(36) UNIQUE NOT NULL COMMENT 'QR코드 UUID',
    is_active BOOLEAN DEFAULT TRUE COMMENT '좌석 사용 가능 여부',
    is_occupied BOOLEAN DEFAULT FALSE COMMENT '현재 사용 중 여부',
    max_capacity INT DEFAULT 4 COMMENT '최대 수용 인원',
    qr_code_image_url VARCHAR(500) COMMENT 'QR코드 이미지 URL',
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

-- 4. orders 테이블에 외래키 제약조건 다시 추가
ALTER TABLE orders ADD CONSTRAINT orders_ibfk_2 
    FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE;

SELECT 'Seats 테이블이 성공적으로 재생성되었습니다!' AS status;
SELECT 'qr_code 컬럼명으로 변경 완료!' AS note;
