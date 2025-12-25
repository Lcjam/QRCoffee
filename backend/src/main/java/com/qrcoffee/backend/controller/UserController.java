package com.qrcoffee.backend.controller;

import com.qrcoffee.backend.common.ApiResponse;
import com.qrcoffee.backend.common.BaseController;
import com.qrcoffee.backend.dto.SignupRequest;
import com.qrcoffee.backend.dto.SubAccountRequest;
import com.qrcoffee.backend.dto.UserResponse;
import com.qrcoffee.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController extends BaseController {
    
    private final UserService userService;
    
    /**
     * 매장별 사용자 목록 조회 (마스터 계정만)
     */
    @GetMapping
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsersByStore(HttpServletRequest request) {
        Long storeId = getStoreId(request);
        
        log.info("매장 사용자 목록 조회: storeId={}", storeId);
        
        List<UserResponse> users = userService.getUsersByStore(storeId);
        
        return success("사용자 목록을 조회했습니다.", users);
    }
    
    /**
     * 서브계정 목록 조회 (마스터 계정만)
     */
    @GetMapping("/sub-accounts")
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getSubAccounts(HttpServletRequest request) {
        Long userId = getUserId(request);
        
        log.info("서브계정 목록 조회: masterUserId={}", userId);
        
        List<UserResponse> subAccounts = userService.getSubAccounts(userId);
        
        return success("서브계정 목록을 조회했습니다.", subAccounts);
    }
    
    /**
     * 서브계정 생성 (마스터 계정만)
     */
    @PostMapping("/sub-accounts")
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<ApiResponse<UserResponse>> createSubAccount(
            @Valid @RequestBody SubAccountRequest request,
            HttpServletRequest httpRequest) {
        Long masterUserId = getUserId(httpRequest);
        Long storeId = getStoreId(httpRequest);
        
        log.info("서브계정 생성 요청: masterUserId={}, storeId={}, email={}", masterUserId, storeId, request.getEmail());
        
        // SubAccountRequest를 SignupRequest로 변환
        SignupRequest signupRequest = request.toSignupRequest(storeId, masterUserId);
        UserResponse subAccount = userService.createSubAccount(signupRequest, masterUserId);
        
        return success("서브계정이 생성되었습니다.", subAccount);
    }
    
    /**
     * 사용자 상태 변경 (활성/비활성) - 마스터 계정만
     */
    @PatchMapping("/{userId}/toggle-status")
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserStatus(
            @PathVariable Long userId,
            HttpServletRequest request) {
        Long requesterId = getUserId(request);
        
        log.info("사용자 상태 변경: userId={}, requesterId={}", userId, requesterId);
        
        UserResponse user = userService.toggleUserStatus(userId, requesterId);
        
        return success("사용자 상태가 변경되었습니다.", user);
    }
    
    /**
     * 사용자 상세 정보 조회
     */
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('MASTER') or hasRole('SUB')")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long userId) {
        log.info("사용자 상세 조회: userId={}", userId);
        
        UserResponse user = userService.getUserById(userId);
        
        return success("사용자 정보를 조회했습니다.", user);
    }
} 
