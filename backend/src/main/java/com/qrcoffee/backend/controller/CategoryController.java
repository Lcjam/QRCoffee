package com.qrcoffee.backend.controller;

import com.qrcoffee.backend.common.ApiResponse;
import com.qrcoffee.backend.common.BaseController;
import com.qrcoffee.backend.dto.CategoryRequest;
import com.qrcoffee.backend.dto.CategoryResponse;
import com.qrcoffee.backend.service.CategoryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Slf4j
public class CategoryController extends BaseController {
    
    private final CategoryService categoryService;
    
    /**
     * 내 매장의 활성 카테고리 목록 조회
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getActiveCategories(HttpServletRequest request) {
        Long storeId = getStoreId(request);
        
        log.info("활성 카테고리 목록 조회: storeId={}", storeId);
        
        List<CategoryResponse> categories = categoryService.getActiveCategories(storeId);
        
        return success("활성 카테고리 목록을 조회했습니다.", categories);
    }
    
    /**
     * 내 매장의 모든 카테고리 목록 조회 (관리자용)
     */
    @GetMapping
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories(HttpServletRequest request) {
        Long storeId = getStoreId(request);
        
        log.info("모든 카테고리 목록 조회: storeId={}", storeId);
        
        List<CategoryResponse> categories = categoryService.getAllCategories(storeId);
        
        return success("카테고리 목록을 조회했습니다.", categories);
    }
    
    /**
     * 카테고리 상세 조회
     */
    @GetMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long categoryId,
                                                                        HttpServletRequest request) {
        Long storeId = getStoreId(request);
        
        log.info("카테고리 상세 조회: categoryId={}, storeId={}", categoryId, storeId);
        
        CategoryResponse category = categoryService.getCategoryById(categoryId, storeId);
        
        return success("카테고리 정보를 조회했습니다.", category);
    }
    
    /**
     * 카테고리 생성 (마스터 계정만)
     */
    @PostMapping
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request,
                                                                       HttpServletRequest httpRequest) {
        Long storeId = getStoreId(httpRequest);
        
        log.info("카테고리 생성 요청: storeId={}, name={}", storeId, request.getName());
        
        CategoryResponse category = categoryService.createCategory(storeId, request);
        
        return success("카테고리가 생성되었습니다.", category);
    }
    
    /**
     * 카테고리 수정 (마스터 계정만)
     */
    @PutMapping("/{categoryId}")
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(@PathVariable Long categoryId,
                                                                       @Valid @RequestBody CategoryRequest request,
                                                                       HttpServletRequest httpRequest) {
        Long storeId = getStoreId(httpRequest);
        
        log.info("카테고리 수정 요청: categoryId={}, storeId={}, name={}", categoryId, storeId, request.getName());
        
        CategoryResponse category = categoryService.updateCategory(categoryId, storeId, request);
        
        return success("카테고리가 수정되었습니다.", category);
    }
    
    /**
     * 카테고리 삭제 (마스터 계정만)
     */
    @DeleteMapping("/{categoryId}")
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long categoryId,
                                                           HttpServletRequest request) {
        Long storeId = getStoreId(request);
        
        log.info("카테고리 삭제 요청: categoryId={}, storeId={}", categoryId, storeId);
        
        categoryService.deleteCategory(categoryId, storeId);
        
        return success("카테고리가 삭제되었습니다.");
    }
    
    /**
     * 카테고리 상태 변경 (마스터 계정만)
     */
    @PutMapping("/{categoryId}/status")
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<ApiResponse<CategoryResponse>> toggleCategoryStatus(@PathVariable Long categoryId,
                                                                             HttpServletRequest request) {
        Long storeId = getStoreId(request);
        
        log.info("카테고리 상태 변경 요청: categoryId={}, storeId={}", categoryId, storeId);
        
        CategoryResponse category = categoryService.toggleCategoryStatus(categoryId, storeId);
        
        return success("카테고리 상태가 변경되었습니다.", category);
    }
} 
