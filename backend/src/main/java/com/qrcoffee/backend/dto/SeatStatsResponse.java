package com.qrcoffee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatStatsResponse {
    
    private Long totalSeats; // 총 좌석 수
    private Long activeSeats; // 활성 좌석 수
    private Double utilizationRate; // 활용율 (활성좌석 / 총좌석)
    
    public static SeatStatsResponse from(Object[] stats) {
        if (stats == null || stats.length < 2) {
            return SeatStatsResponse.builder()
                    .totalSeats(0L)
                    .activeSeats(0L)
                    .utilizationRate(0.0)
                    .build();
        }
        
        Long totalSeats = ((Number) stats[0]).longValue();
        Long activeSeats = ((Number) stats[1]).longValue();
        
        Double utilizationRate = totalSeats > 0 ? (double) activeSeats / totalSeats * 100 : 0.0;
        
        return SeatStatsResponse.builder()
                .totalSeats(totalSeats)
                .activeSeats(activeSeats)
                .utilizationRate(Math.round(utilizationRate * 100.0) / 100.0) // 소수점 2자리
                .build();
    }
} 