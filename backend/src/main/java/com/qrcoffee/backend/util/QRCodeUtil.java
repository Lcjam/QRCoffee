package com.qrcoffee.backend.util;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.UUID;
import java.security.SecureRandom;

@Component
@Slf4j
public class QRCodeUtil {
    
    private static final SecureRandom random = new SecureRandom();
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    /**
     * 고유한 QR코드 UUID 생성
     */
    public String generateQRCode() {
        return UUID.randomUUID().toString();
    }
    
    /**
     * 짧은 형태의 QR코드 생성 (8자리 영숫자)
     */
    public String generateShortQRCode() {
        StringBuilder sb = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
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
     * QR코드 URL 생성
     * 예: https://yourdomain.com/order?seat=UUID
     */
    public String generateQRCodeUrl(String qrCode, String baseUrl) {
        if (baseUrl == null || baseUrl.trim().isEmpty()) {
            baseUrl = "http://localhost:3000"; // 기본 프론트엔드 URL
        }
        
        // 마지막 슬래시 제거
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        
        return String.format("%s/order?seat=%s", baseUrl, qrCode);
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
     * QR코드 이미지 생성 (Base64 인코딩)
     */
    public String generateQRCodeImage(String qrCode) {
        try {
            // QR코드 URL 생성
            String qrUrl = generateQRCodeUrl(qrCode, frontendUrl);
            
            // QR코드 생성
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(qrUrl, BarcodeFormat.QR_CODE, 300, 300);
            
            // 이미지 생성
            BufferedImage image = createQRCodeImage(bitMatrix);
            
            // Base64 인코딩
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ImageIO.write(image, "PNG", outputStream);
            byte[] imageBytes = outputStream.toByteArray();
            
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            
            log.info("QR코드 이미지 생성 완료: {}", qrCode);
            return "data:image/png;base64," + base64Image;
            
        } catch (WriterException | IOException e) {
            log.error("QR코드 이미지 생성 실패: {}", qrCode, e);
            return null;
        }
    }
    
    /**
     * QR코드 BitMatrix를 BufferedImage로 변환
     */
    private BufferedImage createQRCodeImage(BitMatrix bitMatrix) {
        int width = bitMatrix.getWidth();
        int height = bitMatrix.getHeight();
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        
        for (int x = 0; x < width; x++) {
            for (int y = 0; y < height; y++) {
                image.setRGB(x, y, bitMatrix.get(x, y) ? Color.BLACK.getRGB() : Color.WHITE.getRGB());
            }
        }
        
        return image;
    }
    
    /**
     * 고객용 QR코드 URL 생성 (주문 페이지로 이동)
     */
    public String generateCustomerOrderUrl(String qrCode) {
        return String.format("%s/order/%s", frontendUrl, qrCode);
    }
} 