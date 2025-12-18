package com.qrcoffee.backend.dto;

import com.qrcoffee.backend.entity.Seat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatResponse {
    
    private Long id;
    private Long storeId;
    private String seatNumber;
    private String description;
    private String qrCode;
    private Boolean isActive;
    private Boolean isOccupied;
    private Integer maxCapacity;
    private String qrCodeImageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime qrGeneratedAt;
    private LocalDateTime lastUsedAt;
    
    // 편의 필드들
    private Boolean isAvailable; // 사용 가능 여부 (활성화 & 비점유)
    private String status; // 상태 문자열 표현
    
    public static SeatResponse from(Seat seat) {
        return SeatResponse.builder()
                .id(seat.getId())
                .storeId(seat.getStoreId())
                .seatNumber(seat.getSeatNumber())
                .description(seat.getDescription())
                .qrCode(seat.getQrCode())
                .isActive(seat.getIsActive())
                .isOccupied(seat.getIsOccupied())
                .maxCapacity(seat.getMaxCapacity())
                .qrCodeImageUrl(seat.getQrCodeImageUrl())
                .createdAt(seat.getCreatedAt())
                .updatedAt(seat.getUpdatedAt())
                .qrGeneratedAt(seat.getQrGeneratedAt())
                .lastUsedAt(seat.getLastUsedAt())
                .isAvailable(seat.isAvailable())
                .status(getStatusString(seat))
                .build();
    }
    
    private static String getStatusString(Seat seat) {
        if (seat.getIsActive() == null || !seat.getIsActive()) {
            return "비활성";
        } else if (seat.getIsOccupied() != null && seat.getIsOccupied()) {
            return "사용중";
        } else {
            return "사용가능";
        }
    }
} 