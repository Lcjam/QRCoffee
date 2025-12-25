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
    private Long occupiedSeats; // 사용 중인 좌석 수
    private Long availableSeats; // 사용 가능한 좌석 수
    private Double occupancyRate; // 점유율 (사용중 / 활성좌석)
    private Double utilizationRate; // 활용율 (활성좌석 / 총좌석)
    
    public static SeatStatsResponse from(Object[] stats) {
        if (stats == null || stats.length < 4) {
            return SeatStatsResponse.builder()
                    .totalSeats(0L)
                    .activeSeats(0L)
                    .occupiedSeats(0L)
                    .availableSeats(0L)
                    .occupancyRate(0.0)
                    .utilizationRate(0.0)
                    .build();
        }
        
        Long totalSeats = ((Number) stats[0]).longValue();
        Long activeSeats = ((Number) stats[1]).longValue();
        Long occupiedSeats = ((Number) stats[2]).longValue();
        Long availableSeats = ((Number) stats[3]).longValue();
        
        Double occupancyRate = activeSeats > 0 ? (double) occupiedSeats / activeSeats * 100 : 0.0;
        Double utilizationRate = totalSeats > 0 ? (double) activeSeats / totalSeats * 100 : 0.0;
        
        return SeatStatsResponse.builder()
                .totalSeats(totalSeats)
                .activeSeats(activeSeats)
                .occupiedSeats(occupiedSeats)
                .availableSeats(availableSeats)
                .occupancyRate(Math.round(occupancyRate * 100.0) / 100.0) // 소수점 2자리
                .utilizationRate(Math.round(utilizationRate * 100.0) / 100.0) // 소수점 2자리
                .build();
    }
} 
