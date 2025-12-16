import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PaymentSuccessPage from '../PaymentSuccessPage';
import { paymentService } from '../../services/paymentService';

// 모킹
jest.mock('../../services/paymentService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: () => [
    new URLSearchParams('?paymentKey=payment_key_123&orderId=ORDER_123&amount=15000'),
    jest.fn()
  ],
  useNavigate: () => jest.fn()
}));

describe('PaymentSuccessPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('결제 승인 성공 시 결제 정보 표시', async () => {
    // Given
    const mockPayment = {
      id: 1,
      orderId: 1,
      paymentKey: 'payment_key_123',
      orderIdToss: 'ORDER_123',
      orderName: '아메리카노 외 1건',
      totalAmount: 15000,
      status: 'DONE',
      method: '카드'
    };

    (paymentService.confirmPayment as jest.Mock).mockResolvedValue(mockPayment);

    // When
    render(
      <BrowserRouter>
        <PaymentSuccessPage />
      </BrowserRouter>
    );

    // Then
    await waitFor(() => {
      expect(paymentService.confirmPayment).toHaveBeenCalledWith({
        paymentKey: 'payment_key_123',
        orderId: 'ORDER_123',
        amount: 15000
      });
    });

    await waitFor(() => {
      expect(screen.getByText('결제가 완료되었습니다!')).toBeInTheDocument();
      expect(screen.getByText('ORDER_123')).toBeInTheDocument();
      expect(screen.getByText(/15000원/i)).toBeInTheDocument();
      expect(screen.getByText('카드')).toBeInTheDocument();
    });
  });

  it('결제 승인 실패 시 에러 메시지 표시', async () => {
    // Given
    (paymentService.confirmPayment as jest.Mock).mockRejectedValue(
      new Error('결제 승인에 실패했습니다.')
    );

    // When
    render(
      <BrowserRouter>
        <PaymentSuccessPage />
      </BrowserRouter>
    );

    // Then
    await waitFor(() => {
      expect(screen.getByText(/결제 승인에 실패했습니다/i)).toBeInTheDocument();
    });
  });

  it('필수 파라미터 누락 시 에러 표시', async () => {
    // Given - useSearchParams 모킹 수정 필요
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useSearchParams: () => [new URLSearchParams(), jest.fn()],
      useNavigate: () => jest.fn()
    }));

    // When
    render(
      <BrowserRouter>
        <PaymentSuccessPage />
      </BrowserRouter>
    );

    // Then
    await waitFor(() => {
      expect(screen.getByText(/결제 정보가 올바르지 않습니다/i)).toBeInTheDocument();
    });
  });

  it('로딩 중 CircularProgress 표시', () => {
    // Given
    (paymentService.confirmPayment as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // 무한 대기
    );

    // When
    render(
      <BrowserRouter>
        <PaymentSuccessPage />
      </BrowserRouter>
    );

    // Then
    expect(screen.getByText(/결제를 처리하고 있습니다/i)).toBeInTheDocument();
  });
});

