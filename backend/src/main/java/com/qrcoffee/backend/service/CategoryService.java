package com.qrcoffee.backend.service;

import com.qrcoffee.backend.dto.CategoryRequest;
import com.qrcoffee.backend.dto.CategoryResponse;
import com.qrcoffee.backend.entity.Category;
import com.qrcoffee.backend.exception.BusinessException;
import com.qrcoffee.backend.repository.CategoryRepository;
import com.qrcoffee.backend.repository.MenuRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    private final MenuRepository menuRepository;
    
    /**
     * 매장별 활성 카테고리 목록 조회
     */
    public List<CategoryResponse> getActiveCategories(Long storeId) {
        List<Category> categories = categoryRepository.findByStoreIdAndIsActiveOrderByDisplayOrderAsc(storeId, true);
        return categories.stream()
                .map(CategoryResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 매장별 모든 카테고리 목록 조회 (관리자용)
     */
    public List<CategoryResponse> getAllCategories(Long storeId) {
        List<Category> categories = categoryRepository.findByStoreIdOrderByDisplayOrderAsc(storeId);
        return categories.stream()
                .map(CategoryResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 카테고리 ID로 조회
     */
    public CategoryResponse getCategoryById(Long categoryId, Long storeId) {
        Category category = categoryRepository.findByIdAndStoreId(categoryId, storeId)
                .orElseThrow(() -> new BusinessException("카테고리를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        return CategoryResponse.from(category);
    }
    
    /**
     * 카테고리 생성
     */
    @Transactional
    public CategoryResponse createCategory(Long storeId, CategoryRequest request) {
        // 카테고리명 중복 검사
        if (categoryRepository.existsByStoreIdAndName(storeId, request.getName())) {
            throw new BusinessException("이미 존재하는 카테고리명입니다.", HttpStatus.BAD_REQUEST);
        }
        
        Category category = Category.builder()
                .storeId(storeId)
                .name(request.getName())
                .displayOrder(request.getDisplayOrder())
                .isActive(request.getIsActive())
                .build();
        
        Category savedCategory = categoryRepository.save(category);
        
        log.info("카테고리 생성 완료: storeId={}, categoryId={}, name={}", 
                storeId, savedCategory.getId(), savedCategory.getName());
        
        return CategoryResponse.from(savedCategory);
    }
    
    /**
     * 카테고리 수정
     */
    @Transactional
    public CategoryResponse updateCategory(Long categoryId, Long storeId, CategoryRequest request) {
        Category category = categoryRepository.findByIdAndStoreId(categoryId, storeId)
                .orElseThrow(() -> new BusinessException("카테고리를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        // 카테고리명 중복 검사 (자기 자신 제외)
        if (categoryRepository.existsByStoreIdAndNameAndIdNot(storeId, request.getName(), categoryId)) {
            throw new BusinessException("이미 존재하는 카테고리명입니다.", HttpStatus.BAD_REQUEST);
        }
        
        category.setName(request.getName());
        category.setDisplayOrder(request.getDisplayOrder());
        category.setIsActive(request.getIsActive());
        
        Category updatedCategory = categoryRepository.save(category);
        
        log.info("카테고리 수정 완료: categoryId={}, name={}", categoryId, request.getName());
        
        return CategoryResponse.from(updatedCategory);
    }
    
    /**
     * 카테고리 삭제
     */
    @Transactional
    public void deleteCategory(Long categoryId, Long storeId) {
        Category category = categoryRepository.findByIdAndStoreId(categoryId, storeId)
                .orElseThrow(() -> new BusinessException("카테고리를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        // 해당 카테고리에 메뉴가 있는지 확인
        long menuCount = menuRepository.countByCategoryId(categoryId);
        if (menuCount > 0) {
            throw new BusinessException("해당 카테고리에 메뉴가 존재하여 삭제할 수 없습니다.", HttpStatus.BAD_REQUEST);
        }
        
        categoryRepository.delete(category);
        
        log.info("카테고리 삭제 완료: categoryId={}, name={}", categoryId, category.getName());
    }
    
    /**
     * 카테고리 상태 변경 (활성/비활성)
     */
    @Transactional
    public CategoryResponse toggleCategoryStatus(Long categoryId, Long storeId) {
        Category category = categoryRepository.findByIdAndStoreId(categoryId, storeId)
                .orElseThrow(() -> new BusinessException("카테고리를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        category.setIsActive(!category.getIsActive());
        Category updatedCategory = categoryRepository.save(category);
        
        log.info("카테고리 상태 변경: categoryId={}, isActive={}", categoryId, updatedCategory.getIsActive());
        
        return CategoryResponse.from(updatedCategory);
    }
} 