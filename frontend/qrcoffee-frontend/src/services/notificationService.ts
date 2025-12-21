import { api } from './api';
import { Notification, NotificationUserType } from '../types/notification';

export const notificationService = {
  /**
   * 알림 목록 조회
   */
  getNotifications: async (userType?: NotificationUserType): Promise<Notification[]> => {
    const params = userType ? { userType } : {};
    const response = await api.get<Notification[]>('/notifications', params);
    return response.data.data || [];
  },

  /**
   * 미읽음 알림 개수 조회
   */
  getUnreadCount: async (userType?: NotificationUserType): Promise<number> => {
    const params = userType ? { userType } : {};
    const response = await api.get<number>('/notifications/unread/count', params);
    return response.data.data || 0;
  },

  /**
   * 알림 읽음 처리
   */
  markAsRead: async (notificationId: number): Promise<Notification> => {
    const response = await api.put<Notification>(`/notifications/${notificationId}/read`);
    return response.data.data!;
  }
};
