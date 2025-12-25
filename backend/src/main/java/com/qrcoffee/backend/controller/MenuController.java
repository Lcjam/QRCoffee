package com.qrcoffee.backend.controller;

import com.qrcoffee.backend.common.ApiResponse;
import com.qrcoffee.backend.common.BaseController;
import com.qrcoffee.backend.dto.MenuRequest;
import com.qrcoffee.backend.dto.MenuResponse;
import com.qrcoffee.backend.service.MenuService;
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
@RequestMapping("/api/menus")
@RequiredArgsConstructor
@Slf4j
public class MenuController extends BaseController {
    
    private final MenuService menuService;
    
    /**
     * 내 매장의 활성 메뉴 목록 조회
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<MenuResponse>>> getActiveMenus(HttpServletRequest request) {
        Long storeId = getStoreId(request);
        
        log.info("활성 메뉴 목록 조회: storeId={}", storeId);
        
        List<MenuResponse> menus = menuService.getActiveMenus(storeId);
        
        return success("활성 메뉴 목록을 조회했습니다.", menus);
    }
    
    /**
     * 내 매장의 모든 메뉴 목록 조회 (관리자용)
     */
    @GetMapping
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<List<MenuResponse>>> getAllMenus(HttpServletRequest request) {
        Long storeId = getStoreId(request);
        
        log.info("모든 메뉴 목록 조회: storeId={}", storeId);
        
        List<MenuResponse> menus = menuService.getAllMenus(storeId);
        
        return success("메뉴 목록을 조회했습니다.", menus);
    }
    
    /**
     * 카테고리별 메뉴 목록 조회
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<MenuResponse>>> getMenusByCategory(@PathVariable Long categoryId) {
        log.info("카테고리별 메뉴 목록 조회: categoryId={}", categoryId);
        
        List<MenuResponse> menus = menuService.getMenusByCategory(categoryId);
        
        return success("카테고리별 메뉴 목록을 조회했습니다.", menus);
    }
    
    /**
     * 메뉴 상세 조회
     */
    @GetMapping("/{menuId}")
    public ResponseEntity<ApiResponse<MenuResponse>> getMenuById(@PathVariable Long menuId,
                                                                HttpServletRequest request) {
        Long storeId = getStoreId(request);
        
        log.info("메뉴 상세 조회: menuId={}, storeId={}", menuId, storeId);
        
        MenuResponse menu = menuService.getMenuById(menuId, storeId);
        
        return success("메뉴 정보를 조회했습니다.", menu);
    }
    
    /**
     * 메뉴 생성 (마스터 계정만)
     */
    @PostMapping
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<ApiResponse<MenuResponse>> createMenu(@Valid @RequestBody MenuRequest request,
                                                               HttpServletRequest httpRequest) {
        Long storeId = getStoreId(httpRequest);
        
        log.info("메뉴 생성 요청: storeId={}, name={}", storeId, request.getName());
        
        MenuResponse menu = menuService.createMenu(storeId, request);
        
        return success("메뉴가 생성되었습니다.", menu);
    }
    
    /**
     * 메뉴 수정 (마스터 계정만)
     */
    @PutMapping("/{menuId}")
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<ApiResponse<MenuResponse>> updateMenu(@PathVariable Long menuId,
                                                               @Valid @RequestBody MenuRequest request,
                                                               HttpServletRequest httpRequest) {
        Long storeId = getStoreId(httpRequest);
        
        log.info("메뉴 수정 요청: menuId={}, storeId={}, name={}", menuId, storeId, request.getName());
        
        MenuResponse menu = menuService.updateMenu(menuId, storeId, request);
        
        return success("메뉴가 수정되었습니다.", menu);
    }
    
    /**
     * 메뉴 삭제 (마스터 계정만)
     */
    @DeleteMapping("/{menuId}")
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<ApiResponse<Void>> deleteMenu(@PathVariable Long menuId,
                                                       HttpServletRequest request) {
        Long storeId = getStoreId(request);
        
        log.info("메뉴 삭제 요청: menuId={}, storeId={}", menuId, storeId);
        
        menuService.deleteMenu(menuId, storeId);
        
        return success("메뉴가 삭제되었습니다.");
    }
    
    /**
     * 메뉴 상태 변경 (품절/판매중) - 서브계정도 가능
     */
    @PutMapping("/{menuId}/status")
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<MenuResponse>> toggleMenuAvailability(@PathVariable Long menuId,
                                                                       HttpServletRequest request) {
        Long storeId = getStoreId(request);
        
        log.info("메뉴 상태 변경 요청: menuId={}, storeId={}", menuId, storeId);
        
        MenuResponse menu = menuService.toggleMenuAvailability(menuId, storeId);
        
        return success("메뉴 상태가 변경되었습니다.", menu);
    }
}
