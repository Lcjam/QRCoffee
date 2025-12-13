package com.qrcoffee.backend.util;

import com.qrcoffee.backend.entity.Seat;
import com.qrcoffee.backend.entity.Store;
import com.qrcoffee.backend.entity.User;
import com.qrcoffee.backend.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/**
 * 공통 검증 로직을 담당하는 유틸리티 클래스
 */
@Slf4j
@Component
public class ValidationUtils {

    /**
     * 이메일 중복 검증
     */
    public static void validateEmailNotDuplicate(String email, boolean exists) {
        if (exists) {
            log.warn("이메일 중복 시도: {}", email);
            throw new BusinessException("이미 사용중인 이메일입니다.", HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * 사용자 활성화 상태 검증
     */
    public static void validateUserActive(User user) {
        if (!user.getIsActive()) {
            log.warn("비활성화된 계정 접근 시도: {}", user.getEmail());
            throw new BusinessException("비활성화된 계정입니다.", HttpStatus.UNAUTHORIZED);
        }
    }

    /**
     * 매장 활성화 상태 검증
     */
    public static void validateStoreActive(Store store) {
        if (store != null && !store.getIsActive()) {
            log.warn("비활성화된 매장 접근 시도: {}", store.getName());
            throw new BusinessException("비활성화된 매장입니다.", HttpStatus.UNAUTHORIZED);
        }
    }

    /**
     * 마스터 권한 검증
     */
    public static void validateMasterRole(User user) {
        if (!User.Role.MASTER.equals(user.getRole())) {
            log.warn("마스터 권한 필요한 작업에 일반 사용자 접근: {}", user.getEmail());
            throw new BusinessException("마스터 계정만 이 작업을 수행할 수 있습니다.", HttpStatus.FORBIDDEN);
        }
    }

    /**
     * 매장 소유권 검증
     */
    public static void validateStoreOwnership(User owner, User target) {
        if (owner.getStoreId() == null) {
            log.warn("매장이 없는 사용자의 매장 관리 시도: {}", owner.getEmail());
            throw new BusinessException("매장 정보가 없습니다.", HttpStatus.BAD_REQUEST);
        }

        if (target.getStoreId() == null) {
            log.warn("매장이 없는 대상 사용자: {}", target.getEmail());
            throw new BusinessException("대상 사용자의 매장 정보가 없습니다.", HttpStatus.BAD_REQUEST);
        }

        if (!owner.getStoreId().equals(target.getStoreId())) {
            log.warn("다른 매장 사용자 관리 시도: {} -> {}", owner.getEmail(), target.getEmail());
            throw new BusinessException("같은 매장의 사용자만 관리할 수 있습니다.", HttpStatus.FORBIDDEN);
        }
    }

    /**
     * 자기 자신 비활성화 방지
     */
    public static void validateNotSelfDeactivation(Long requesterId, Long targetId) {
        if (requesterId.equals(targetId)) {
            log.warn("자기 자신 비활성화 시도: userId={}", requesterId);
            throw new BusinessException("자기 자신의 계정은 비활성화할 수 없습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * 비밀번호 일치 검증
     */
    public static void validatePasswordMatch(String rawPassword, String encodedPassword, 
                                           java.util.function.Function<String, Boolean> passwordMatcher) {
        if (!passwordMatcher.apply(rawPassword)) {
            log.warn("비밀번호 불일치");
            throw new BusinessException("잘못된 이메일 또는 비밀번호입니다.", HttpStatus.UNAUTHORIZED);
        }
    }

    /**
     * 사용자 존재 검증
     */
    public static void validateUserExists(User user, String email) {
        if (user == null) {
            log.warn("존재하지 않는 사용자 조회 시도: {}", email);
            throw new BusinessException("잘못된 이메일 또는 비밀번호입니다.", HttpStatus.UNAUTHORIZED);
        }
    }

    /**
     * 매장 존재 및 활성화 검증
     */
    public static void validateStoreExistsAndActive(Store store, Long storeId) {
        if (store == null) {
            log.warn("존재하지 않는 매장 조회: storeId={}", storeId);
            throw new BusinessException("존재하지 않는 매장입니다.", HttpStatus.BAD_REQUEST);
        }
        validateStoreActive(store);
    }

    /**
     * 복합 권한 검증 (마스터 + 매장 소유권)
     */
    public static void validateMasterAndStoreOwnership(User requester, User target) {
        validateMasterRole(requester);
        validateStoreOwnership(requester, target);
    }

    /**
     * 사용자 관리 권한 종합 검증
     */
    public static void validateUserManagementPermission(User requester, User target, Long targetId) {
        validateMasterAndStoreOwnership(requester, target);
        validateNotSelfDeactivation(requester.getId(), targetId);
    }

    // ============ 좌석 관련 검증 메서드들 ============

    /**
     * 좌석 존재 검증
     */
    public static void validateSeatExists(Seat seat, Long seatId) {
        if (seat == null) {
            log.warn("존재하지 않는 좌석 조회: seatId={}", seatId);
            throw new BusinessException("좌석을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
        }
    }

    /**
     * 좌석 매장 소유권 검증
     */
    public static void validateSeatStoreOwnership(Seat seat, Long storeId) {
        if (!seat.getStoreId().equals(storeId)) {
            log.warn("다른 매장 좌석 접근 시도: seatId={}, requestStoreId={}, actualStoreId={}", 
                    seat.getId(), storeId, seat.getStoreId());
            throw new BusinessException("해당 매장의 좌석이 아닙니다.", HttpStatus.FORBIDDEN);
        }
    }

    /**
     * 좌석 존재 및 매장 소유권 종합 검증
     */
    public static void validateSeatExistsAndOwnership(Seat seat, Long seatId, Long storeId) {
        validateSeatExists(seat, seatId);
        validateSeatStoreOwnership(seat, storeId);
    }

    /**
     * 좌석번호 중복 검증 (생성 시)
     */
    public static void validateSeatNumberNotDuplicate(boolean exists, String seatNumber, Long storeId) {
        if (exists) {
            log.warn("좌석번호 중복 시도: storeId={}, seatNumber={}", storeId, seatNumber);
            throw new BusinessException("이미 존재하는 좌석번호입니다.", HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * 좌석번호 중복 검증 (수정 시, 자기 자신 제외)
     */
    public static void validateSeatNumberNotDuplicateForUpdate(boolean exists, String seatNumber, Long storeId, Long seatId) {
        if (exists) {
            log.warn("좌석번호 중복 시도 (수정): storeId={}, seatNumber={}, excludeSeatId={}", storeId, seatNumber, seatId);
            throw new BusinessException("이미 존재하는 좌석번호입니다.", HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * QR코드 유효성 검증
     */
    public static void validateQRCodeFormat(String qrCode, java.util.function.Function<String, Boolean> qrCodeValidator) {
        if (!qrCodeValidator.apply(qrCode)) {
            log.warn("유효하지 않은 QR코드 형식: {}", qrCode);
            throw new BusinessException("유효하지 않은 QR코드입니다.", HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * QR코드로 좌석 존재 검증
     */
    public static void validateSeatExistsByQRCode(Seat seat, String qrCode) {
        if (seat == null) {
            log.warn("QR코드에 해당하는 좌석 없음: {}", qrCode);
            throw new BusinessException("QR코드에 해당하는 좌석을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
        }
    }

    /**
     * 활성 좌석 QR코드 검증
     */
    public static void validateActiveSeatByQRCode(Seat seat, String qrCode) {
        if (seat == null) {
            log.warn("활성화되지 않은 좌석 QR코드 접근: {}", qrCode);
            throw new BusinessException("사용할 수 없는 좌석입니다.", HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * QR코드 생성 실패 검증
     */
    public static void validateQRCodeGeneration(int attempts, int maxAttempts) {
        if (attempts > maxAttempts) {
            log.error("QR코드 생성 실패: 최대 시도 횟수 초과 ({}회)", attempts);
            throw new BusinessException("QR코드 생성에 실패했습니다. 다시 시도해주세요.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 