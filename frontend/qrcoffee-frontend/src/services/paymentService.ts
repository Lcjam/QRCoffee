import { api } from './api';
import { CartPaymentRequest, PaymentConfirmRequest, PaymentResponse } from '../types/payment';

export const paymentService = {
  /**
   * 결제 준비 (장바구니에서 결제 준비)
   */
  async preparePayment(request: CartPaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await api.post<PaymentResponse>('/payments/prepare', request);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '결제 준비에 실패했습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('결제 준비 중 오류가 발생했습니다.');
      }
    }
  },

  /**
   * 결제 승인 (토스페이먼츠 결제 승인 API 호출)
   */
  async confirmPayment(request: PaymentConfirmRequest): Promise<PaymentResponse> {
    try {
      const response = await api.post<PaymentResponse>('/payments/confirm', request);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '결제 승인에 실패했습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('결제 승인 중 오류가 발생했습니다.');
      }
    }
  },

  /**
   * 결제 조회 (paymentKey로)
   */
  async getPaymentByKey(paymentKey: string): Promise<PaymentResponse> {
    try {
      const response = await api.get<PaymentResponse>(`/payments/${paymentKey}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '결제 정보를 가져올 수 없습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('결제 정보 조회 중 오류가 발생했습니다.');
      }
    }
  },

  /**
   * 결제 조회 (orderId로)
   */
  async getPaymentByOrderId(orderId: string): Promise<PaymentResponse> {
    try {
      const response = await api.get<PaymentResponse>(`/payments/order/${orderId}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '결제 정보를 가져올 수 없습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('결제 정보 조회 중 오류가 발생했습니다.');
      }
    }
  }
};

