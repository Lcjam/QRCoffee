import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { CartItem } from '../types/order';
import { Seat } from '../types/seat';
import { orderService } from '../services/orderService';

const OrderCheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { seat, cart, totalPrice } = location.state as {
    seat: Seat;
    cart: CartItem[];
    totalPrice: number;
  };

  const [customerRequest, setCustomerRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!seat || !cart || cart.length === 0) {
      navigate('/');
    }
  }, [seat, cart, navigate]);

  const handleOrder = async () => {
    try {
      setLoading(true);
      setError('');

      // 결제 페이지로 이동 (결제 후 주문 생성)
      navigate('/payment', {
        state: {
          seat,
          cart,
          totalPrice,
          customerRequest: customerRequest || undefined
        }
      });
    } catch (err: any) {
      setError(err.message || '주문 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!seat || !cart || cart.length === 0) {
    return null;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        주문 확인
      </Typography>

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
        
        <Typography variant="subtitle1" gutterBottom>
          주문 메뉴
        </Typography>
        <List>
          {cart.map((item) => (
            <ListItem key={item.menuId} disablePadding>
              <ListItemText
                primary={item.menuName}
                secondary={`${item.price.toLocaleString()}원 × ${item.quantity}개`}
              />
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {(item.price * item.quantity).toLocaleString()}원
              </Typography>
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">총 금액</Typography>
          <Typography variant="h6" color="primary">
            {totalPrice.toLocaleString()}원
          </Typography>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          요청사항 (선택)
        </Typography>
        <TextField
          fullWidth
          label="요청사항"
          value={customerRequest}
          onChange={(e) => setCustomerRequest(e.target.value)}
          multiline
          rows={3}
          disabled={loading}
          placeholder="예: 얼음 적게, 뜨거운 물 추가 등"
        />
      </Paper>

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
          onClick={handleOrder}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : '주문하기'}
        </Button>
      </Stack>
    </Container>
  );
};

export default OrderCheckoutPage;

