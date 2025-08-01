package com.qrcoffee.backend.repository;

import com.qrcoffee.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * 이메일로 사용자 조회
     */
    Optional<User> findByEmail(String email);
    
    /**
     * 이메일 존재 여부 확인
     */
    boolean existsByEmail(String email);
    
    /**
     * 매장별 활성 사용자 조회
     */
    List<User> findByStore_IdAndIsActive(Long storeId, Boolean isActive);
    
    /**
     * 매장별 마스터 계정 조회
     */
    @Query("SELECT u FROM User u WHERE u.store.id = :storeId AND u.role = 'MASTER' AND u.isActive = true")
    Optional<User> findMasterByStoreId(@Param("storeId") Long storeId);
    
    /**
     * 매장별 직원 계정 조회
     */
    @Query("SELECT u FROM User u WHERE u.store.id = :storeId AND u.role = 'STAFF' AND u.isActive = true")
    List<User> findStaffByStoreId(@Param("storeId") Long storeId);
    
    /**
     * 활성 상태인 사용자만 조회
     */
    List<User> findByIsActive(Boolean isActive);
} 