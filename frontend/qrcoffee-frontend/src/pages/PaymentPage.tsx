import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Stack,
  Divider
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { CartItem } from '../types/order';
import { Seat } from '../types/seat';
import { paymentService } from '../services/paymentService';
import { CartPaymentRequest, PaymentResponse } from '../types/payment';

// 토스페이먼츠 SDK 타입 선언
declare global {
  interface Window {
    TossPayments: any;
  }
}

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const { seat, cart, totalPrice, customerRequest } = location.state as {
    seat: Seat;
    cart: CartItem[];
    totalPrice: number;
    customerRequest?: string;
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
  const paymentRef = useRef<any>(null);

  // 토스페이먼츠 클라이언트 키 (환경 변수에서 가져오기) - API 개별 연동 키 사용
  const clientKey = process.env.REACT_APP_TOSS_CLIENT_KEY || '';

  useEffect(() => {
    if (!seat || !cart || cart.length === 0) {
      navigate('/');
      return;
    }

    // 토스페이먼츠 SDK 로드 및 결제 준비
    loadTossPaymentsSDK();
  }, []);

  const loadTossPaymentsSDK = async () => {
    try {
      // SDK가 이미 로드되어 있는지 확인
      if (window.TossPayments) {
        await initializePayment();
        return;
      }

      // SDK 스크립트 동적 로드
      const script = document.createElement('script');
      script.src = 'https://js.tosspayments.com/v2/standard';
      script.async = true;
      script.onload = async () => {
        await initializePayment();
      };
      script.onerror = () => {
        setError('토스페이먼츠 SDK를 불러올 수 없습니다.');
      };
      document.head.appendChild(script);
    } catch (err: any) {
      setError(err.message || '결제 초기화에 실패했습니다.');
    }
  };

  const initializePayment = async () => {
    try {
      setLoading(true);
      setError('');

      // 결제 준비 API 호출
      const orderName = cart.length === 1 
        ? cart[0].menuName 
        : `${cart[0].menuName} 외 ${cart.length - 1}건`;

      const prepareRequest: CartPaymentRequest = {
        totalAmount: totalPrice,
        orderName,
        customerName: '',
        customerPhone: '',
        storeId: seat.storeId,
        seatId: seat.id,
        orderItems: cart.map(item => ({
          menuId: item.menuId,
          quantity: item.quantity,
          options: item.options
        })),
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`
      };

      const response = await paymentService.preparePayment(prepareRequest);
      setPaymentResponse(response);

      // 토스페이먼츠 결제창 초기화 (API 개별 연동 키 사용)
      const tossPayments = window.TossPayments(clientKey);
      // 비회원 결제: TossPayments.ANONYMOUS 사용
      const payment = tossPayments.payment({
        customerKey: window.TossPayments?.ANONYMOUS || `customer_${Date.now()}`
      });
      paymentRef.current = payment;

      setLoading(false);
    } catch (err: any) {
      setError(err.message || '결제 준비에 실패했습니다.');
      setLoading(false);
    }
  };

  // 모바일 기기 감지 유틸리티
  const isMobileDevice = (): boolean => {
    // User-Agent 기반 감지
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    
    // 화면 크기 기반 감지 (보조)
    const isSmallScreen = window.innerWidth <= 768;
    
    // 터치 지원 여부 확인
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    return mobileRegex.test(userAgent) || (isSmallScreen && hasTouch);
  };

  const handlePayment = async () => {
    if (!paymentResponse || !paymentRef.current) {
      setError('결제 정보가 준비되지 않았습니다.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const isMobile = isMobileDevice();
      
      // 결제창 띄우기 (API 개별 연동 키 방식)
      // 토스페이먼츠는 User-Agent를 자동 감지하지만, 
      // 명시적으로 모바일 환경임을 알리기 위해 추가 정보 전달 가능
      await paymentRef.current.requestPayment({
        method: 'CARD', // 카드 결제
        amount: {
          currency: 'KRW',
          value: totalPrice
        },
        orderId: paymentResponse.orderIdToss,
        orderName: paymentResponse.orderName,
        successUrl: paymentResponse.successUrl || `${window.location.origin}/payment/success`,
        failUrl: paymentResponse.failUrl || `${window.location.origin}/payment/fail`,
        // 카드 결제 옵션
        card: {
          useEscrow: false,
          flowMode: 'DEFAULT', // 통합결제창 (모바일에서는 자동으로 모바일 UI 표시)
          useCardPoint: false,
          useAppCardOnly: false
        }
      });
    } catch (err: any) {
      setError(err.message || '결제 요청에 실패했습니다.');
      setLoading(false);
    }
  };

  if (!seat || !cart || cart.length === 0) {
    return null;
  }

  const isMobile = isMobileDevice();

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        결제하기
      </Typography>

      {/* 모바일 감지 정보 표시 (개발용, 나중에 제거 가능) */}
      {process.env.NODE_ENV === 'development' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {isMobile ? '📱 모바일 모드로 감지됨' : '💻 PC 모드로 감지됨'}
          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
            User-Agent: {navigator.userAgent.substring(0, 50)}...
          </Typography>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          주문 정보
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          좌석: {seat.seatNumber}
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1">총 결제 금액</Typography>
          <Typography variant="h6" color="primary">
            {totalPrice.toLocaleString()}원
          </Typography>
        </Box>
      </Paper>

      {loading && !paymentResponse && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {paymentResponse && (
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            돌아가기
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={handlePayment}
            disabled={loading}
            sx={{
              minHeight: 48,
              fontSize: '1.1rem',
              fontWeight: 700
            }}
          >
            {loading ? <CircularProgress size={24} /> : '결제하기'}
          </Button>
        </Stack>
      )}
    </Container>
  );
};

export default PaymentPage;

