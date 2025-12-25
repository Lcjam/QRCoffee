package com.qrcoffee.backend.controller;

import com.qrcoffee.backend.common.ApiResponse;
import com.qrcoffee.backend.common.BaseController;
import com.qrcoffee.backend.dto.StoreRequest;
import com.qrcoffee.backend.dto.StoreResponse;
import com.qrcoffee.backend.service.StoreService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
@Slf4j
public class StoreController extends BaseController {
    
    private final StoreService storeService;
    
    /**
     * 내 매장 정보 조회
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<StoreResponse>> getMyStore(HttpServletRequest request) {
        Long storeId = getStoreId(request);
        
        log.info("내 매장 정보 조회: storeId={}", storeId);
        
        StoreResponse storeResponse = storeService.getStoreById(storeId);
        
        return success("매장 정보를 조회했습니다.", storeResponse);
    }
    
    /**
     * 매장 ID로 조회
     */
    @GetMapping("/{storeId}")
    public ResponseEntity<ApiResponse<StoreResponse>> getStoreById(@PathVariable Long storeId,
                                                                  HttpServletRequest request) {
        Long userStoreId = getStoreId(request);
        
        // 자신의 매장 정보만 조회 가능
        if (!storeId.equals(userStoreId)) {
            return error("자신의 매장 정보만 조회할 수 있습니다.", "FORBIDDEN");
        }
        
        log.info("매장 정보 조회: storeId={}", storeId);
        
        StoreResponse storeResponse = storeService.getStoreById(storeId);
        
        return success("매장 정보를 조회했습니다.", storeResponse);
    }
    
    /**
     * 활성 매장 목록 조회 (시스템 관리자용)
     */
    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<StoreResponse>>> getActiveStores() {
        log.info("활성 매장 목록 조회");
        
        List<StoreResponse> stores = storeService.getActiveStores();
        
        return success("활성 매장 목록을 조회했습니다.", stores);
    }
    
    /**
     * 전체 매장 목록 조회 (시스템 관리자용)
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<StoreResponse>>> getAllStores() {
        log.info("전체 매장 목록 조회");
        
        List<StoreResponse> stores = storeService.getAllStores();
        
        return success("전체 매장 목록을 조회했습니다.", stores);
    }
    
    /**
     * 내 매장 정보 수정 (마스터 계정만)
     */
    @PutMapping("/my")
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<ApiResponse<StoreResponse>> updateMyStore(@Valid @RequestBody StoreRequest request,
                                                                   HttpServletRequest httpRequest) {
        Long storeId = getStoreId(httpRequest);
        
        log.info("매장 정보 수정 요청: storeId={}, name={}", storeId, request.getName());
        
        StoreResponse storeResponse = storeService.updateStore(storeId, request);
        
        return success("매장 정보가 수정되었습니다.", storeResponse);
    }
    
    /**
     * 매장 정보 수정 (시스템 관리자용)
     */
    @PutMapping("/{storeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StoreResponse>> updateStore(@PathVariable Long storeId,
                                                                 @Valid @RequestBody StoreRequest request) {
        log.info("매장 정보 수정 요청: storeId={}, name={}", storeId, request.getName());
        
        StoreResponse storeResponse = storeService.updateStore(storeId, request);
        
        return success("매장 정보가 수정되었습니다.", storeResponse);
    }
    
    /**
     * 매장 생성 (시스템 관리자용)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StoreResponse>> createStore(@Valid @RequestBody StoreRequest request) {
        log.info("매장 생성 요청: name={}", request.getName());
        
        StoreResponse storeResponse = storeService.createStore(request);
        
        return success("매장이 생성되었습니다.", storeResponse);
    }
    
    /**
     * 매장 상태 변경 (시스템 관리자용)
     */
    @PutMapping("/{storeId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StoreResponse>> toggleStoreStatus(@PathVariable Long storeId) {
        log.info("매장 상태 변경 요청: storeId={}", storeId);
        
        StoreResponse storeResponse = storeService.toggleStoreStatus(storeId);
        
        return success("매장 상태가 변경되었습니다.", storeResponse);
    }
} 
