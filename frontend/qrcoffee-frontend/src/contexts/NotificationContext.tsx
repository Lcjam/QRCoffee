import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { Snackbar, Alert } from '@mui/material';
import { Notification, NotificationUserType } from '../types/notification';
import { websocketService } from '../services/websocketService';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: number) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
  userType?: NotificationUserType;
  storeId?: number;
  orderId?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  userType = NotificationUserType.ADMIN,
  storeId,
  orderId
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // 알림 목록 새로고침
  const refreshNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications(userType);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [userType]);

  // 미읽음 개수 새로고침
  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount(userType);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [userType]);

  // 알림 추가
  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount((prev) => prev + 1);
    }
    
    // 스낵바로 알림 표시 (XSS 방지를 위해 DOMPurify로 sanitize)
    const sanitizedMessage = DOMPurify.sanitize(notification.message, {
      ALLOWED_TAGS: [], // 모든 HTML 태그 제거
      ALLOWED_ATTR: []  // 모든 속성 제거
    });
    setSnackbarMessage(sanitizedMessage);
    setSnackbarOpen(true);
  }, []);

  // 알림 읽음 처리
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      const updatedNotification = await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? updatedNotification : n))
      );
      
      // 읽지 않은 알림이었으면 개수 감소
      const notification = notifications.find((n) => n.id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [notifications]);

  // WebSocket 연결 및 알림 수신
  useEffect(() => {
    if (!user) return;

    let websocketConnected = false;

    // 관리자용 WebSocket 연결
    if (userType === NotificationUserType.ADMIN && storeId) {
      try {
        websocketService.connectAdmin(storeId, addNotification);
        websocketConnected = websocketService.getConnectionStatus();
      } catch (error) {
        console.error('WebSocket 연결 실패:', error);
        websocketConnected = false;
      }
    }
    // 고객용 WebSocket 연결
    else if (userType === NotificationUserType.CUSTOMER && orderId) {
      try {
        websocketService.connectCustomer(orderId, addNotification);
        websocketConnected = websocketService.getConnectionStatus();
      } catch (error) {
        console.error('WebSocket 연결 실패:', error);
        websocketConnected = false;
      }
    }

    // 초기 알림 로드
    refreshNotifications();
    refreshUnreadCount();

    // 정리 함수
    return () => {
      websocketService.disconnect();
    };
  }, [user, userType, storeId, orderId, addNotification, refreshNotifications, refreshUnreadCount]);

  // WebSocket 연결 실패 시에만 폴링 사용 (fallback)
  useEffect(() => {
    const isWebSocketConnected = websocketService.getConnectionStatus();
    
    // WebSocket이 연결되어 있으면 폴링 불필요
    if (isWebSocketConnected) {
      return;
    }

    // WebSocket 연결 실패 시에만 폴링으로 미읽음 개수 새로고침
    const interval = setInterval(() => {
      const stillConnected = websocketService.getConnectionStatus();
      if (!stillConnected) {
        refreshUnreadCount();
      }
    }, 30000); // 30초마다

    return () => clearInterval(interval);
  }, [refreshUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        refreshNotifications,
        refreshUnreadCount
      }}
    >
      {children}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="info" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};
