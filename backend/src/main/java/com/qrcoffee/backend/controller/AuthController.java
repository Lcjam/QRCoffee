package com.qrcoffee.backend.controller;

import com.qrcoffee.backend.common.ApiResponse;
import com.qrcoffee.backend.common.BaseController;
import com.qrcoffee.backend.dto.*;
import com.qrcoffee.backend.service.UserService;
import com.qrcoffee.backend.util.RequestUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController extends BaseController {
    
    private final UserService userService;
    
    /**
     * 회원가입
     */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<UserResponse>> signup(@Valid @RequestBody SignupRequest request) {
        log.info("회원가입 요청: {}", request.getEmail());
        
        UserResponse userResponse = userService.signup(request);
        
        return success("회원가입이 완료되었습니다.", userResponse);
    }
    
    /**
     * 로그인
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("로그인 요청: {}", request.getEmail());
        
        JwtResponse jwtResponse = userService.login(request);
        
        return success("로그인이 완료되었습니다.", jwtResponse);
    }
    
    /**
     * 현재 사용자 정보 조회
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(Principal principal) {
        String email = principal.getName();
        log.info("현재 사용자 정보 조회: {}", email);
        
        UserResponse userResponse = userService.getCurrentUser(email);
        
        return success("사용자 정보를 조회했습니다.", userResponse);
    }
    
    /**
     * 로그아웃
     * (클라이언트에서 토큰을 삭제하도록 안내)
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        String userEmail = RequestUtils.getUserEmail(request);
        log.info("로그아웃 요청: {}", userEmail);
        
        // JWT는 stateless하므로 서버에서 특별한 처리가 필요하지 않음
        // 클라이언트에서 토큰을 삭제하면 됨
        
        return success("로그아웃이 완료되었습니다.");
    }
} 