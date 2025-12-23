// 알림 관련 타입 정의

export enum NotificationUserType {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN'
}

export enum NotificationType {
  ORDER_RECEIVED = 'ORDER_RECEIVED',
  ORDER_COMPLETED = 'ORDER_COMPLETED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED'
}

export interface Notification {
  id: number;
  orderId?: number;
  storeId: number;
  userType: NotificationUserType;
  message: string;
  notificationType: NotificationType;
  isRead: boolean;
  sentAt: string;
  readAt?: string;
}
