package com.qrcoffee.backend.service;

import com.qrcoffee.backend.dto.*;
import com.qrcoffee.backend.entity.Store;
import com.qrcoffee.backend.entity.User;
import com.qrcoffee.backend.exception.BusinessException;
import com.qrcoffee.backend.repository.StoreRepository;
import com.qrcoffee.backend.repository.UserRepository;
import com.qrcoffee.backend.util.JwtUtil;
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
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("이미 사용중인 이메일입니다.", HttpStatus.BAD_REQUEST);
        }
        
        // 매장 존재 여부 확인
        Store store = storeRepository.findByIdAndIsActive(request.getStoreId(), true)
                .orElseThrow(() -> new BusinessException("존재하지 않는 매장입니다.", HttpStatus.BAD_REQUEST));
        
        // 서브계정 생성 시 부모 계정 검증
        if (request.getParentUserId() != null) {
            User parentUser = userRepository.findById(request.getParentUserId())
                    .orElseThrow(() -> new BusinessException("존재하지 않는 부모 계정입니다.", HttpStatus.BAD_REQUEST));
            
            if (!parentUser.getRole().equals(User.Role.MASTER)) {
                throw new BusinessException("마스터 계정만 서브계정을 생성할 수 있습니다.", HttpStatus.BAD_REQUEST);
            }
            
            if (!parentUser.getStoreId().equals(request.getStoreId())) {
                throw new BusinessException("부모 계정과 같은 매장이어야 합니다.", HttpStatus.BAD_REQUEST);
            }
        }
        
        // 사용자 생성
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phone(request.getPhone())
                .role(request.getParentUserId() != null ? User.Role.SUB : User.Role.MASTER)
                .storeId(request.getStoreId())
                .parentUserId(request.getParentUserId())
                .isActive(true)
                .build();
        
        User savedUser = userRepository.save(user);
        log.info("회원가입 완료: {} (ID: {})", savedUser.getEmail(), savedUser.getId());
        
        return UserResponse.from(savedUser);
    }
    
    /**
     * 로그인
     */
    @Transactional
    public JwtResponse login(LoginRequest request) {
        log.info("로그인 시도: {}", request.getEmail());
        
        // 사용자 조회
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("잘못된 이메일 또는 비밀번호입니다.", HttpStatus.UNAUTHORIZED));
        
        // 계정 활성화 상태 확인
        if (!user.getIsActive()) {
            throw new BusinessException("비활성화된 계정입니다.", HttpStatus.UNAUTHORIZED);
        }
        
        // 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException("잘못된 이메일 또는 비밀번호입니다.", HttpStatus.UNAUTHORIZED);
        }
        
        // 매장 활성화 상태 확인
        Store store = storeRepository.findByIdAndIsActive(user.getStoreId(), true)
                .orElseThrow(() -> new BusinessException("비활성화된 매장입니다.", HttpStatus.UNAUTHORIZED));
        
        // 마지막 로그인 시간 업데이트
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        
        // JWT 토큰 생성
        String accessToken = jwtUtil.generateAccessToken(
                user.getEmail(), 
                user.getId(), 
                user.getRole().name(), 
                user.getStoreId()
        );
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        
        log.info("로그인 성공: {} (ID: {})", user.getEmail(), user.getId());
        
        return new JwtResponse(
                accessToken,
                refreshToken,
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole().name(),
                user.getStoreId()
        );
    }
    
    /**
     * 현재 사용자 정보 조회
     */
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        return UserResponse.from(user);
    }
    
    /**
     * 사용자 ID로 조회
     */
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        return UserResponse.from(user);
    }
    
    /**
     * 매장별 사용자 목록 조회
     */
    public List<UserResponse> getUsersByStore(Long storeId) {
        List<User> users = userRepository.findByStoreIdAndIsActive(storeId, true);
        return users.stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 서브계정 목록 조회
     */
    public List<UserResponse> getSubAccounts(Long parentUserId) {
        List<User> subUsers = userRepository.findByParentUserIdAndIsActive(parentUserId, true);
        return subUsers.stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 사용자 활성/비활성 상태 변경
     */
    @Transactional
    public UserResponse toggleUserStatus(Long userId, Long requesterId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new BusinessException("요청자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        // 권한 검증 (마스터 계정만 가능)
        if (!requester.getRole().equals(User.Role.MASTER)) {
            throw new BusinessException("마스터 계정만 사용자 상태를 변경할 수 있습니다.", HttpStatus.FORBIDDEN);
        }
        
        // 같은 매장인지 확인
        if (!requester.getStoreId().equals(user.getStoreId())) {
            throw new BusinessException("같은 매장의 사용자만 관리할 수 있습니다.", HttpStatus.FORBIDDEN);
        }
        
        // 자기 자신은 비활성화할 수 없음
        if (userId.equals(requesterId)) {
            throw new BusinessException("자기 자신의 계정은 비활성화할 수 없습니다.", HttpStatus.BAD_REQUEST);
        }
        
        user.setIsActive(!user.getIsActive());
        User updatedUser = userRepository.save(user);
        
        log.info("사용자 상태 변경: {} -> {}", user.getEmail(), user.getIsActive() ? "활성화" : "비활성화");
        
        return UserResponse.from(updatedUser);
    }
    
    /**
     * 서브계정 생성
     */
    @Transactional
    public UserResponse createSubAccount(SignupRequest request, Long masterUserId) {
        User masterUser = userRepository.findById(masterUserId)
                .orElseThrow(() -> new BusinessException("마스터 계정을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        if (!masterUser.getRole().equals(User.Role.MASTER)) {
            throw new BusinessException("마스터 계정만 서브계정을 생성할 수 있습니다.", HttpStatus.FORBIDDEN);
        }
        
        // 요청에 부모 사용자 ID 설정
        request.setParentUserId(masterUserId);
        request.setStoreId(masterUser.getStoreId());
        
        return signup(request);
    }
} 