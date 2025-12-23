package com.qrcoffee.backend.repository;

import com.qrcoffee.backend.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {
    
    /**
     * 활성 매장 조회
     */
    List<Store> findByIsActive(Boolean isActive);
    
    /**
     * ID와 활성 상태로 매장 조회
     */
    Optional<Store> findByIdAndIsActive(Long id, Boolean isActive);
} 