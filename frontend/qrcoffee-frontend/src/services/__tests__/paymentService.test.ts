import { paymentService } from '../paymentService';
import { CartPaymentRequest, PaymentConfirmRequest, PaymentResponse } from '../../types/payment';

// api 모킹
const mockPost = jest.fn();
const mockGet = jest.fn();

jest.mock('../api', () => ({
  api: {
    post: (...args: any[]) => mockPost(...args),
    get: (...args: any[]) => mockGet(...args)
  }
}));

describe('paymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('preparePayment', () => {
    it('결제 준비 성공 시 PaymentResponse 반환', async () => {
      // Given
      const request: CartPaymentRequest = {
        totalAmount: 15000,
        orderName: '아메리카노 외 2건',
        customerName: '홍길동',
        customerPhone: '010-1234-5678',
        storeId: 1,
        seatId: 1,
        orderItems: [
          { menuId: 1, quantity: 2 },
          { menuId: 2, quantity: 1 }
        ],
        successUrl: 'http://localhost:3000/payment/success',
        failUrl: 'http://localhost:3000/payment/fail'
      };

      const mockResponse: PaymentResponse = {
        id: 1,
        orderIdToss: 'ORDER_1234567890',
        orderName: '아메리카노 외 2건',
        totalAmount: 15000,
        status: 'READY',
        customerName: '홍길동',
        successUrl: 'http://localhost:3000/payment/success',
        failUrl: 'http://localhost:3000/payment/fail'
      };

      mockPost.mockResolvedValue({
        data: {
          success: true,
          message: '결제 준비가 완료되었습니다.',
          data: mockResponse
        }
      });

      // When
      const result = await paymentService.preparePayment(request);

      // Then
      expect(mockPost).toHaveBeenCalledWith('/payments/prepare', request);
      expect(result).toEqual(mockResponse);
      expect(result.status).toBe('READY');
      expect(result.orderIdToss).toBe('ORDER_1234567890');
    });

    it('결제 준비 실패 시 에러 발생', async () => {
      // Given
      const request: CartPaymentRequest = {
        totalAmount: 0,
        orderName: '테스트 주문',
        customerName: '홍길동',
        customerPhone: '010-1234-5678',
        storeId: 1,
        seatId: 1,
        orderItems: [],
        successUrl: 'http://localhost:3000/payment/success',
        failUrl: 'http://localhost:3000/payment/fail'
      };

      mockPost.mockRejectedValue({
        response: {
          data: {
            success: false,
            message: '총 금액은 1원 이상이어야 합니다.'
          }
        }
      });

      // When & Then
      await expect(paymentService.preparePayment(request)).rejects.toThrow();
    });
  });

  describe('confirmPayment', () => {
    it('결제 승인 성공 시 PaymentResponse 반환', async () => {
      // Given
      const request: PaymentConfirmRequest = {
        paymentKey: 'payment_key_1234567890',
        orderId: 'ORDER_1234567890',
        amount: 15000
      };

      const mockResponse: PaymentResponse = {
        id: 1,
        orderId: 1,
        paymentKey: 'payment_key_1234567890',
        orderIdToss: 'ORDER_1234567890',
        orderName: '아메리카노 외 2건',
        totalAmount: 15000,
        status: 'DONE',
        method: '카드',
        approvedAt: '2024-12-13T10:00:00'
      };

      mockPost.mockResolvedValue({
        data: {
          success: true,
          message: '결제가 완료되었습니다.',
          data: mockResponse
        }
      });

      // When
      const result = await paymentService.confirmPayment(request);

      // Then
      expect(mockPost).toHaveBeenCalledWith('/payments/confirm', request);
      expect(result).toEqual(mockResponse);
      expect(result.status).toBe('DONE');
      expect(result.method).toBe('카드');
    });

    it('결제 승인 실패 시 에러 발생', async () => {
      // Given
      const request: PaymentConfirmRequest = {
        paymentKey: 'invalid_payment_key',
        orderId: 'ORDER_1234567890',
        amount: 15000
      };

      mockPost.mockRejectedValue({
        response: {
          data: {
            success: false,
            message: '결제 정보를 찾을 수 없습니다.'
          }
        }
      });

      // When & Then
      await expect(paymentService.confirmPayment(request)).rejects.toThrow();
    });
  });

  describe('getPaymentByKey', () => {
    it('paymentKey로 결제 정보 조회 성공', async () => {
      // Given
      const paymentKey = 'payment_key_1234567890';
      const mockResponse: PaymentResponse = {
        id: 1,
        paymentKey: 'payment_key_1234567890',
        orderIdToss: 'ORDER_1234567890',
        orderName: '아메리카노 외 2건',
        totalAmount: 15000,
        status: 'DONE'
      };

      mockGet.mockResolvedValue({
        data: {
          success: true,
          message: '결제 정보를 조회했습니다.',
          data: mockResponse
        }
      });

      // When
      const result = await paymentService.getPaymentByKey(paymentKey);

      // Then
      expect(mockGet).toHaveBeenCalledWith(`/payments/${paymentKey}`);
      expect(result).toEqual(mockResponse);
    });

    it('존재하지 않는 paymentKey 조회 시 에러 발생', async () => {
      // Given
      const paymentKey = 'non_existent_key';

      mockGet.mockRejectedValue({
        response: {
          data: {
            success: false,
            message: '결제 정보를 찾을 수 없습니다.'
          }
        }
      });

      // When & Then
      await expect(paymentService.getPaymentByKey(paymentKey)).rejects.toThrow();
    });
  });

  describe('getPaymentByOrderId', () => {
    it('orderId로 결제 정보 조회 성공', async () => {
      // Given
      const orderId = 'ORDER_1234567890';
      const mockResponse: PaymentResponse = {
        id: 1,
        orderId: 1,
        orderIdToss: 'ORDER_1234567890',
        orderName: '아메리카노 외 2건',
        totalAmount: 15000,
        status: 'DONE'
      };

      mockGet.mockResolvedValue({
        data: {
          success: true,
          message: '결제 정보를 조회했습니다.',
          data: mockResponse
        }
      });

      // When
      const result = await paymentService.getPaymentByOrderId(orderId);

      // Then
      expect(mockGet).toHaveBeenCalledWith(`/payments/order/${orderId}`);
      expect(result).toEqual(mockResponse);
    });
  });
});
