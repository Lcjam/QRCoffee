package com.qrcoffee.backend.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@Slf4j
public class QRCodeUtil {
    
    /**
     * 고유한 QR코드 UUID 생성
     */
    public String generateQRCode() {
        return UUID.randomUUID().toString();
    }
    
    /**
     * QR코드 유효성 검증
     */
    public boolean isValidQRCode(String qrCode) {
        if (qrCode == null || qrCode.trim().isEmpty()) {
            return false;
        }
        
        // UUID 형태인지 확인
        try {
            UUID.fromString(qrCode);
            return true;
        } catch (IllegalArgumentException e) {
            // 짧은 형태 QR코드인지 확인 (8자리 영숫자)
            return qrCode.matches("^[A-Z0-9]{8}$");
        }
    }
    
    /**
     * QR코드에서 좌석 ID 추출
     */
    public String extractSeatCodeFromUrl(String url) {
        if (url == null || !url.contains("seat=")) {
            return null;
        }
        
        try {
            String[] parts = url.split("seat=");
            if (parts.length > 1) {
                String seatCode = parts[1];
                // 다른 파라미터가 있을 경우 제거
                if (seatCode.contains("&")) {
                    seatCode = seatCode.split("&")[0];
                }
                return seatCode;
            }
        } catch (Exception e) {
            log.error("QR코드 URL 파싱 에러: {}", url, e);
        }
        
        return null;
    }
    
    /**
     * QR코드 생성 로그
     */
    public void logQRCodeGeneration(String qrCode, Long seatId, String seatNumber) {
        log.info("QR코드 생성 - 좌석ID: {}, 좌석번호: {}, QR코드: {}", seatId, seatNumber, qrCode);
    }
    
    /**
     * QR코드 스캔 로그
     */
    public void logQRCodeScan(String qrCode, String userAgent, String ipAddress) {
        log.info("QR코드 스캔 - QR코드: {}, UserAgent: {}, IP: {}", qrCode, userAgent, ipAddress);
    }
    
    /**
     * QR코드 이미지 URL 생성 (실제 구현은 추후 추가)
     * 현재는 플레이스홀더 URL 반환
     */
    public String generateQRCodeImage(String qrCode) {
        // TODO: 실제 QR코드 이미지 생성 및 저장 로직 구현
        // 현재는 플레이스홀더 URL 반환
        return String.format("https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=%s", qrCode);
    }
} 
