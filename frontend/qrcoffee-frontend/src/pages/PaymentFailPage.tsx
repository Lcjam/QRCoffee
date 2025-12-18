import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  Stack
} from '@mui/material';
import { Error as ErrorIcon, Home as HomeIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const PaymentFailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // 토스페이먼츠 결제창이 전달하는 파라미터: code, message, orderId
  const errorCode = searchParams.get('code') || searchParams.get('errorCode');
  const errorMessage = searchParams.get('message') || searchParams.get('errorMessage');
  const orderId = searchParams.get('orderId');

  const getErrorMessage = () => {
    if (errorMessage) {
      return errorMessage;
    }
    
    switch (errorCode) {
      case 'PAY_PROCESS_CANCELED':
      case 'USER_CANCEL':
        return '결제가 취소되었습니다.';
      case 'PAY_PROCESS_ABORTED':
        return '결제가 중단되었습니다.';
      case 'REJECT_CARD_COMPANY':
      case 'INVALID_CARD':
        return '유효하지 않은 카드 정보입니다.';
      case 'INSUFFICIENT_FUNDS':
        return '잔액이 부족합니다.';
      default:
        return '결제에 실패했습니다. 다시 시도해주세요.';
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          결제 실패
        </Typography>
        
        <Alert severity="error" sx={{ mt: 3, mb: 3 }}>
          {getErrorMessage()}
        </Alert>

        {errorCode && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            에러 코드: {errorCode}
          </Typography>
        )}

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            돌아가기
          </Button>
          <Button
            variant="contained"
            fullWidth
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
          >
            홈으로
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default PaymentFailPage;

