package com.qrcoffee.backend.controller;

import com.qrcoffee.backend.common.ApiResponse;
import com.qrcoffee.backend.common.BaseController;
import com.qrcoffee.backend.entity.Notification;
import com.qrcoffee.backend.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController extends BaseController {
    
    private final NotificationService notificationService;
    
    /**
     * 매장별 알림 목록 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(
            @RequestParam(required = false) Notification.UserType userType,
            HttpServletRequest request) {
        
        Long storeId = getStoreId(request);
        Notification.UserType targetUserType = (userType != null) ? userType : Notification.UserType.ADMIN;
        
        List<Notification> notifications = notificationService.getNotifications(storeId, targetUserType);
        
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }
    
    /**
     * 미읽음 알림 개수 조회
     */
    @GetMapping("/unread/count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @RequestParam(required = false) Notification.UserType userType,
            HttpServletRequest request) {
        
        Long storeId = getStoreId(request);
        Notification.UserType targetUserType = (userType != null) ? userType : Notification.UserType.ADMIN;
        
        long count = notificationService.getUnreadNotificationCount(storeId, targetUserType);
        
        return ResponseEntity.ok(ApiResponse.success(count));
    }
    
    /**
     * 알림 읽음 처리
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Notification>> markAsRead(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long storeId = getStoreId(request);
        
        // storeId 검증 추가 (권한 검증)
        Notification notification = notificationService.markAsRead(id, storeId);
        return ResponseEntity.ok(ApiResponse.success(notification));
    }
}
