package com.qrcoffee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusStatsResponse {
    private long pendingCount;
    private long preparingCount;
    private long completedCount;
    private long pickedUpCount;
    private long cancelledCount;
} 