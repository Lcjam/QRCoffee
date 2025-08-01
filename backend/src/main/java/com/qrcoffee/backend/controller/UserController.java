package com.qrcoffee.backend.controller;

import com.qrcoffee.backend.common.ApiResponse;
import com.qrcoffee.backend.dto.SignupRequest;
import com.qrcoffee.backend.dto.SubAccountRequest;
import com.qrcoffee.backend.dto.UserResponse;
import com.qrcoffee.backend.service.UserService;
import com.qrcoffee.backend.util.JwtUtil;
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
    private final JwtUtil jwtUtil;
    
    /**
     * 매장별 사용자 목록 조회 (마스터 계정만)
     */
    @GetMapping
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsersByStore(HttpServletRequest request) {
        Long storeId = jwtUtil.getStoreIdFromRequest(request);
        
        log.info("매장 사용자 목록 조회: storeId={}", storeId);
        
        List<UserResponse> users = userService.getUsersByStore(storeId);
        
        return ResponseEntity.ok(ApiResponse.success("사용자 목록을 조회했습니다.", users));
    }
    
    /**
     * 직원 계정 생성 (마스터 계정만)
     */
    @PostMapping("/staff")
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<ApiResponse<UserResponse>> createStaffAccount(
            @Valid @RequestBody SubAccountRequest request,
            HttpServletRequest httpRequest) {
        Long masterUserId = jwtUtil.getUserIdFromRequest(httpRequest);
        Long storeId = jwtUtil.getStoreIdFromRequest(httpRequest);
        
        log.info("직원 계정 생성 요청: masterUserId={}, storeId={}, email={}", masterUserId, storeId, request.getEmail());
        
        // SubAccountRequest를 SignupRequest로 변환
        SignupRequest signupRequest = request.toSignupRequest(storeId);
        UserResponse staffAccount = userService.createStaffAccount(signupRequest, masterUserId);
        
        return ResponseEntity.ok(ApiResponse.success("직원 계정이 생성되었습니다.", staffAccount));
    }
    
    /**
     * 사용자 상태 변경 (활성/비활성) - 마스터 계정만
     */
    @PatchMapping("/{userId}/toggle-status")
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserStatus(
            @PathVariable Long userId,
            HttpServletRequest request) {
        Long requesterId = jwtUtil.getUserIdFromRequest(request);
        
        log.info("사용자 상태 변경: userId={}, requesterId={}", userId, requesterId);
        
        UserResponse user = userService.toggleUserStatus(userId, requesterId);
        
        return ResponseEntity.ok(ApiResponse.success("사용자 상태가 변경되었습니다.", user));
    }
    
    /**
     * 사용자 상세 정보 조회
     */
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('MASTER') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long userId) {
        log.info("사용자 상세 조회: userId={}", userId);
        
        UserResponse user = userService.getUserById(userId);
        
        return ResponseEntity.ok(ApiResponse.success("사용자 정보를 조회했습니다.", user));
    }
} 