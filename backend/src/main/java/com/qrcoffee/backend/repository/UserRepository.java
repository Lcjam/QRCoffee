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
    List<User> findByStoreIdAndIsActive(Long storeId, Boolean isActive);
    
    /**
     * 서브계정 조회 (특정 마스터 계정의)
     */
    List<User> findByParentUserIdAndIsActive(Long parentUserId, Boolean isActive);
} 