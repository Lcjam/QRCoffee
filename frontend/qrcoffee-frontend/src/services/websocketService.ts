import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Notification } from '../types/notification';
import { getAuthToken } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export class WebSocketService {
  private client: Client | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;
  private isConnecting: boolean = false; // 재연결 경쟁 상태 방지

  /**
   * 관리자용 WebSocket 연결
   */
  connectAdmin(storeId: number, onNotification: (notification: Notification) => void): void {
    // 이미 연결되어 있으면 무시
    if (this.client && this.isConnected) {
      console.log('WebSocket already connected');
      return;
    }
    
    // 이미 연결 중이면 무시 (경쟁 상태 방지)
    if (this.isConnecting) {
      console.log('WebSocket connection already in progress');
      return;
    }
    
    this.isConnecting = true;

    // JWT 토큰 가져오기
    const token = getAuthToken();
    if (!token) {
      console.error('WebSocket 연결 실패: 토큰이 없습니다.');
      this.isConnecting = false;
      return;
    }

    // 토큰을 query parameter로 전달
    const socket = new SockJS(`${API_BASE_URL}/ws/admin?token=${encodeURIComponent(token)}`);
    this.client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('✅ WebSocket connected (Admin)');
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;

        // 관리자용 토픽 구독
        this.client?.subscribe(`/topic/admin/${storeId}`, (message: IMessage) => {
          try {
            const notification: Notification = JSON.parse(message.body);
            console.log('📨 Received admin notification:', notification);
            onNotification(notification);
          } catch (error) {
            console.error('Failed to parse notification:', error);
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        this.isConnected = false;
        this.isConnecting = false;
      },
      onWebSocketClose: () => {
        console.log('WebSocket closed');
        this.isConnected = false;
        this.isConnecting = false;
        this.attemptReconnect(storeId, onNotification);
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.isConnecting = false;
      }
    });

    this.client.activate();
  }

  /**
   * 고객용 WebSocket 연결
   */
  connectCustomer(orderId: number, onNotification: (notification: Notification) => void): void {
    // 이미 연결되어 있으면 무시
    if (this.client && this.isConnected) {
      console.log('WebSocket already connected');
      return;
    }
    
    // 이미 연결 중이면 무시 (경쟁 상태 방지)
    if (this.isConnecting) {
      console.log('WebSocket connection already in progress');
      return;
    }
    
    this.isConnecting = true;

    // 고객용 WebSocket은 토큰이 선택적 (로그인하지 않은 고객도 사용 가능)
    const token = getAuthToken();
    const url = token 
      ? `${API_BASE_URL}/ws/customer?token=${encodeURIComponent(token)}`
      : `${API_BASE_URL}/ws/customer`;
    const socket = new SockJS(url);
    this.client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('✅ WebSocket connected (Customer)');
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;

        // 고객용 토픽 구독
        this.client?.subscribe(`/topic/customer/${orderId}`, (message: IMessage) => {
          try {
            const notification: Notification = JSON.parse(message.body);
            console.log('📨 Received customer notification:', notification);
            onNotification(notification);
          } catch (error) {
            console.error('Failed to parse notification:', error);
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        this.isConnected = false;
        this.isConnecting = false;
      },
      onWebSocketClose: () => {
        console.log('WebSocket closed');
        this.isConnected = false;
        this.isConnecting = false;
        this.attemptReconnect(orderId, onNotification, 'customer');
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.isConnecting = false;
      }
    });

    this.client.activate();
  }

  /**
   * 재연결 시도
   */
  private attemptReconnect(
    id: number,
    onNotification: (notification: Notification) => void,
    type: 'admin' | 'customer' = 'admin'
  ): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      if (type === 'admin') {
        this.connectAdmin(id, onNotification);
      } else {
        this.connectCustomer(id, onNotification);
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  /**
   * WebSocket 연결 해제
   */
  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
      this.isConnecting = false;
      console.log('WebSocket disconnected');
    }
  }

  /**
   * 연결 상태 확인
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const websocketService = new WebSocketService();
