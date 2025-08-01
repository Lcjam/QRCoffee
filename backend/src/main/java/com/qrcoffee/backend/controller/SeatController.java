package com.qrcoffee.backend.controller;

import com.qrcoffee.backend.common.ApiResponse;
import com.qrcoffee.backend.dto.SeatRequest;
import com.qrcoffee.backend.dto.SeatResponse;
import com.qrcoffee.backend.dto.SeatStatsResponse;
import com.qrcoffee.backend.service.SeatService;
import com.qrcoffee.backend.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
@Slf4j
public class SeatController {
    
    private final SeatService seatService;
    private final JwtUtil jwtUtil;
    
    /**
     * 매장의 모든 좌석 조회
     */
    @GetMapping
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<List<SeatResponse>>> getAllSeats(HttpServletRequest request) {
        Long storeId = jwtUtil.getStoreIdFromRequest(request);
        List<SeatResponse> seats = seatService.getAllSeats(storeId);
        return ResponseEntity.ok(ApiResponse.success("좌석 목록을 조회했습니다.", seats));
    }
    
    /**
     * 매장의 활성 좌석만 조회
     */
    @GetMapping("/active")
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<List<SeatResponse>>> getActiveSeats(HttpServletRequest request) {
        Long storeId = jwtUtil.getStoreIdFromRequest(request);
        List<SeatResponse> seats = seatService.getActiveSeats(storeId);
        return ResponseEntity.ok(ApiResponse.success("활성 좌석 목록을 조회했습니다.", seats));
    }
    
    /**
     * 매장의 사용 가능한 좌석 조회
     */
    @GetMapping("/available")
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<List<SeatResponse>>> getAvailableSeats(HttpServletRequest request) {
        Long storeId = jwtUtil.getStoreIdFromRequest(request);
        List<SeatResponse> seats = seatService.getAvailableSeats(storeId);
        return ResponseEntity.ok(ApiResponse.success("사용 가능한 좌석 목록을 조회했습니다.", seats));
    }
    
    /**
     * 좌석 상세 조회
     */
    @GetMapping("/{seatId}")
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<SeatResponse>> getSeatById(
            @PathVariable Long seatId,
            HttpServletRequest request) {
        Long storeId = jwtUtil.getStoreIdFromRequest(request);
        SeatResponse seat = seatService.getSeatById(seatId, storeId);
        return ResponseEntity.ok(ApiResponse.success("좌석 정보를 조회했습니다.", seat));
    }
    
    /**
     * 좌석 생성
     */
    @PostMapping
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<ApiResponse<SeatResponse>> createSeat(
            @Valid @RequestBody SeatRequest request,
            HttpServletRequest httpRequest) {
        Long storeId = jwtUtil.getStoreIdFromRequest(httpRequest);
        SeatResponse seat = seatService.createSeat(storeId, request);
        return ResponseEntity.ok(ApiResponse.success("좌석이 생성되었습니다.", seat));
    }
    
    /**
     * 좌석 수정
     */
    @PutMapping("/{seatId}")
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<ApiResponse<SeatResponse>> updateSeat(
            @PathVariable Long seatId,
            @Valid @RequestBody SeatRequest request,
            HttpServletRequest httpRequest) {
        Long storeId = jwtUtil.getStoreIdFromRequest(httpRequest);
        SeatResponse seat = seatService.updateSeat(seatId, storeId, request);
        return ResponseEntity.ok(ApiResponse.success("좌석이 수정되었습니다.", seat));
    }
    
    /**
     * 좌석 삭제
     */
    @DeleteMapping("/{seatId}")
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<ApiResponse<Void>> deleteSeat(
            @PathVariable Long seatId,
            HttpServletRequest request) {
        Long storeId = jwtUtil.getStoreIdFromRequest(request);
        seatService.deleteSeat(seatId, storeId);
        return ResponseEntity.ok(ApiResponse.success("좌석이 삭제되었습니다."));
    }
    
    /**
     * 좌석 활성/비활성 토글
     */
    @PatchMapping("/{seatId}/toggle-status")
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<SeatResponse>> toggleSeatStatus(
            @PathVariable Long seatId,
            HttpServletRequest request) {
        Long storeId = jwtUtil.getStoreIdFromRequest(request);
        SeatResponse seat = seatService.toggleSeatStatus(seatId, storeId);
        return ResponseEntity.ok(ApiResponse.success("좌석 상태가 변경되었습니다.", seat));
    }
    

    
    /**
     * QR코드 재생성
     */
    @PatchMapping("/{seatId}/regenerate-qr")
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<ApiResponse<SeatResponse>> regenerateQRCode(
            @PathVariable Long seatId,
            HttpServletRequest request) {
        Long storeId = jwtUtil.getStoreIdFromRequest(request);
        SeatResponse seat = seatService.regenerateQRCode(seatId, storeId);
        return ResponseEntity.ok(ApiResponse.success("QR코드가 재생성되었습니다.", seat));
    }
    
    /**
     * 좌석 통계 조회
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<SeatStatsResponse>> getSeatStats(HttpServletRequest request) {
        Long storeId = jwtUtil.getStoreIdFromRequest(request);
        SeatStatsResponse stats = seatService.getSeatStats(storeId);
        return ResponseEntity.ok(ApiResponse.success("좌석 통계를 조회했습니다.", stats));
    }
    
    /**
     * 모든 좌석의 QR코드 이미지 업데이트
     */
    @PatchMapping("/update-qr-images")
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<ApiResponse<List<SeatResponse>>> updateAllQRCodeImages(HttpServletRequest request) {
        Long storeId = jwtUtil.getStoreIdFromRequest(request);
        List<SeatResponse> seats = seatService.updateAllQRCodeImages(storeId);
        return ResponseEntity.ok(ApiResponse.success("모든 좌석의 QR코드 이미지가 업데이트되었습니다.", seats));
    }
} 