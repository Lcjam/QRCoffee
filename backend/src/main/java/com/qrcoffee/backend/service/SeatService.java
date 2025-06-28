package com.qrcoffee.backend.service;

import com.qrcoffee.backend.dto.SeatRequest;
import com.qrcoffee.backend.dto.SeatResponse;
import com.qrcoffee.backend.dto.SeatStatsResponse;
import com.qrcoffee.backend.entity.Seat;
import com.qrcoffee.backend.exception.BusinessException;
import com.qrcoffee.backend.repository.SeatRepository;
import com.qrcoffee.backend.util.QRCodeUtil;
import com.qrcoffee.backend.util.ValidationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SeatService {
    
    // 상수 정의
    private static final int DEFAULT_MAX_CAPACITY = 4;
    private static final int QR_CODE_GENERATION_MAX_ATTEMPTS = 100;
    private static final String SEAT_CREATED_MESSAGE = "좌석 생성 완료";
    private static final String SEAT_UPDATED_MESSAGE = "좌석 수정 완료";
    private static final String SEAT_DELETED_MESSAGE = "좌석 삭제 완료";
    private static final String SEAT_STATUS_CHANGED_MESSAGE = "좌석 상태 변경";
    private static final String QR_CODE_REGENERATED_MESSAGE = "QR코드 재생성 완료";
    
    private final SeatRepository seatRepository;
    private final QRCodeUtil qrCodeUtil;
    
    /**
     * 매장의 모든 좌석 조회
     */
    public List<SeatResponse> getAllSeats(Long storeId) {
        log.info("매장 좌석 목록 조회: storeId={}", storeId);
        
        List<Seat> seats = seatRepository.findByStoreIdOrderBySeatNumberAsc(storeId);
        return convertToSeatResponses(seats);
    }
    
    /**
     * 매장의 활성 좌석만 조회
     */
    public List<SeatResponse> getActiveSeats(Long storeId) {
        log.info("매장 활성 좌석 조회: storeId={}", storeId);
        
        List<Seat> seats = seatRepository.findByStoreIdAndIsActiveTrueOrderBySeatNumberAsc(storeId);
        return convertToSeatResponses(seats);
    }
    
    /**
     * 매장의 사용 가능한 좌석 조회 (활성화된 좌석)
     */
    public List<SeatResponse> getAvailableSeats(Long storeId) {
        log.info("매장 사용 가능한 좌석 조회: storeId={}", storeId);
        
        List<Seat> seats = seatRepository.findByStoreIdAndIsActiveTrueOrderBySeatNumberAsc(storeId);
        return convertToSeatResponses(seats);
    }
    
    /**
     * 좌석 상세 조회
     */
    public SeatResponse getSeatById(Long seatId, Long storeId) {
        log.info("좌석 상세 조회: seatId={}, storeId={}", seatId, storeId);
        
        Seat seat = findSeatByIdAndValidateOwnership(seatId, storeId);
        return SeatResponse.from(seat);
    }
    
    /**
     * QR코드로 좌석 조회
     */
    public SeatResponse getSeatByQRCode(String qrCode) {
        log.info("QR코드로 좌석 조회: qrCode={}", qrCode);
        
        // QR코드 형식 검증
        ValidationUtils.validateQRCodeFormat(qrCode, qrCodeUtil::isValidQRCode);
        
        // 좌석 조회 및 검증
        Seat seat = seatRepository.findByQrCode(qrCode).orElse(null);
        ValidationUtils.validateSeatExistsByQRCode(seat, qrCode);
        
        return SeatResponse.from(seat);
    }
    
    /**
     * QR코드로 활성 좌석 조회 (고객용)
     */
    public SeatResponse getActiveSeatByQRCode(String qrCode) {
        log.info("QR코드로 활성 좌석 조회: qrCode={}", qrCode);
        
        // QR코드 형식 검증
        ValidationUtils.validateQRCodeFormat(qrCode, qrCodeUtil::isValidQRCode);
        
        // 활성 좌석 조회 및 검증
        Seat seat = seatRepository.findByQrCodeAndIsActiveTrue(qrCode).orElse(null);
        ValidationUtils.validateActiveSeatByQRCode(seat, qrCode);
        
        return SeatResponse.from(seat);
    }
    
    /**
     * 좌석 생성
     */
    @Transactional
    public SeatResponse createSeat(Long storeId, SeatRequest request) {
        log.info("좌석 생성: storeId={}, seatNumber={}", storeId, request.getSeatNumber());
        
        // 좌석번호 중복 검증
        validateSeatNumberForCreate(storeId, request.getSeatNumber());
        
        // 좌석 생성
        Seat seat = buildNewSeat(storeId, request);
        Seat savedSeat = seatRepository.save(seat);
        
        // QR코드 생성 로그
        qrCodeUtil.logQRCodeGeneration(seat.getQrCode(), seat.getId(), seat.getSeatNumber());
        
        log.info("{}: seatId={}, qrCode={}", SEAT_CREATED_MESSAGE, savedSeat.getId(), seat.getQrCode());
        return SeatResponse.from(savedSeat);
    }
    
    /**
     * 좌석 수정
     */
    @Transactional
    public SeatResponse updateSeat(Long seatId, Long storeId, SeatRequest request) {
        log.info("좌석 수정: seatId={}, storeId={}", seatId, storeId);
        
        // 좌석 조회 및 검증
        Seat seat = findSeatByIdAndValidateOwnership(seatId, storeId);
        
        // 좌석번호 중복 검증 (자기 자신 제외)
        validateSeatNumberForUpdate(storeId, request.getSeatNumber(), seatId);
        
        // 좌석 정보 업데이트
        updateSeatProperties(seat, request);
        
        Seat updatedSeat = seatRepository.save(seat);
        log.info("{}: seatId={}", SEAT_UPDATED_MESSAGE, seatId);
        return SeatResponse.from(updatedSeat);
    }
    
    /**
     * 좌석 삭제
     */
    @Transactional
    public void deleteSeat(Long seatId, Long storeId) {
        log.info("좌석 삭제: seatId={}, storeId={}", seatId, storeId);
        
        // 좌석 조회 및 검증
        Seat seat = findSeatByIdAndValidateOwnership(seatId, storeId);
        
        seatRepository.delete(seat);
        log.info("{}: seatId={}", SEAT_DELETED_MESSAGE, seatId);
    }
    
    /**
     * 좌석 활성/비활성 토글
     */
    @Transactional
    public SeatResponse toggleSeatStatus(Long seatId, Long storeId) {
        log.info("좌석 상태 변경: seatId={}, storeId={}", seatId, storeId);
        
        // 좌석 조회 및 검증
        Seat seat = findSeatByIdAndValidateOwnership(seatId, storeId);
        
        // 상태 변경
        toggleSeatActivation(seat);
        
        Seat updatedSeat = seatRepository.save(seat);
        return SeatResponse.from(updatedSeat);
    }
    
    /**
     * QR코드 재생성
     */
    @Transactional
    public SeatResponse regenerateQRCode(Long seatId, Long storeId) {
        log.info("QR코드 재생성: seatId={}, storeId={}", seatId, storeId);
        
        // 좌석 조회 및 검증
        Seat seat = findSeatByIdAndValidateOwnership(seatId, storeId);
        
        // QR코드 재생성
        String oldQrCode = seat.getQrCode();
        regenerateQRCodeForSeat(seat);
        
        Seat updatedSeat = seatRepository.save(seat);
        qrCodeUtil.logQRCodeGeneration(seat.getQrCode(), seat.getId(), seat.getSeatNumber());
        
        log.info("{}: seatId={}, oldQrCode={}, newQrCode={}", 
                QR_CODE_REGENERATED_MESSAGE, seatId, oldQrCode, seat.getQrCode());
        return SeatResponse.from(updatedSeat);
    }
    
    /**
     * 좌석 통계 조회
     */
    public SeatStatsResponse getSeatStats(Long storeId) {
        log.info("좌석 통계 조회: storeId={}", storeId);
        
        long totalSeats = seatRepository.countByStoreId(storeId);
        long activeSeats = seatRepository.countByStoreIdAndIsActiveTrue(storeId);
        
        Double utilizationRate = calculateUtilizationRate(totalSeats, activeSeats);
        
        log.info("좌석 통계 결과: total={}, active={}", totalSeats, activeSeats);
        
        return SeatStatsResponse.builder()
                .totalSeats(totalSeats)
                .activeSeats(activeSeats)
                .utilizationRate(Math.round(utilizationRate * 100.0) / 100.0)
                .build();
    }
    
    /**
     * QR코드 유효성 검증
     */
    public boolean validateQRCode(String qrCode) {
        if (!qrCodeUtil.isValidQRCode(qrCode)) {
            return false;
        }
        
        return seatRepository.findByQrCodeAndIsActiveTrue(qrCode).isPresent();
    }
    
    /**
     * 모든 좌석의 QR코드 이미지 업데이트
     */
    @Transactional
    public List<SeatResponse> updateAllQRCodeImages(Long storeId) {
        log.info("모든 좌석의 QR코드 이미지 업데이트: storeId={}", storeId);
        
        List<Seat> seats = seatRepository.findByStoreIdOrderBySeatNumberAsc(storeId);
        
        seats.forEach(this::updateQRCodeImageForSeat);
        
        List<Seat> updatedSeats = seatRepository.saveAll(seats);
        
        return convertToSeatResponses(updatedSeats);
    }
    
    // ============ Private Helper Methods ============
    
    /**
     * 좌석 조회 및 매장 소유권 검증 (공통 메서드)
     */
    private Seat findSeatByIdAndValidateOwnership(Long seatId, Long storeId) {
        Seat seat = seatRepository.findById(seatId).orElse(null);
        ValidationUtils.validateSeatExistsAndOwnership(seat, seatId, storeId);
        return seat;
    }
    
    /**
     * 좌석번호 중복 검증 (생성 시)
     */
    private void validateSeatNumberForCreate(Long storeId, String seatNumber) {
        boolean exists = seatRepository.findByStoreIdAndSeatNumber(storeId, seatNumber).isPresent();
        ValidationUtils.validateSeatNumberNotDuplicate(exists, seatNumber, storeId);
    }
    
    /**
     * 좌석번호 중복 검증 (수정 시)
     */
    private void validateSeatNumberForUpdate(Long storeId, String seatNumber, Long seatId) {
        boolean exists = seatRepository.findByStoreIdAndSeatNumberAndIdNot(storeId, seatNumber, seatId).isPresent();
        ValidationUtils.validateSeatNumberNotDuplicateForUpdate(exists, seatNumber, storeId, seatId);
    }
    
    /**
     * 새 좌석 생성
     */
    private Seat buildNewSeat(Long storeId, SeatRequest request) {
        String qrCode = generateUniqueQRCode();
        String qrCodeImageUrl = qrCodeUtil.generateQRCodeImage(qrCode);
        
        return Seat.builder()
                .storeId(storeId)
                .seatNumber(request.getSeatNumber())
                .description(request.getDescription())
                .qrCode(qrCode)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .maxCapacity(request.getMaxCapacity() != null ? request.getMaxCapacity() : DEFAULT_MAX_CAPACITY)
                .qrCodeImageUrl(qrCodeImageUrl)
                .qrGeneratedAt(LocalDateTime.now())
                .build();
    }
    
    /**
     * 좌석 속성 업데이트
     */
    private void updateSeatProperties(Seat seat, SeatRequest request) {
        seat.setSeatNumber(request.getSeatNumber());
        seat.setDescription(request.getDescription());
        seat.setMaxCapacity(request.getMaxCapacity() != null ? request.getMaxCapacity() : seat.getMaxCapacity());
        seat.setQrCodeImageUrl(request.getQrCodeImageUrl());
        
        // 활성 상태 변경 시 점유 상태도 관리
        if (request.getIsActive() != null) {
            if (request.getIsActive()) {
                seat.activate();
            } else {
                seat.deactivate();
            }
        }
    }
    
    /**
     * 좌석 활성화/비활성화 토글
     */
    private void toggleSeatActivation(Seat seat) {
        if (seat.getIsActive()) {
            seat.deactivate();
            log.info("좌석 비활성화: seatId={}", seat.getId());
        } else {
            seat.activate();
            log.info("좌석 활성화: seatId={}", seat.getId());
        }
    }
    
    /**
     * 좌석의 QR코드 재생성
     */
    private void regenerateQRCodeForSeat(Seat seat) {
        String newQrCode = generateUniqueQRCode();
        String newQrCodeImageUrl = qrCodeUtil.generateQRCodeImage(newQrCode);
        
        seat.setQrCode(newQrCode);
        seat.setQrCodeImageUrl(newQrCodeImageUrl);
        seat.setQrGeneratedAt(LocalDateTime.now());
    }
    
    /**
     * 좌석의 QR코드 이미지 업데이트
     */
    private void updateQRCodeImageForSeat(Seat seat) {
        if (seat.getQrCode() != null) {
            String qrCodeImageUrl = qrCodeUtil.generateQRCodeImage(seat.getQrCode());
            seat.setQrCodeImageUrl(qrCodeImageUrl);
            log.info("좌석 QR코드 이미지 업데이트: seatId={}, seatNumber={}", seat.getId(), seat.getSeatNumber());
        }
    }
    
    /**
     * 고유한 QR코드 생성 (중복 방지)
     */
    private String generateUniqueQRCode() {
        String qrCode;
        int attempts = 0;
        
        do {
            qrCode = qrCodeUtil.generateQRCode();
            attempts++;
            ValidationUtils.validateQRCodeGeneration(attempts, QR_CODE_GENERATION_MAX_ATTEMPTS);
        } while (seatRepository.existsByQrCode(qrCode));
        
        return qrCode;
    }
    
    /**
     * 이용률 계산
     */
    private Double calculateUtilizationRate(long totalSeats, long activeSeats) {
        return totalSeats > 0 ? (double) activeSeats / totalSeats * 100 : 0.0;
    }
    
    /**
     * 좌석 목록을 응답 객체로 변환
     */
    private List<SeatResponse> convertToSeatResponses(List<Seat> seats) {
        return seats.stream()
                .map(SeatResponse::from)
                .collect(Collectors.toList());
    }
} 