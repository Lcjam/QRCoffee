import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import { CheckCircle as CheckCircleIcon, Home as HomeIcon } from '@mui/icons-material';
import { paymentService } from '../services/paymentService';
import { PaymentResponse } from '../types/payment';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [payment, setPayment] = useState<PaymentResponse | null>(null);

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setError('결제 정보가 올바르지 않습니다.');
      setLoading(false);
      return;
    }

    confirmPayment();
  }, [paymentKey, orderId, amount]);

  const confirmPayment = async () => {
    try {
      setLoading(true);
      setError('');

      // 결제 승인 API 호출
      const response = await paymentService.confirmPayment({
        paymentKey: paymentKey!,
        orderId: orderId!,
        amount: Number(amount!)
      });

      setPayment(response);
    } catch (err: any) {
      setError(err.message || '결제 승인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress />
          <Typography>결제를 처리하고 있습니다...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate('/')}
        >
          홈으로 돌아가기
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          결제가 완료되었습니다!
        </Typography>
        
        {payment && (
          <Box sx={{ mt: 4, textAlign: 'left' }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  주문번호
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {payment.orderIdToss}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  결제 금액
                </Typography>
                <Typography variant="h6" color="primary">
                  {typeof payment.totalAmount === 'number' 
                    ? payment.totalAmount.toLocaleString() 
                    : Number(payment.totalAmount).toLocaleString()}원
                </Typography>
              </Box>
              
              {payment.method && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    결제 수단
                  </Typography>
                  <Typography variant="body1">
                    {payment.method}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        )}

        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
          >
            홈으로
          </Button>
          {payment?.orderId && (
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate(`/order/status/${payment.orderId}`)}
            >
              주문 확인
            </Button>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default PaymentSuccessPage;

