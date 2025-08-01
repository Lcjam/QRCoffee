import { api } from './api';
import { PaymentRequest, PaymentResponse, PaymentConfig, PaymentStats, CartPaymentRequest } from '../types/payment';

export const paymentService = {
  // 토스페이먼츠 설정 조회
  async getConfig(): Promise<PaymentConfig> {
    const response = await api.get('/payments/config');
    return response.data.data as PaymentConfig;
  },

  // 장바구니에서 직접 결제 준비 (주문 생성 없이)
  async prepareCartPayment(request: CartPaymentRequest): Promise<PaymentResponse> {
    const response = await api.post('/payments/prepare-cart', request);
    return response.data.data as PaymentResponse;
  },

  // 결제 준비 (기존 주문 기반)
  async preparePayment(request: PaymentRequest): Promise<PaymentResponse> {
    const response = await api.post('/payments/prepare', request);
    return response.data.data as PaymentResponse;
  },

  // 결제 승인 (토스페이먼츠 콜백)
  async confirmPayment(paymentKey: string, orderId: string, amount: number): Promise<PaymentResponse> {
    const response = await api.post(`/payments/confirm?paymentKey=${paymentKey}&orderId=${orderId}&amount=${amount}`, {});
    return response.data.data as PaymentResponse;
  },

  // 결제 취소
  async cancelPayment(paymentId: number, cancelReason: string): Promise<PaymentResponse> {
    const response = await api.post(`/payments/${paymentId}/cancel`, { cancelReason });
    return response.data.data as PaymentResponse;
  },

  // 결제 정보 조회
  async getPayment(paymentId: number): Promise<PaymentResponse> {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data.data as PaymentResponse;
  },

  // 주문별 결제 정보 조회
  async getPaymentByOrderId(orderId: number): Promise<PaymentResponse> {
    const response = await api.get(`/payments/order/${orderId}`);
    return response.data.data as PaymentResponse;
  },

  // 매장별 결제 목록 조회
  async getPaymentsByStore(storeId: number, page: number = 0, size: number = 20): Promise<{
    content: PaymentResponse[];
    totalElements: number;
    totalPages: number;
    last: boolean;
  }> {
    const response = await api.get(`/payments/store/${storeId}`, {
      params: { page, size, sort: 'createdAt,desc' }
    });
    return response.data.data as {
      content: PaymentResponse[];
      totalElements: number;
      totalPages: number;
      last: boolean;
    };
  },

  // 매장 매출 통계 조회
  async getStoreRevenue(storeId: number): Promise<PaymentStats> {
    const response = await api.get(`/payments/store/${storeId}/revenue`);
    return response.data.data as PaymentStats;
  }
}; 