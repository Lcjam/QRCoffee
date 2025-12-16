import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PaymentPage from '../PaymentPage';
import { paymentService } from '../../services/paymentService';
import { CartItem } from '../../types/order';
import { Seat } from '../../types/seat';
import { PaymentResponse } from '../../types/payment';

// 모킹
jest.mock('../../services/paymentService');

// 테스트 데이터
const mockSeat: Seat = {
  id: 1,
  storeId: 1,
  seatNumber: 'A1',
  qrCode: 'test-qr-code',
  isActive: true
};

const mockCart: CartItem[] = [
  {
    menuId: 1,
    menuName: '아메리카노',
    price: 5000,
    quantity: 2,
    options: []
  },
  {
    menuId: 2,
    menuName: '카페라떼',
    price: 5000,
    quantity: 1,
    options: []
  }
];

const mockPaymentResponse: PaymentResponse = {
  id: 1,
  orderIdToss: 'ORDER_1234567890',
  orderName: '아메리카노 외 1건',
  totalAmount: 15000,
  status: 'READY',
  customerName: '홍길동',
  successUrl: 'http://localhost:3000/payment/success',
  failUrl: 'http://localhost:3000/payment/fail'
};

// Mock react-router-dom hooks
const mockNavigate = jest.fn();
const mockLocation = {
  state: {
    seat: mockSeat,
    cart: mockCart,
    totalPrice: 15000,
    customerName: '홍길동',
    customerPhone: '010-1234-5678',
    customerRequest: '얼음 적게'
  }
};

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
    useSearchParams: () => [new URLSearchParams(), jest.fn()]
  };
});

// 토스페이먼츠 SDK 모킹
const mockWidgets = {
  setAmount: jest.fn().mockResolvedValue(undefined),
  renderPaymentMethods: jest.fn().mockResolvedValue({
    on: jest.fn()
  }),
  requestPayment: jest.fn().mockResolvedValue(undefined)
};

const mockTossPayments = jest.fn(() => ({
  widgets: jest.fn(() => mockWidgets)
}));

describe('PaymentPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // TossPayments 모킹
    (window as any).TossPayments = mockTossPayments;
    
    // SDK 스크립트 로드 모킹
    const originalCreateElement = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'script') {
        const script = originalCreateElement('script');
        // 비동기로 onload 호출
        setTimeout(() => {
          if (script.onload) {
            (script.onload as any)({} as Event);
          }
        }, 0);
        return script;
      }
      return originalCreateElement(tagName);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('결제 준비 성공 시 결제 위젯 렌더링', async () => {
    // Given
    (paymentService.preparePayment as jest.Mock).mockResolvedValue(mockPaymentResponse);

    // When
    render(
      <BrowserRouter>
        <PaymentPage />
      </BrowserRouter>
    );

    // Then
    await waitFor(() => {
      expect(paymentService.preparePayment).toHaveBeenCalled();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(paymentService.preparePayment).toHaveBeenCalledWith(
        expect.objectContaining({
          totalAmount: 15000,
          customerName: '홍길동',
          customerPhone: '010-1234-5678',
          storeId: 1,
          seatId: 1
        })
      );
    }, { timeout: 3000 });
  });

  it('결제 준비 실패 시 에러 메시지 표시', async () => {
    // Given
    (paymentService.preparePayment as jest.Mock).mockRejectedValue(
      new Error('결제 준비에 실패했습니다.')
    );

    // When
    render(
      <BrowserRouter>
        <PaymentPage />
      </BrowserRouter>
    );

    // Then
    await waitFor(() => {
      expect(screen.getByText(/결제 준비에 실패했습니다/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('주문 정보 표시', () => {
    // Given
    (paymentService.preparePayment as jest.Mock).mockResolvedValue(mockPaymentResponse);

    // When
    render(
      <BrowserRouter>
        <PaymentPage />
      </BrowserRouter>
    );

    // Then
    expect(screen.getByText('결제하기')).toBeInTheDocument();
    expect(screen.getByText(/좌석: A1/i)).toBeInTheDocument();
    expect(screen.getByText(/15000원/i)).toBeInTheDocument();
  });
});
