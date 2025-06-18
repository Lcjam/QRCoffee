package com.qrcoffee.backend.controller;

import com.qrcoffee.backend.common.ApiResponse;
import com.qrcoffee.backend.dto.SignupRequest;
import com.qrcoffee.backend.dto.UserResponse;
import com.qrcoffee.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {
    
    private final UserService userService;
    
    /**
     * 사용자 ID로 조회
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long userId,
                                                               HttpServletRequest request) {
        Long requesterId = (Long) request.getAttribute("userId");
        Long storeId = (Long) request.getAttribute("storeId");
        
        log.info("사용자 조회 요청: userId={}, requesterId={}", userId, requesterId);
        
        UserResponse userResponse = userService.getUserById(userId);
        
        // 같은 매장 사용자만 조회 가능하도록 검증
        if (!userResponse.getStoreId().equals(storeId)) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("같은 매장의 사용자만 조회할 수 있습니다.", "FORBIDDEN"));
        }
        
        return ResponseEntity.ok(ApiResponse.success("사용자 정보를 조회했습니다.", userResponse));
    }
    
    /**
     * 매장별 사용자 목록 조회
     */
    @GetMapping("/store/{storeId}")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsersByStore(@PathVariable Long storeId,
                                                                          HttpServletRequest request) {
        Long userStoreId = (Long) request.getAttribute("storeId");
        
        // 자신의 매장 정보만 조회 가능
        if (!storeId.equals(userStoreId)) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("자신의 매장 정보만 조회할 수 있습니다.", "FORBIDDEN"));
        }
        
        log.info("매장별 사용자 목록 조회: storeId={}", storeId);
        
        List<UserResponse> users = userService.getUsersByStore(storeId);
        
        return ResponseEntity.ok(ApiResponse.success("매장 사용자 목록을 조회했습니다.", users));
    }
    
    /**
     * 서브계정 목록 조회 (마스터 계정만)
     */
    @GetMapping("/sub-accounts")
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getSubAccounts(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        
        log.info("서브계정 목록 조회: masterId={}", userId);
        
        List<UserResponse> subAccounts = userService.getSubAccounts(userId);
        
        return ResponseEntity.ok(ApiResponse.success("서브계정 목록을 조회했습니다.", subAccounts));
    }
    
    /**
     * 서브계정 생성 (마스터 계정만)
     */
    @PostMapping("/sub-accounts")
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<ApiResponse<UserResponse>> createSubAccount(@Valid @RequestBody SignupRequest request,
                                                                     HttpServletRequest httpRequest) {
        Long masterUserId = (Long) httpRequest.getAttribute("userId");
        
        log.info("서브계정 생성 요청: masterId={}, email={}", masterUserId, request.getEmail());
        
        UserResponse userResponse = userService.createSubAccount(request, masterUserId);
        
        return ResponseEntity.ok(ApiResponse.success("서브계정이 생성되었습니다.", userResponse));
    }
    
    /**
     * 사용자 상태 변경 (활성/비활성)
     */
    @PutMapping("/{userId}/status")
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserStatus(@PathVariable Long userId,
                                                                     HttpServletRequest request) {
        Long requesterId = (Long) request.getAttribute("userId");
        
        log.info("사용자 상태 변경 요청: userId={}, requesterId={}", userId, requesterId);
        
        UserResponse userResponse = userService.toggleUserStatus(userId, requesterId);
        
        return ResponseEntity.ok(ApiResponse.success("사용자 상태가 변경되었습니다.", userResponse));
    }
} 