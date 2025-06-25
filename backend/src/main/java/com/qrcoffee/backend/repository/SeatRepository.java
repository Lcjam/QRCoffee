package com.qrcoffee.backend.repository;

import com.qrcoffee.backend.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    
    // 매장별 좌석 조회
    List<Seat> findByStoreIdOrderBySeatNumberAsc(Long storeId);
    
    // 매장별 활성 좌석만 조회
    List<Seat> findByStoreIdAndIsActiveTrueOrderBySeatNumberAsc(Long storeId);
    
    // 매장별 사용 가능한 좌석 조회 (활성화되고 점유되지 않은 좌석)
    List<Seat> findByStoreIdAndIsActiveTrueAndIsOccupiedFalseOrderBySeatNumberAsc(Long storeId);
    
    // QR코드로 좌석 조회
    Optional<Seat> findByQrCode(String qrCode);
    
    // QR코드로 활성 좌석 조회
    Optional<Seat> findByQrCodeAndIsActiveTrue(String qrCode);
    
    // 매장과 좌석번호로 조회 (중복 체크용)
    Optional<Seat> findByStoreIdAndSeatNumber(Long storeId, String seatNumber);
    
    // 매장과 좌석번호로 조회 (수정 시 중복 체크용 - 자기 자신 제외)
    Optional<Seat> findByStoreIdAndSeatNumberAndIdNot(Long storeId, String seatNumber, Long id);
    
    // QR코드 중복 체크
    boolean existsByQrCode(String qrCode);
    
    // 매장의 총 좌석 수
    long countByStoreId(Long storeId);
    
    // 매장의 활성 좌석 수
    long countByStoreIdAndIsActiveTrue(Long storeId);
    
    // 매장의 사용 중인 좌석 수
    long countByStoreIdAndIsActiveTrueAndIsOccupiedTrue(Long storeId);
    
    // 매장의 사용 가능한 좌석 수
    @Query("SELECT COUNT(s) FROM Seat s WHERE s.storeId = :storeId AND s.isActive = true AND s.isOccupied = false")
    long countAvailableSeats(@Param("storeId") Long storeId);
    
    // 좌석별 통계 정보 (사용률 등을 위한 쿼리)
    @Query("SELECT s FROM Seat s WHERE s.storeId = :storeId ORDER BY s.lastUsedAt DESC NULLS LAST, s.seatNumber ASC")
    List<Seat> findByStoreIdOrderByLastUsedDesc(@Param("storeId") Long storeId);
    
    // 특정 기간 내 사용된 좌석들
    @Query("SELECT s FROM Seat s WHERE s.storeId = :storeId AND s.lastUsedAt >= :fromDate ORDER BY s.lastUsedAt DESC")
    List<Seat> findRecentlyUsedSeats(@Param("storeId") Long storeId, @Param("fromDate") java.time.LocalDateTime fromDate);
    
    // 매장별 좌석 상태 요약
    @Query("""
        SELECT 
            COUNT(s) as totalSeats,
            SUM(CASE WHEN s.isActive = true THEN 1 ELSE 0 END) as activeSeats,
            SUM(CASE WHEN s.isActive = true AND s.isOccupied = true THEN 1 ELSE 0 END) as occupiedSeats,
            SUM(CASE WHEN s.isActive = true AND s.isOccupied = false THEN 1 ELSE 0 END) as availableSeats
        FROM Seat s 
        WHERE s.storeId = :storeId
        """)
    Object[] getSeatStatsByStoreId(@Param("storeId") Long storeId);
} 