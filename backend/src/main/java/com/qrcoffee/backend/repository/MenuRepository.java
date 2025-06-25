package com.qrcoffee.backend.repository;

import com.qrcoffee.backend.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {
    
    /**
     * 매장별 활성 메뉴 조회 (카테고리별, 진열 순서대로)
     */
    List<Menu> findByStoreIdAndIsAvailableOrderByCategoryIdAscDisplayOrderAsc(Long storeId, Boolean isAvailable);
    
    /**
     * 매장별 모든 메뉴 조회 (카테고리별, 진열 순서대로)
     */
    List<Menu> findByStoreIdOrderByCategoryIdAscDisplayOrderAsc(Long storeId);
    
    /**
     * 카테고리별 메뉴 조회 (진열 순서대로)
     */
    List<Menu> findByCategoryIdAndIsAvailableOrderByDisplayOrderAsc(Long categoryId, Boolean isAvailable);
    
    /**
     * 매장 및 카테고리별 메뉴 조회
     */
    List<Menu> findByStoreIdAndCategoryIdOrderByDisplayOrderAsc(Long storeId, Long categoryId);
    
    /**
     * 매장별 메뉴 ID로 조회
     */
    Optional<Menu> findByIdAndStoreId(Long id, Long storeId);
    
    /**
     * 매장별 메뉴명 중복 검사
     */
    boolean existsByStoreIdAndNameAndIdNot(Long storeId, String name, Long id);
    
    /**
     * 매장별 메뉴명 중복 검사 (신규 생성시)
     */
    boolean existsByStoreIdAndName(Long storeId, String name);
    
    /**
     * 카테고리별 메뉴 개수 조회
     */
    long countByCategoryId(Long categoryId);
    
    /**
     * 매장별 고객용 메뉴 조회 (활성 메뉴만, 카테고리 정보 포함)
     */
    @Query("SELECT m FROM Menu m WHERE m.storeId = :storeId AND m.isAvailable = true " +
           "ORDER BY m.categoryId ASC, m.displayOrder ASC")
    List<Menu> findActiveMenusForCustomer(@Param("storeId") Long storeId);
} 