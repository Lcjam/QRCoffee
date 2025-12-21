import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Notification } from '../types/notification';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export class WebSocketService {
  private client: Client | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;

  /**
   * 관리자용 WebSocket 연결
   */
  connectAdmin(storeId: number, onNotification: (notification: Notification) => void): void {
    if (this.client && this.isConnected) {
      console.log('WebSocket already connected');
      return;
    }

    const socket = new SockJS(`${API_BASE_URL}/ws/admin`);
    this.client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('✅ WebSocket connected (Admin)');
        this.isConnected = true;
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
      },
      onWebSocketClose: () => {
        console.log('WebSocket closed');
        this.isConnected = false;
        this.attemptReconnect(storeId, onNotification);
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
      }
    });

    this.client.activate();
  }

  /**
   * 고객용 WebSocket 연결
   */
  connectCustomer(orderId: number, onNotification: (notification: Notification) => void): void {
    if (this.client && this.isConnected) {
      console.log('WebSocket already connected');
      return;
    }

    const socket = new SockJS(`${API_BASE_URL}/ws/customer`);
    this.client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('✅ WebSocket connected (Customer)');
        this.isConnected = true;
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
      },
      onWebSocketClose: () => {
        console.log('WebSocket closed');
        this.isConnected = false;
        this.attemptReconnect(orderId, onNotification, 'customer');
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
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
