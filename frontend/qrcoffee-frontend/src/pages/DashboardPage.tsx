import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Badge,
  IconButton
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { DashboardStats } from '../types/dashboard';
import { NotificationProvider, useNotification } from '../contexts/NotificationContext';
import { NotificationUserType } from '../types/notification';
import { Notifications as NotificationsIcon } from '@mui/icons-material';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardPageContent: React.FC = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadDashboardStats();

    // 30초마다 통계 새로고침
    const interval = setInterval(() => {
      loadDashboardStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardStats = async () => {
    try {
      setError('');
      const data = await dashboardService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || '대시보드 통계를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 매출 차트 데이터
  const salesChartData = stats ? {
    labels: stats.salesStats.dailySales.map(d => {
      const date = new Date(d.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: '일별 매출',
        data: stats.salesStats.dailySales.map(d => d.amount),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  } : null;

  // 주문 현황 도넛 차트 데이터
  const orderStatusChartData = stats ? {
    labels: ['주문접수', '제조중', '제조완료', '수령완료', '취소됨'],
    datasets: [
      {
        data: [
          stats.orderStats.pendingCount,
          stats.orderStats.preparingCount,
          stats.orderStats.completedCount,
          stats.orderStats.pickedUpCount,
          stats.orderStats.cancelledCount
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 99, 132, 0.8)'
        ]
      }
    ]
  } : null;

  // 시간대별 주문 차트 데이터
  const hourlyChartData = stats ? {
    labels: stats.hourlyStats.map(h => `${h.hour}시`),
    datasets: [
      {
        label: '주문 수',
        data: stats.hourlyStats.map(h => h.orderCount),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      }
    ]
  } : null;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* 헤더 */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            QR Coffee 관리자 대시보드
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {user?.name}님, 환영합니다! ({user?.role === 'MASTER' ? '마스터' : '서브'} 계정)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <IconButton
            color="inherit"
            onClick={() => navigate('/order-management')}
            sx={{ position: 'relative' }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleLogout}
          >
            로그아웃
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* 기능 메뉴 - 상단 이동 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          관리 메뉴
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {user?.role === 'MASTER' && (
            <Button
              variant="contained"
              onClick={() => navigate('/store-management')}
            >
              매장 관리
            </Button>
          )}
          {user?.role === 'MASTER' && (
            <Button
              variant="contained"
              onClick={() => navigate('/sub-account-management')}
            >
              서브계정 관리
            </Button>
          )}
          <Button
            variant="contained"
            onClick={() => navigate('/menu-management')}
          >
            메뉴 관리
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/seat-management')}
          >
            좌석 관리
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/order-management')}
          >
            주문 관리
          </Button>
        </Box>
      </Paper>

      {stats && (
        <>
          {/* 기본 통계 카드 */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  오늘 주문 수
                </Typography>
                <Typography variant="h4">
                  {stats.basicStats.todayOrderCount.toLocaleString()}건
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  대기 중인 주문
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.basicStats.pendingOrderCount.toLocaleString()}건
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  오늘 매출
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.basicStats.todaySalesAmount.toLocaleString()}원
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  전체 주문 수
                </Typography>
                <Typography variant="h4">
                  {stats.basicStats.totalOrderCount.toLocaleString()}건
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* 매출 통계 카드 */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mb: 3 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                일별 매출 현황 (최근 7일)
              </Typography>
              <Box sx={{ mt: 2 }}>
                {salesChartData && <Bar data={salesChartData} options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context: any) => `${context.parsed.y.toLocaleString()}원`
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value: any) => `${value.toLocaleString()}원`
                      }
                    }
                  }
                }} />}
              </Box>
              <Box sx={{ mt: 3, display: 'flex', gap: 3, justifyContent: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">오늘</Typography>
                  <Typography variant="h6">{stats.salesStats.todaySales.toLocaleString()}원</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">이번 주</Typography>
                  <Typography variant="h6">{stats.salesStats.weekSales.toLocaleString()}원</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">이번 달</Typography>
                  <Typography variant="h6">{stats.salesStats.monthSales.toLocaleString()}원</Typography>
                </Box>
              </Box>
            </Paper>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                주문 현황
              </Typography>
              {orderStatusChartData && (
                <Box sx={{ mt: 2 }}>
                  <Doughnut data={orderStatusChartData} options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'bottom' }
                    }
                  }} />
                </Box>
              )}
              <Box sx={{ mt: 2 }}>
                <Chip label={`주문접수: ${stats.orderStats.pendingCount}건`} color="warning" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label={`제조중: ${stats.orderStats.preparingCount}건`} color="info" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label={`제조완료: ${stats.orderStats.completedCount}건`} color="success" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label={`수령완료: ${stats.orderStats.pickedUpCount}건`} color="success" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label={`취소: ${stats.orderStats.cancelledCount}건`} color="error" size="small" />
              </Box>
            </Paper>
          </Box>

          {/* 시간대별 통계 및 인기 메뉴 */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                시간대별 주문 현황 (오늘)
              </Typography>
              {hourlyChartData && (
                <Box sx={{ mt: 2 }}>
                  <Line data={hourlyChartData} options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    }
                  }} />
                </Box>
              )}
            </Paper>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                인기 메뉴 TOP 10
              </Typography>
              {stats.popularMenus.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>순위</TableCell>
                        <TableCell>메뉴명</TableCell>
                        <TableCell align="right">판매량</TableCell>
                        <TableCell align="right">매출</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.popularMenus.map((menu, index) => (
                        <TableRow key={menu.menuId}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{menu.menuName}</TableCell>
                          <TableCell align="right">{menu.totalQuantity}개</TableCell>
                          <TableCell align="right">{menu.totalRevenue.toLocaleString()}원</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  데이터가 없습니다.
                </Typography>
              )}
            </Paper>
          </Box>
        </>
      )}
    </Container>
  );
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user || !user.storeId) {
    return null;
  }

  return (
    <NotificationProvider userType={NotificationUserType.ADMIN} storeId={user.storeId}>
      <DashboardPageContent />
    </NotificationProvider>
  );
};

export default DashboardPage;
