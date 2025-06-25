package com.qrcoffee.backend.controller;

import com.qrcoffee.backend.common.ApiResponse;
import com.qrcoffee.backend.dto.SeatResponse;
import com.qrcoffee.backend.service.SeatService;
import com.qrcoffee.backend.util.QRCodeUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/seats")
@RequiredArgsConstructor
@Slf4j
public class PublicSeatController {
    
    private final SeatService seatService;
    private final QRCodeUtil qrCodeUtil;
    
    /**
     * QR코드로 좌석 정보 조회 (고객용)
     * 인증 없이 접근 가능
     */
    @GetMapping("/qr/{qrCode}")
    public ResponseEntity<ApiResponse<SeatResponse>> getSeatByQRCode(
            @PathVariable String qrCode,
            HttpServletRequest request) {
        
        // QR코드 스캔 로그 기록
        String userAgent = request.getHeader("User-Agent");
        String ipAddress = getClientIpAddress(request);
        qrCodeUtil.logQRCodeScan(qrCode, userAgent, ipAddress);
        
        log.info("QR코드 접근: qrCode={}, IP={}", qrCode, ipAddress);
        
        SeatResponse seat = seatService.getActiveSeatByQRCode(qrCode);
        return ResponseEntity.ok(ApiResponse.success("좌석 정보를 조회했습니다.", seat));
    }
    
    /**
     * QR코드 유효성 검증 (고객용)
     */
    @GetMapping("/validate/{qrCode}")
    public ResponseEntity<ApiResponse<Boolean>> validateQRCode(@PathVariable String qrCode) {
        log.info("QR코드 유효성 검증: qrCode={}", qrCode);
        
        boolean isValid = seatService.validateQRCode(qrCode);
        String message = isValid ? "유효한 QR코드입니다." : "유효하지 않은 QR코드입니다.";
        
        return ResponseEntity.ok(ApiResponse.success(message, isValid));
    }
    
    /**
     * QR코드 URL에서 좌석 정보 조회
     */
    @GetMapping("/qr-url")
    public ResponseEntity<ApiResponse<SeatResponse>> getSeatByQRUrl(
            @RequestParam String url,
            HttpServletRequest request) {
        
        log.info("QR코드 URL 접근: url={}", url);
        
        String qrCode = qrCodeUtil.extractSeatCodeFromUrl(url);
        if (qrCode == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("유효하지 않은 QR코드 URL입니다."));
        }
        
        // QR코드 스캔 로그 기록
        String userAgent = request.getHeader("User-Agent");
        String ipAddress = getClientIpAddress(request);
        qrCodeUtil.logQRCodeScan(qrCode, userAgent, ipAddress);
        
        SeatResponse seat = seatService.getActiveSeatByQRCode(qrCode);
        return ResponseEntity.ok(ApiResponse.success("좌석 정보를 조회했습니다.", seat));
    }
    
    /**
     * 좌석 점유 상태 확인 (고객용)
     */
    @GetMapping("/{qrCode}/status")
    public ResponseEntity<ApiResponse<String>> getSeatStatus(@PathVariable String qrCode) {
        log.info("좌석 상태 확인: qrCode={}", qrCode);
        
        try {
            SeatResponse seat = seatService.getActiveSeatByQRCode(qrCode);
            String status = seat.getIsOccupied() ? "사용중" : "사용가능";
            return ResponseEntity.ok(ApiResponse.success("좌석 상태를 조회했습니다.", status));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("좌석 상태를 확인할 수 없습니다."));
        }
    }
    
    /**
     * 매장별 사용 가능한 좌석 목록 조회 (고객용)
     */
    @GetMapping("/store/{storeId}/available")
    public ResponseEntity<ApiResponse<List<SeatResponse>>> getAvailableSeats(@PathVariable Long storeId) {
        log.info("매장 사용 가능 좌석 조회: storeId={}", storeId);
        
        List<SeatResponse> availableSeats = seatService.getAvailableSeats(storeId);
        return ResponseEntity.ok(ApiResponse.success("사용 가능한 좌석 목록을 조회했습니다.", availableSeats));
    }
    
    /**
     * 매장별 활성 좌석 목록 조회 (고객용)
     */
    @GetMapping("/store/{storeId}/active")
    public ResponseEntity<ApiResponse<List<SeatResponse>>> getActiveSeats(@PathVariable Long storeId) {
        log.info("매장 활성 좌석 조회: storeId={}", storeId);
        
        List<SeatResponse> activeSeats = seatService.getActiveSeats(storeId);
        return ResponseEntity.ok(ApiResponse.success("활성 좌석 목록을 조회했습니다.", activeSeats));
    }
    
    /**
     * 클라이언트 IP 주소 추출
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
} 