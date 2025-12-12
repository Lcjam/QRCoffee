import React, { useEffect } from 'react';
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
  Chip,
  Alert
} from '@mui/material';
import { CheckCircle as CheckCircleIcon, Home as HomeIcon } from '@mui/icons-material';
import { Order, getOrderStatusText } from '../types/order';

const OrderCompletePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const order = location.state?.order as Order;

  useEffect(() => {
    if (!order) {
      navigate('/');
    }
  }, [order, navigate]);

  if (!order) {
    return null;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          주문이 완료되었습니다!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          주문 번호: {order.orderNumber}
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">주문 상태</Typography>
          <Chip
            label={getOrderStatusText(order.status as any)}
            color={order.status === 'PENDING' ? 'warning' : 'success'}
          />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
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

      {order.status === 'PENDING' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          주문이 접수되었습니다. 제조가 시작되면 알려드리겠습니다.
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => navigate(`/order/status/${order.id}`)}
        >
          주문 상태 확인
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

export default OrderCompletePage;

