import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Tooltip,
  Badge,
  Drawer
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as LocalShippingIcon,
  Notifications as NotificationsIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Order, OrderStatus, getOrderStatusText, getPaymentStatusText } from '../types/order';
import { NotificationProvider, useNotification } from '../contexts/NotificationContext';
import { NotificationUserType } from '../types/notification';
import { orderService } from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const OrderManagePageContent: React.FC = () => {
  const { unreadCount, notifications, markAsRead, refreshNotifications } = useNotification();
  const [tabValue, setTabValue] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusChangeOpen, setStatusChangeOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('PREPARING');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  // 알림 수신 시 주문 목록 새로고침
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      // 주문 접수 알림이면 주문 목록 새로고침
      if (latestNotification.notificationType === 'ORDER_RECEIVED') {
        loadOrders();
      }
    }
  }, [notifications]);

  useEffect(() => {
    filterOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, tabValue]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const ordersData = await orderService.getOrdersByStore();
      setOrders(ordersData);
    } catch (err: any) {
      setError(err.message || '주문 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (tabValue === 0) {
      // 전체
      setFilteredOrders(orders);
    } else {
      // 상태별 필터링
      const statusMap: { [key: number]: OrderStatus } = {
        1: 'PENDING',
        2: 'PREPARING',
        3: 'COMPLETED',
        4: 'PICKED_UP',
        5: 'CANCELLED'
      };
      const targetStatus = statusMap[tabValue];
      setFilteredOrders(orders.filter(order => order.status === targetStatus));
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const handleStatusChange = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(getNextStatus(order.status as OrderStatus));
    setStatusChangeOpen(true);
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus => {
    const statusFlow: { [key in OrderStatus]?: OrderStatus } = {
      PENDING: 'PREPARING',
      PREPARING: 'COMPLETED',
      COMPLETED: 'PICKED_UP'
    };
    return statusFlow[currentStatus] || currentStatus;
  };

  const confirmStatusChange = async () => {
    if (!selectedOrder) return;

    try {
      setLoading(true);
      await orderService.updateOrderStatus(selectedOrder.id, newStatus);
      setStatusChangeOpen(false);
      await loadOrders();
      await refreshNotifications(); // 알림 목록 새로고침
    } catch (err: any) {
      setError(err.message || '주문 상태 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PREPARING':
        return <PlayArrowIcon />;
      case 'COMPLETED':
        return <CheckCircleIcon />;
      case 'PICKED_UP':
        return <LocalShippingIcon />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          주문 관리
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton
            color="inherit"
            onClick={() => setNotificationDrawerOpen(true)}
            sx={{ position: 'relative' }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadOrders}
            disabled={loading}
          >
            새로고침
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={`전체 (${orders.length})`} />
          <Tab label={`주문접수 (${orders.filter(o => o.status === 'PENDING').length})`} />
          <Tab label={`제조중 (${orders.filter(o => o.status === 'PREPARING').length})`} />
          <Tab label={`제조완료 (${orders.filter(o => o.status === 'COMPLETED').length})`} />
          <Tab label={`수령완료 (${orders.filter(o => o.status === 'PICKED_UP').length})`} />
          <Tab label={`취소됨 (${orders.filter(o => o.status === 'CANCELLED').length})`} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : filteredOrders.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                주문이 없습니다.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>주문번호</TableCell>
                    <TableCell>좌석</TableCell>
                    <TableCell>주문내역</TableCell>
                    <TableCell>총액</TableCell>
                    <TableCell>주문상태</TableCell>
                    <TableCell>결제상태</TableCell>
                    <TableCell>주문시간</TableCell>
                    <TableCell align="center">관리</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>{order.orderNumber}</TableCell>
                      <TableCell>{order.seatNumber || '-'}</TableCell>
                      <TableCell>
                        {order.orderItems.length}개 메뉴
                      </TableCell>
                      <TableCell>{Number(order.totalAmount).toLocaleString()}원</TableCell>
                      <TableCell>
                        <Chip
                          label={getOrderStatusText(order.status as OrderStatus)}
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getPaymentStatusText(order.paymentStatus as any)}
                          color={order.paymentStatus === 'PAID' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="상세보기">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetail(order)}
                            color="primary"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        {order.status !== 'CANCELLED' && order.status !== 'PICKED_UP' && (
                          <Tooltip title="상태 변경">
                            <IconButton
                              size="small"
                              onClick={() => handleStatusChange(order)}
                              color="success"
                            >
                              {getStatusIcon(order.status)}
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {[1, 2, 3, 4, 5].map((index) => (
          <TabPanel key={index} value={tabValue} index={index}>
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : filteredOrders.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  해당 상태의 주문이 없습니다.
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>주문번호</TableCell>
                      <TableCell>좌석</TableCell>
                      <TableCell>주문내역</TableCell>
                      <TableCell>총액</TableCell>
                      <TableCell>결제상태</TableCell>
                      <TableCell>주문시간</TableCell>
                      <TableCell align="center">관리</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell>{order.orderNumber}</TableCell>
                        <TableCell>{order.seatNumber || '-'}</TableCell>
                        <TableCell>
                          {order.orderItems.length}개 메뉴
                        </TableCell>
                        <TableCell>{Number(order.totalAmount).toLocaleString()}원</TableCell>
                        <TableCell>
                          <Chip
                            label={getPaymentStatusText(order.paymentStatus as any)}
                            color={order.paymentStatus === 'PAID' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="상세보기">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetail(order)}
                              color="primary"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          {order.status !== 'CANCELLED' && order.status !== 'PICKED_UP' && (
                            <Tooltip title="상태 변경">
                              <IconButton
                                size="small"
                                onClick={() => handleStatusChange(order)}
                                color="success"
                              >
                                {getStatusIcon(order.status)}
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        ))}
      </Paper>

      {/* 주문 상세 다이얼로그 */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>주문 상세 정보</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">주문번호</Typography>
                <Typography variant="h6">{selectedOrder.orderNumber}</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">좌석</Typography>
                <Typography variant="body1">{selectedOrder.seatNumber || '-'}</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">주문 상태</Typography>
                <Chip
                  label={getOrderStatusText(selectedOrder.status as OrderStatus)}
                  color={getStatusColor(selectedOrder.status)}
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                주문 내역
              </Typography>
              <List>
                {selectedOrder.orderItems.map((item, index) => (
                  <ListItem key={index}>
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
                  {Number(selectedOrder.totalAmount).toLocaleString()}원
                </Typography>
              </Box>
              
              {selectedOrder.customerRequest && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      요청사항
                    </Typography>
                    <Typography variant="body1">{selectedOrder.customerRequest}</Typography>
                  </Box>
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* 주문 상태 변경 다이얼로그 */}
      <Dialog open={statusChangeOpen} onClose={() => setStatusChangeOpen(false)}>
        <DialogTitle>주문 상태 변경</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" gutterBottom>
                주문번호: {selectedOrder.orderNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                현재 상태: {getOrderStatusText(selectedOrder.status as OrderStatus)}
              </Typography>
              
              <FormControl fullWidth>
                <InputLabel>변경할 상태</InputLabel>
                <Select
                  value={newStatus}
                  label="변경할 상태"
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                >
                  <MenuItem value="PREPARING">제조시작</MenuItem>
                  <MenuItem value="COMPLETED">제조완료</MenuItem>
                  <MenuItem value="PICKED_UP">수령완료</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusChangeOpen(false)} disabled={loading}>
            취소
          </Button>
          <Button onClick={confirmStatusChange} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : '변경'}
          </Button>
        </DialogActions>
        </Dialog>

        {/* 알림 Drawer */}
        <Drawer
          anchor="right"
          open={notificationDrawerOpen}
          onClose={() => setNotificationDrawerOpen(false)}
        >
          <Box sx={{ width: 400, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">알림</Typography>
              <IconButton onClick={() => setNotificationDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {notifications.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                알림이 없습니다.
              </Typography>
            ) : (
              <List>
                {notifications.map((notification) => (
                  <ListItem
                    key={notification.id}
                    disablePadding
                    sx={{
                      bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                      mb: 1
                    }}
                  >
                    <ListItemButton
                      onClick={async () => {
                        if (!notification.isRead) {
                          await markAsRead(notification.id);
                        }
                      }}
                    >
                      <ListItemText
                        primary={DOMPurify.sanitize(notification.message, {
                          ALLOWED_TAGS: [],
                          ALLOWED_ATTR: []
                        })}
                        secondary={new Date(notification.sentAt).toLocaleString('ko-KR')}
                      />
                      {!notification.isRead && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            ml: 1
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Drawer>
      </Container>
    );
  };

const OrderManagePage: React.FC = () => {
  const { user } = useAuth();
  
  if (!user || !user.storeId) {
    return null;
  }

  return (
    <NotificationProvider userType={NotificationUserType.ADMIN} storeId={user.storeId}>
      <OrderManagePageContent />
    </NotificationProvider>
  );
};
  
export default OrderManagePage;

