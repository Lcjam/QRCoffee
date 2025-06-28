package com.qrcoffee.backend.service;

import com.qrcoffee.backend.dto.*;
import com.qrcoffee.backend.entity.Store;
import com.qrcoffee.backend.entity.User;
import com.qrcoffee.backend.exception.BusinessException;
import com.qrcoffee.backend.repository.StoreRepository;
import com.qrcoffee.backend.repository.UserRepository;
import com.qrcoffee.backend.util.JwtUtil;
import com.qrcoffee.backend.util.ValidationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserService {
    
    // 상수 정의
    private static final String LOGIN_SUCCESS_MESSAGE = "로그인 성공";
    private static final String SIGNUP_SUCCESS_MESSAGE = "회원가입 완료";
    private static final String STAFF_ACCOUNT_SUCCESS_MESSAGE = "직원 계정 생성 완료";
    private static final String USER_STATUS_CHANGE_MESSAGE = "사용자 상태 변경";
    
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    /**
     * 회원가입
     */
    @Transactional
    public UserResponse signup(SignupRequest request) {
        log.info("회원가입 시도: {}", request.getEmail());
        
        // 이메일 중복 검증
        ValidationUtils.validateEmailNotDuplicate(
                request.getEmail(), 
                userRepository.existsByEmail(request.getEmail())
        );
        
        // 매장 검증
        Store store = validateAndGetStore(request.getStoreId());
        
        // 사용자 생성
        User user = createMasterUser(request, store);
        User savedUser = userRepository.save(user);
        
        log.info("{}: {} (ID: {})", SIGNUP_SUCCESS_MESSAGE, savedUser.getEmail(), savedUser.getId());
        
        return UserResponse.from(savedUser);
    }
    
    /**
     * 마스터 사용자 생성
     */
    private User createMasterUser(SignupRequest request, Store store) {
        return User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phone(request.getPhone())
                .role(User.Role.MASTER)
                .store(store)
                .build();
    }
    
    /**
     * 로그인
     */
    @Transactional
    public JwtResponse login(LoginRequest request) {
        log.info("로그인 시도: {}", request.getEmail());
        
        // 사용자 조회 및 검증
        User user = findAndValidateUser(request);
        
        // 비밀번호 검증
        validatePassword(request.getPassword(), user);
        
        // JWT 토큰 생성
        JwtResponse jwtResponse = generateJwtResponse(user);
        
        log.info("{}: {} (ID: {})", LOGIN_SUCCESS_MESSAGE, user.getEmail(), user.getId());
        
        return jwtResponse;
    }
    
    /**
     * 사용자 조회 및 로그인 검증
     */
    private User findAndValidateUser(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        ValidationUtils.validateUserExists(user, request.getEmail());
        
        // 계정 및 매장 활성화 상태 확인
        ValidationUtils.validateUserActive(user);
        ValidationUtils.validateStoreActive(user.getStore());
        
        return user;
    }
    
    /**
     * 비밀번호 검증
     */
    private void validatePassword(String rawPassword, User user) {
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            log.warn("비밀번호 불일치: {}", user.getEmail());
            throw new BusinessException("잘못된 이메일 또는 비밀번호입니다.", HttpStatus.UNAUTHORIZED);
        }
    }
    
    /**
     * JWT 응답 생성
     */
    private JwtResponse generateJwtResponse(User user) {
        String accessToken = jwtUtil.generateAccessToken(
                user.getEmail(), 
                user.getId(), 
                user.getRole().name(), 
                user.getStore() != null ? user.getStore().getId() : null
        );
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        
        return new JwtResponse(
                accessToken,
                refreshToken,
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole().name(),
                user.getStore() != null ? user.getStore().getId() : null
        );
    }
    
    /**
     * 현재 사용자 정보 조회
     */
    public UserResponse getCurrentUser(String email) {
        User user = findUserByEmail(email);
        return UserResponse.from(user);
    }
    
    /**
     * 사용자 ID로 조회
     */
    public UserResponse getUserById(Long userId) {
        User user = findUserById(userId);
        return UserResponse.from(user);
    }
    
    /**
     * 매장별 사용자 목록 조회
     */
    public List<UserResponse> getUsersByStore(Long storeId) {
        List<User> users = userRepository.findByStore_IdAndIsActive(storeId, true);
        return users.stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 사용자 활성/비활성 상태 변경
     */
    @Transactional
    public UserResponse toggleUserStatus(Long userId, Long requesterId) {
        // 사용자 조회
        User user = findUserById(userId);
        User requester = findUserById(requesterId);
        
        // 권한 검증
        ValidationUtils.validateUserManagementPermission(requester, user, userId);
        
        // 상태 변경
        user.setIsActive(!user.getIsActive());
        User updatedUser = userRepository.save(user);
        
        log.info("{}: {} -> {}", USER_STATUS_CHANGE_MESSAGE, user.getEmail(), user.getIsActive() ? "활성화" : "비활성화");
        
        return UserResponse.from(updatedUser);
    }
    
    /**
     * 직원 계정 생성
     */
    @Transactional
    public UserResponse createStaffAccount(SignupRequest request, Long masterUserId) {
        log.info("직원 계정 생성 시도: {} by masterUserId={}", request.getEmail(), masterUserId);
        
        // 마스터 사용자 조회 및 권한 검증
        User masterUser = findUserById(masterUserId);
        ValidationUtils.validateMasterRole(masterUser);
        
        // 이메일 중복 검증
        ValidationUtils.validateEmailNotDuplicate(
                request.getEmail(), 
                userRepository.existsByEmail(request.getEmail())
        );
        
        // 직원 계정 생성
        User staffUser = createStaffUser(request, masterUser.getStore());
        User savedUser = userRepository.save(staffUser);
        
        log.info("{}: {} (ID: {})", STAFF_ACCOUNT_SUCCESS_MESSAGE, savedUser.getEmail(), savedUser.getId());
        
        return UserResponse.from(savedUser);
    }
    
    /**
     * 직원 사용자 생성
     */
    private User createStaffUser(SignupRequest request, Store store) {
        return User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phone(request.getPhone())
                .role(User.Role.STAFF)
                .store(store)
                .build();
    }
    
    /**
     * 매장 검증 및 조회
     */
    private Store validateAndGetStore(Long storeId) {
        Store store = storeRepository.findByIdAndIsActive(storeId, true).orElse(null);
        ValidationUtils.validateStoreExistsAndActive(store, storeId);
        return store;
    }
    
    /**
     * 이메일로 사용자 조회 (공통 메서드)
     */
    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
    }
    
    /**
     * ID로 사용자 조회 (공통 메서드)
     */
    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
    }
} 