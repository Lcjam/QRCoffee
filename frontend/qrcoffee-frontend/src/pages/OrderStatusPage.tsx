import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Chip,
  Alert,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import { Home as HomeIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { Order, getOrderStatusText, getPaymentStatusText } from '../types/order';
import { orderService } from '../services/orderService';

const OrderStatusPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  useEffect(() => {
    if (!autoRefresh || !order) return;

    // 주문이 완료되거나 취소되면 자동 새로고침 중지
    if (order.status === 'COMPLETED' || order.status === 'PICKED_UP' || order.status === 'CANCELLED') {
      setAutoRefresh(false);
      return;
    }

    // 5초마다 주문 상태 확인
    const interval = setInterval(() => {
      if (orderId) {
        loadOrder();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, order, orderId]);

  const loadOrder = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError('');
      const orderData = await orderService.getOrder(Number(orderId));
      setOrder(orderData);
    } catch (err: any) {
      setError(err.message || '주문 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!order || !window.confirm('정말로 주문을 취소하시겠습니까?')) {
      return;
    }

    try {
      await orderService.cancelOrder(order.id);
      await loadOrder();
    } catch (err: any) {
      alert(err.message || '주문 취소에 실패했습니다.');
    }
  };

  const getStatusProgress = (status: string): number => {
    const statusMap: { [key: string]: number } = {
      PENDING: 25,
      PREPARING: 50,
      COMPLETED: 75,
      PICKED_UP: 100,
      CANCELLED: 0
    };
    return statusMap[status] || 0;
  };

  const getStatusColor = (status: string): 'warning' | 'info' | 'success' | 'error' | 'default' => {
    const colorMap: { [key: string]: 'warning' | 'info' | 'success' | 'error' | 'default' } = {
      PENDING: 'warning',
      PREPARING: 'info',
      COMPLETED: 'success',
      PICKED_UP: 'success',
      CANCELLED: 'error'
    };
    return colorMap[status] || 'default';
  };

  if (loading && !order) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !order) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          홈으로 돌아가기
        </Button>
      </Container>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        주문 상태
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            주문 번호
          </Typography>
          <Typography variant="h6">{order.orderNumber}</Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1">주문 상태</Typography>
            <Chip
              label={getOrderStatusText(order.status as any)}
              color={getStatusColor(order.status)}
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={getStatusProgress(order.status)}
            sx={{ mt: 1, height: 8, borderRadius: 4 }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1">결제 상태</Typography>
            <Chip
              label={getPaymentStatusText(order.paymentStatus as any)}
              color={order.paymentStatus === 'PAID' ? 'success' : 'default'}
              size="small"
            />
          </Box>
        </Box>

        {order.seatNumber && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              좌석: {order.seatNumber}
            </Typography>
          </Box>
        )}

        {order.customerRequest && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              요청사항
            </Typography>
            <Typography variant="body1">{order.customerRequest}</Typography>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          주문 내역
        </Typography>
        <List>
          {order.orderItems.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemText
                primary={item.menuName}
                secondary={`${Number(item.unitPrice).toLocaleString()}원 × ${item.quantity}개`}
              />
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {Number(item.totalPrice).toLocaleString()}원
              </Typography>
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">총 금액</Typography>
          <Typography variant="h6" color="primary">
            {Number(order.totalAmount).toLocaleString()}원
          </Typography>
        </Box>
      </Paper>

      {order.status === 'COMPLETED' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          제조가 완료되었습니다! 카운터로 와서 수령해주세요.
        </Alert>
      )}

      {order.status === 'PENDING' && (
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={handleCancel}
          >
            주문 취소
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
            제조가 시작되기 전까지만 취소 가능합니다.
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadOrder}
          disabled={loading}
        >
          새로고침
        </Button>
        <Button
          variant="contained"
          fullWidth
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
        >
          홈으로
        </Button>
      </Box>
    </Container>
  );
};

export default OrderStatusPage;

