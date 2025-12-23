import { api } from './api';
import { Order, OrderRequest, OrderStatus } from '../types/order';

export const orderService = {
  /**
   * 주문 생성 (고객용)
   */
  async createOrder(request: OrderRequest): Promise<Order> {
    try {
      const response = await api.post<Order>('/orders', request);
      
      if (response.data.success && response.data.data) {
        const order = response.data.data;
        
        // 주문 접근 토큰을 localStorage에 저장 (소유권 검증용)
        if (order.accessToken) {
          localStorage.setItem(`orderToken_${order.id}`, order.accessToken);
        }
        
        return order;
      } else {
        throw new Error(response.data.message || '주문 생성에 실패했습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('주문 생성 중 오류가 발생했습니다.');
      }
    }
  },

  /**
   * 주문 조회 (고객용) - 접근 토큰 검증 포함
   */
  async getOrder(orderId: number): Promise<Order> {
    try {
      // localStorage에서 접근 토큰 가져오기
      const token = localStorage.getItem(`orderToken_${orderId}`);
      const url = token ? `/orders/${orderId}?token=${encodeURIComponent(token)}` : `/orders/${orderId}`;
      
      const response = await api.get<Order>(url);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '주문 정보를 가져올 수 없습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('주문 정보 조회 중 오류가 발생했습니다.');
      }
    }
  },

  /**
   * 주문 번호로 조회 (고객용) - 접근 토큰 검증 포함
   */
  async getOrderByNumber(orderNumber: string, orderId?: number): Promise<Order> {
    try {
      // orderId가 제공되면 해당 주문의 토큰 사용, 없으면 토큰 없이 시도
      const token = orderId ? localStorage.getItem(`orderToken_${orderId}`) : null;
      const url = token 
        ? `/orders/number/${orderNumber}?token=${encodeURIComponent(token)}`
        : `/orders/number/${orderNumber}`;
      
      const response = await api.get<Order>(url);
      
      if (response.data.success && response.data.data) {
        const order = response.data.data;
        
        // 응답에 accessToken이 있으면 저장 (주문 번호로 조회한 경우)
        if (order.accessToken && order.id) {
          localStorage.setItem(`orderToken_${order.id}`, order.accessToken);
        }
        
        return order;
      } else {
        throw new Error(response.data.message || '주문 정보를 가져올 수 없습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('주문 정보 조회 중 오류가 발생했습니다.');
      }
    }
  },

  /**
   * 주문 취소 (고객용) - 접근 토큰 검증 포함
   */
  async cancelOrder(orderId: number): Promise<Order> {
    try {
      // localStorage에서 접근 토큰 가져오기
      const token = localStorage.getItem(`orderToken_${orderId}`);
      const url = token ? `/orders/${orderId}?token=${encodeURIComponent(token)}` : `/orders/${orderId}`;
      
      const response = await api.delete<Order>(url);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '주문 취소에 실패했습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('주문 취소 중 오류가 발생했습니다.');
      }
    }
  },

  /**
   * 매장별 주문 목록 조회 (관리자용)
   */
  async getOrdersByStore(): Promise<Order[]> {
    try {
      const response = await api.get<Order[]>('/orders/store');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '주문 목록을 가져올 수 없습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('주문 목록 조회 중 오류가 발생했습니다.');
      }
    }
  },

  /**
   * 매장별 특정 상태 주문 조회 (관리자용)
   */
  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    try {
      const response = await api.get<Order[]>(`/orders/store/status/${status}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '주문 목록을 가져올 수 없습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('주문 목록 조회 중 오류가 발생했습니다.');
      }
    }
  },

  /**
   * 주문 상태 변경 (관리자용)
   */
  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
    try {
      const response = await api.put<Order>(`/orders/${orderId}/status?status=${status}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '주문 상태 변경에 실패했습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('주문 상태 변경 중 오류가 발생했습니다.');
      }
    }
  },

  /**
   * 매장별 오늘 주문 통계 (관리자용)
   */
  async getTodayOrderCount(): Promise<number> {
    try {
      const response = await api.get<number>('/orders/store/stats/today');
      
      if (response.data.success && response.data.data !== undefined) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '주문 통계를 가져올 수 없습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('주문 통계 조회 중 오류가 발생했습니다.');
      }
    }
  },

  /**
   * 매장별 대기 중인 주문 개수 (관리자용)
   */
  async getPendingOrderCount(): Promise<number> {
    try {
      const response = await api.get<number>('/orders/store/stats/pending');
      
      if (response.data.success && response.data.data !== undefined) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '대기 중인 주문 개수를 가져올 수 없습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('대기 중인 주문 개수 조회 중 오류가 발생했습니다.');
      }
    }
  }
};

