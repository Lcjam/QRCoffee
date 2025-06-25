package com.qrcoffee.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "seats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "store_id", nullable = false)
    private Long storeId; // 매장 ID
    
    @Column(name = "seat_number", nullable = false, length = 100)
    private String seatNumber; // 좌석 번호 (예: "A1", "테이블1", "창가1")
    
    @Column(name = "description", length = 255)
    private String description; // 좌석 설명 (예: "창가 좌석", "2인용 테이블")
    
    @Column(name = "qr_code", nullable = false, unique = true, length = 36)
    private String qrCode; // QR코드 UUID
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true; // 좌석 사용 가능 여부
    
    @Column(name = "is_occupied", nullable = false)
    private Boolean isOccupied = false; // 현재 사용 중 여부
    
    @Column(name = "max_capacity", nullable = false)
    private Integer maxCapacity = 4; // 최대 수용 인원
    
    @Column(name = "qr_code_image_url", length = 500)
    private String qrCodeImageUrl; // QR코드 이미지 URL (선택사항)
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // QR코드 생성 시점
    @Column(name = "qr_generated_at")
    private LocalDateTime qrGeneratedAt;
    
    // 마지막 사용 시점
    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;
    
    // 복합 인덱스 제약조건 추가
    @Table(indexes = {
        @Index(name = "idx_seat_store_number", columnList = "storeId, seatNumber", unique = true),
        @Index(name = "idx_seat_qr_code", columnList = "qrCode", unique = true),
        @Index(name = "idx_seat_store_active", columnList = "storeId, isActive")
    })
    public static class SeatIndexes {}
    
    // 편의 메서드들
    public boolean isAvailable() {
        return isActive && !isOccupied;
    }
    
    public void occupy() {
        this.isOccupied = true;
        this.lastUsedAt = LocalDateTime.now();
    }
    
    public void release() {
        this.isOccupied = false;
    }
    
    public void activate() {
        this.isActive = true;
    }
    
    public void deactivate() {
        this.isActive = false;
        this.isOccupied = false; // 비활성화 시 점유 상태도 해제
    }
} 