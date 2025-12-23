package com.qrcoffee.backend.controller;

import com.qrcoffee.backend.common.ApiResponse;
import com.qrcoffee.backend.dto.MenuResponse;
import com.qrcoffee.backend.service.MenuService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 고객용 메뉴 조회 API (인증 불필요)
 */
@RestController
@RequestMapping("/api/public/stores")
@RequiredArgsConstructor
@Slf4j
public class PublicMenuController {
    
    private final MenuService menuService;
    
    /**
     * 고객용 메뉴 목록 조회 (인증 불필요)
     */
    @GetMapping("/{storeId}/menus")
    public ResponseEntity<ApiResponse<List<MenuResponse>>> getMenusForCustomer(@PathVariable Long storeId) {
        log.info("고객용 메뉴 목록 조회: storeId={}", storeId);
        
        List<MenuResponse> menus = menuService.getMenusForCustomer(storeId);
        
        return ResponseEntity.ok(ApiResponse.success("메뉴 목록을 조회했습니다.", menus));
    }
}
