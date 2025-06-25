-- 5단계: 좌석 테이블 업데이트 스크립트
-- 기존 테이블을 새로운 스키마로 업데이트

USE qr_coffee_order;

-- 기존 seats 테이블이 있다면 삭제 (데이터 손실 주의!)
DROP TABLE IF EXISTS seats;

-- 새로운 seats 테이블 생성
CREATE TABLE seats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    store_id BIGINT NOT NULL COMMENT '매장 ID',
    seat_number VARCHAR(100) NOT NULL COMMENT '좌석 번호 (예: A1, 테이블1, 창가1)',
    description VARCHAR(255) COMMENT '좌석 설명 (예: 창가 좌석, 2인용 테이블)',
    qr_code VARCHAR(36) UNIQUE NOT NULL COMMENT 'QR코드 UUID',
    is_active BOOLEAN DEFAULT TRUE COMMENT '좌석 사용 가능 여부',
    is_occupied BOOLEAN DEFAULT FALSE COMMENT '현재 사용 중 여부',
    max_capacity INT DEFAULT 4 COMMENT '최대 수용 인원',
    qr_code_image_url VARCHAR(500) COMMENT 'QR코드 이미지 URL (선택사항)',
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

-- 테이블 생성 확인
DESCRIBE seats;

-- 업데이트 완료 메시지
SELECT 'Seats 테이블이 성공적으로 업데이트되었습니다!' AS status; 