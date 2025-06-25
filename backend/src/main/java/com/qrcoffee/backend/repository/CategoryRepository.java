package com.qrcoffee.backend.repository;

import com.qrcoffee.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    /**
     * 매장별 활성 카테고리 조회 (진열 순서대로)
     */
    List<Category> findByStoreIdAndIsActiveOrderByDisplayOrderAsc(Long storeId, Boolean isActive);
    
    /**
     * 매장별 모든 카테고리 조회 (진열 순서대로)
     */
    List<Category> findByStoreIdOrderByDisplayOrderAsc(Long storeId);
    
    /**
     * 매장별 카테고리 ID로 조회
     */
    Optional<Category> findByIdAndStoreId(Long id, Long storeId);
    
    /**
     * 매장별 카테고리명 중복 검사
     */
    boolean existsByStoreIdAndNameAndIdNot(Long storeId, String name, Long id);
    
    /**
     * 매장별 카테고리명 중복 검사 (신규 생성시)
     */
    boolean existsByStoreIdAndName(Long storeId, String name);
} 