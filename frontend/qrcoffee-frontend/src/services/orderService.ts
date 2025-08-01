import { ApiResponse } from '../types/api';
import { 
  Order, 
  OrderRequest, 
  OrderStats, 
  OrderStatusStats, 
  OrderStatus 
} from '../types/order';
import { Menu } from '../types/menu';
import { getAuthToken } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// 공통 에러 처리
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || errorData.message || '요청 처리에 실패했습니다.');
  }
  return response.json();
};

// 공통 헤더 생성
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// 고객용 주문 API
export const customerOrderService = {
  // QR코드로 메뉴 조회
  getMenusByQrCode: async (qrCode: string): Promise<Menu[]> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/qr/${qrCode}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const apiResponse = await handleResponse<Menu[]>(response);
    return apiResponse.data || [];
  },

  // 주문 생성
  createOrder: async (orderData: OrderRequest): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const apiResponse = await handleResponse<Order>(response);
    if (!apiResponse.data) {
      throw new Error('주문 생성에 실패했습니다.');
    }
    return apiResponse.data;
  },

  // 주문 조회
  getOrder: async (orderId: number): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const apiResponse = await handleResponse<Order>(response);
    if (!apiResponse.data) {
      throw new Error('주문을 찾을 수 없습니다.');
    }
    return apiResponse.data;
  },

  // 주문 번호로 조회
  getOrderByNumber: async (orderNumber: string): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/number/${orderNumber}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const apiResponse = await handleResponse<Order>(response);
    if (!apiResponse.data) {
      throw new Error('주문을 찾을 수 없습니다.');
    }
    return apiResponse.data;
  },

  // 주문 취소 (고객용)
  cancelOrder: async (orderId: number): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    const apiResponse = await handleResponse<Order>(response);
    if (!apiResponse.data) {
      throw new Error('주문 취소에 실패했습니다.');
    }
    return apiResponse.data;
  },
};

// 관리자용 주문 API
export const adminOrderService = {
  // 주문 목록 조회
  getOrders: async (status?: OrderStatus): Promise<Order[]> => {
    const queryParam = status ? `?status=${status}` : '';
    const response = await fetch(`${API_BASE_URL}/api/admin/orders${queryParam}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const apiResponse = await handleResponse<Order[]>(response);
    return apiResponse.data || [];
  },

  // 주문 상세 조회
  getOrder: async (orderId: number): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const apiResponse = await handleResponse<Order>(response);
    if (!apiResponse.data) {
      throw new Error('주문을 찾을 수 없습니다.');
    }
    return apiResponse.data;
  },

  // 주문 상태 변경
  updateOrderStatus: async (orderId: number, status: OrderStatus): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/status?status=${status}`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    const apiResponse = await handleResponse<Order>(response);
    if (!apiResponse.data) {
      throw new Error('주문 상태 변경에 실패했습니다.');
    }
    return apiResponse.data;
  },

  // 주문 취소 (관리자용)
  cancelOrder: async (orderId: number): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const apiResponse = await handleResponse<Order>(response);
    if (!apiResponse.data) {
      throw new Error('주문 취소에 실패했습니다.');
    }
    return apiResponse.data;
  },

  // 오늘 주문 통계
  getTodayStats: async (): Promise<OrderStats> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/orders/stats/today`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const apiResponse = await handleResponse<OrderStats>(response);
    if (!apiResponse.data) {
      throw new Error('통계 데이터를 가져올 수 없습니다.');
    }
    return apiResponse.data;
  },

  // 주문 상태별 통계
  getStatusStats: async (): Promise<OrderStatusStats> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/orders/stats/status`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const apiResponse = await handleResponse<OrderStatusStats>(response);
    if (!apiResponse.data) {
      throw new Error('상태별 통계 데이터를 가져올 수 없습니다.');
    }
    return apiResponse.data;
  },
};

// 통합 주문 서비스
export const orderService = {
  ...customerOrderService,
  admin: adminOrderService,
}; 