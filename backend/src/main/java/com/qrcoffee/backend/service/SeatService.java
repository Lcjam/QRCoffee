package com.qrcoffee.backend.service;

import com.qrcoffee.backend.dto.SeatRequest;
import com.qrcoffee.backend.dto.SeatResponse;
import com.qrcoffee.backend.dto.SeatStatsResponse;
import com.qrcoffee.backend.entity.Seat;
import com.qrcoffee.backend.exception.BusinessException;
import com.qrcoffee.backend.repository.SeatRepository;
import com.qrcoffee.backend.util.QRCodeUtil;
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
    
    private final SeatRepository seatRepository;
    private final QRCodeUtil qrCodeUtil;
    
    /**
     * 매장의 모든 좌석 조회
     */
    public List<SeatResponse> getAllSeats(Long storeId) {
        log.info("매장 좌석 목록 조회: storeId={}", storeId);
        
        List<Seat> seats = seatRepository.findByStoreIdOrderBySeatNumberAsc(storeId);
        return seats.stream()
                .map(SeatResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 매장의 활성 좌석만 조회
     */
    public List<SeatResponse> getActiveSeats(Long storeId) {
        log.info("매장 활성 좌석 조회: storeId={}", storeId);
        
        List<Seat> seats = seatRepository.findByStoreIdAndIsActiveTrueOrderBySeatNumberAsc(storeId);
        return seats.stream()
                .map(SeatResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 매장의 사용 가능한 좌석 조회
     */
    public List<SeatResponse> getAvailableSeats(Long storeId) {
        log.info("매장 사용 가능한 좌석 조회: storeId={}", storeId);
        
        List<Seat> seats = seatRepository.findByStoreIdAndIsActiveTrueAndIsOccupiedFalseOrderBySeatNumberAsc(storeId);
        return seats.stream()
                .map(SeatResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 좌석 상세 조회
     */
    public SeatResponse getSeatById(Long seatId, Long storeId) {
        log.info("좌석 상세 조회: seatId={}, storeId={}", seatId, storeId);
        
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new BusinessException("좌석을 찾을 수 없습니다."));
        
        if (!seat.getStoreId().equals(storeId)) {
            throw new BusinessException("해당 매장의 좌석이 아닙니다.");
        }
        
        return SeatResponse.from(seat);
    }
    
    /**
     * QR코드로 좌석 조회
     */
    public SeatResponse getSeatByQRCode(String qrCode) {
        log.info("QR코드로 좌석 조회: qrCode={}", qrCode);
        
        if (!qrCodeUtil.isValidQRCode(qrCode)) {
            throw new BusinessException("유효하지 않은 QR코드입니다.");
        }
        
        Seat seat = seatRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new BusinessException("QR코드에 해당하는 좌석을 찾을 수 없습니다."));
        
        return SeatResponse.from(seat);
    }
    
    /**
     * QR코드로 활성 좌석 조회 (고객용)
     */
    public SeatResponse getActiveSeatByQRCode(String qrCode) {
        log.info("QR코드로 활성 좌석 조회: qrCode={}", qrCode);
        
        if (!qrCodeUtil.isValidQRCode(qrCode)) {
            throw new BusinessException("유효하지 않은 QR코드입니다.");
        }
        
        Seat seat = seatRepository.findByQrCodeAndIsActiveTrue(qrCode)
                .orElseThrow(() -> new BusinessException("사용할 수 없는 좌석입니다."));
        
        return SeatResponse.from(seat);
    }
    
    /**
     * 좌석 생성
     */
    @Transactional
    public SeatResponse createSeat(Long storeId, SeatRequest request) {
        log.info("좌석 생성: storeId={}, seatNumber={}", storeId, request.getSeatNumber());
        
        // 좌석번호 중복 체크
        if (seatRepository.findByStoreIdAndSeatNumber(storeId, request.getSeatNumber()).isPresent()) {
            throw new BusinessException("이미 존재하는 좌석번호입니다.");
        }
        
        // 고유한 QR코드 생성
        String qrCode = generateUniqueQRCode();
        
        Seat seat = Seat.builder()
                .storeId(storeId)
                .seatNumber(request.getSeatNumber())
                .description(request.getDescription())
                .qrCode(qrCode)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .isOccupied(false)
                .maxCapacity(request.getMaxCapacity() != null ? request.getMaxCapacity() : 4)
                .qrCodeImageUrl(request.getQrCodeImageUrl())
                .qrGeneratedAt(LocalDateTime.now())
                .build();
        
        seat = seatRepository.save(seat);
        qrCodeUtil.logQRCodeGeneration(qrCode, seat.getId(), seat.getSeatNumber());
        
        log.info("좌석 생성 완료: seatId={}, qrCode={}", seat.getId(), qrCode);
        return SeatResponse.from(seat);
    }
    
    /**
     * 좌석 수정
     */
    @Transactional
    public SeatResponse updateSeat(Long seatId, Long storeId, SeatRequest request) {
        log.info("좌석 수정: seatId={}, storeId={}", seatId, storeId);
        
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new BusinessException("좌석을 찾을 수 없습니다."));
        
        if (!seat.getStoreId().equals(storeId)) {
            throw new BusinessException("해당 매장의 좌석이 아닙니다.");
        }
        
        // 좌석번호 중복 체크 (자기 자신 제외)
        if (seatRepository.findByStoreIdAndSeatNumberAndIdNot(storeId, request.getSeatNumber(), seatId).isPresent()) {
            throw new BusinessException("이미 존재하는 좌석번호입니다.");
        }
        
        // 좌석 정보 업데이트
        seat.setSeatNumber(request.getSeatNumber());
        seat.setDescription(request.getDescription());
        seat.setMaxCapacity(request.getMaxCapacity() != null ? request.getMaxCapacity() : seat.getMaxCapacity());
        seat.setQrCodeImageUrl(request.getQrCodeImageUrl());
        
        // 활성 상태 변경 시 점유 상태도 관리
        if (request.getIsActive() != null && !request.getIsActive()) {
            seat.deactivate();
        } else if (request.getIsActive() != null && request.getIsActive()) {
            seat.activate();
        }
        
        seat = seatRepository.save(seat);
        log.info("좌석 수정 완료: seatId={}", seatId);
        return SeatResponse.from(seat);
    }
    
    /**
     * 좌석 삭제
     */
    @Transactional
    public void deleteSeat(Long seatId, Long storeId) {
        log.info("좌석 삭제: seatId={}, storeId={}", seatId, storeId);
        
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new BusinessException("좌석을 찾을 수 없습니다."));
        
        if (!seat.getStoreId().equals(storeId)) {
            throw new BusinessException("해당 매장의 좌석이 아닙니다.");
        }
        
        if (seat.getIsOccupied()) {
            throw new BusinessException("사용 중인 좌석은 삭제할 수 없습니다.");
        }
        
        seatRepository.delete(seat);
        log.info("좌석 삭제 완료: seatId={}", seatId);
    }
    
    /**
     * 좌석 활성/비활성 토글
     */
    @Transactional
    public SeatResponse toggleSeatStatus(Long seatId, Long storeId) {
        log.info("좌석 상태 변경: seatId={}, storeId={}", seatId, storeId);
        
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new BusinessException("좌석을 찾을 수 없습니다."));
        
        if (!seat.getStoreId().equals(storeId)) {
            throw new BusinessException("해당 매장의 좌석이 아닙니다.");
        }
        
        if (seat.getIsActive()) {
            seat.deactivate();
            log.info("좌석 비활성화: seatId={}", seatId);
        } else {
            seat.activate();
            log.info("좌석 활성화: seatId={}", seatId);
        }
        
        seat = seatRepository.save(seat);
        return SeatResponse.from(seat);
    }
    
    /**
     * 좌석 점유 상태 변경
     */
    @Transactional
    public SeatResponse toggleSeatOccupancy(Long seatId, Long storeId) {
        log.info("좌석 점유 상태 변경: seatId={}, storeId={}", seatId, storeId);
        
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new BusinessException("좌석을 찾을 수 없습니다."));
        
        if (!seat.getStoreId().equals(storeId)) {
            throw new BusinessException("해당 매장의 좌석이 아닙니다.");
        }
        
        if (!seat.getIsActive()) {
            throw new BusinessException("비활성화된 좌석은 점유 상태를 변경할 수 없습니다.");
        }
        
        if (seat.getIsOccupied()) {
            seat.release();
            log.info("좌석 점유 해제: seatId={}", seatId);
        } else {
            seat.occupy();
            log.info("좌석 점유: seatId={}", seatId);
        }
        
        seat = seatRepository.save(seat);
        return SeatResponse.from(seat);
    }
    
    /**
     * QR코드 재생성
     */
    @Transactional
    public SeatResponse regenerateQRCode(Long seatId, Long storeId) {
        log.info("QR코드 재생성: seatId={}, storeId={}", seatId, storeId);
        
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new BusinessException("좌석을 찾을 수 없습니다."));
        
        if (!seat.getStoreId().equals(storeId)) {
            throw new BusinessException("해당 매장의 좌석이 아닙니다.");
        }
        
        String newQrCode = generateUniqueQRCode();
        String oldQrCode = seat.getQrCode();
        
        seat.setQrCode(newQrCode);
        seat.setQrGeneratedAt(LocalDateTime.now());
        
        seat = seatRepository.save(seat);
        qrCodeUtil.logQRCodeGeneration(newQrCode, seat.getId(), seat.getSeatNumber());
        
        log.info("QR코드 재생성 완료: seatId={}, oldQrCode={}, newQrCode={}", seatId, oldQrCode, newQrCode);
        return SeatResponse.from(seat);
    }
    
    /**
     * 좌석 통계 조회
     */
    public SeatStatsResponse getSeatStats(Long storeId) {
        log.info("좌석 통계 조회: storeId={}", storeId);
        
        // 개별 카운트 쿼리로 변경
        long totalSeats = seatRepository.countByStoreId(storeId);
        long activeSeats = seatRepository.countByStoreIdAndIsActiveTrue(storeId);
        long occupiedSeats = seatRepository.countByStoreIdAndIsActiveTrueAndIsOccupiedTrue(storeId);
        long availableSeats = seatRepository.countAvailableSeats(storeId);
        
        Double occupancyRate = activeSeats > 0 ? (double) occupiedSeats / activeSeats * 100 : 0.0;
        Double utilizationRate = totalSeats > 0 ? (double) activeSeats / totalSeats * 100 : 0.0;
        
        log.info("좌석 통계 결과: total={}, active={}, occupied={}, available={}", 
                totalSeats, activeSeats, occupiedSeats, availableSeats);
        
        return SeatStatsResponse.builder()
                .totalSeats(totalSeats)
                .activeSeats(activeSeats)
                .occupiedSeats(occupiedSeats)
                .availableSeats(availableSeats)
                .occupancyRate(Math.round(occupancyRate * 100.0) / 100.0)
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
     * 고유한 QR코드 생성 (중복 방지)
     */
    private String generateUniqueQRCode() {
        String qrCode;
        int attempts = 0;
        int maxAttempts = 100;
        
        do {
            qrCode = qrCodeUtil.generateQRCode();
            attempts++;
            
            if (attempts > maxAttempts) {
                throw new BusinessException("QR코드 생성에 실패했습니다. 다시 시도해주세요.");
            }
        } while (seatRepository.existsByQrCode(qrCode));
        
        return qrCode;
    }
} 