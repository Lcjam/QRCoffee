package com.qrcoffee.backend.common;

import com.qrcoffee.backend.util.RequestUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

/**
 * 모든 Controller의 공통 기능을 제공하는 Base Controller
 */
public abstract class BaseController {
    
    /**
     * HttpServletRequest에서 storeId 추출
     */
    protected Long getStoreId(HttpServletRequest request) {
        return RequestUtils.getStoreId(request);
    }
    
    /**
     * HttpServletRequest에서 userId 추출
     */
    protected Long getUserId(HttpServletRequest request) {
        return RequestUtils.getUserId(request);
    }
    
    /**
     * HttpServletRequest에서 userEmail 추출
     */
    protected String getUserEmail(HttpServletRequest request) {
        return RequestUtils.getUserEmail(request);
    }
    
    /**
     * HttpServletRequest에서 userRole 추출
     */
    protected String getUserRole(HttpServletRequest request) {
        return RequestUtils.getUserRole(request);
    }
    
    /**
     * 성공 응답 생성 헬퍼 메서드
     */
    protected <T> ResponseEntity<ApiResponse<T>> success(T data) {
        return ResponseEntity.ok(ApiResponse.success(data));
    }
    
    /**
     * 성공 응답 생성 헬퍼 메서드 (메시지 포함)
     */
    protected <T> ResponseEntity<ApiResponse<T>> success(String message, T data) {
        return ResponseEntity.ok(ApiResponse.success(message, data));
    }
    
    /**
     * 성공 응답 생성 헬퍼 메서드 (메시지만)
     */
    protected <T> ResponseEntity<ApiResponse<T>> success(String message) {
        return ResponseEntity.ok(ApiResponse.success(message));
    }
    
    /**
     * 에러 응답 생성 헬퍼 메서드
     */
    protected <T> ResponseEntity<ApiResponse<T>> error(String error) {
        return ResponseEntity.badRequest().body(ApiResponse.error(error));
    }
    
    /**
     * 에러 응답 생성 헬퍼 메서드 (메시지와 에러 포함)
     */
    protected <T> ResponseEntity<ApiResponse<T>> error(String message, String error) {
        return ResponseEntity.badRequest().body(ApiResponse.error(message, error));
    }
}
