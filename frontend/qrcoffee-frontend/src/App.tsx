import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import theme from './theme';

// 코드 스플리팅: 관리자 페이지들 (인증 필요)
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const StoreManagePage = lazy(() => import('./pages/StoreManagePage'));
const SubAccountManagePage = lazy(() => import('./pages/SubAccountManagePage'));
const MenuManagePage = lazy(() => import('./pages/MenuManagePage'));
const SeatManagePage = lazy(() => import('./pages/SeatManagePage'));
const OrderManagePage = lazy(() => import('./pages/OrderManagePage'));

// 코드 스플리팅: 인증 페이지
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));

// 코드 스플리팅: 고객용 페이지 (공개, 모바일 최적화)
const CustomerOrderPage = lazy(() => import('./pages/CustomerOrderPage'));
const OrderCheckoutPage = lazy(() => import('./pages/OrderCheckoutPage'));
const OrderCompletePage = lazy(() => import('./pages/OrderCompletePage'));
const OrderStatusPage = lazy(() => import('./pages/OrderStatusPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const PaymentFailPage = lazy(() => import('./pages/PaymentFailPage'));

// 로딩 컴포넌트
const LoadingFallback = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="100vh"
    sx={{ bgcolor: 'background.default' }}
  >
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* 공개 라우트 */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* 보호된 라우트 */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                }
              />

              {/* 매장 관리 페이지 (마스터만) */}
              <Route
                path="/store-management"
                element={
                  <PrivateRoute>
                    <StoreManagePage />
                  </PrivateRoute>
                }
              />

              {/* 서브계정 관리 페이지 (마스터만) */}
              <Route
                path="/sub-account-management"
                element={
                  <PrivateRoute>
                    <SubAccountManagePage />
                  </PrivateRoute>
                }
              />

              {/* 메뉴 관리 페이지 */}
              <Route
                path="/menu-management"
                element={
                  <PrivateRoute>
                    <MenuManagePage />
                  </PrivateRoute>
                }
              />

              {/* 좌석 관리 페이지 */}
              <Route
                path="/seat-management"
                element={
                  <PrivateRoute>
                    <SeatManagePage />
                  </PrivateRoute>
                }
              />

              {/* 주문 관리 페이지 (관리자용) */}
              <Route
                path="/order-management"
                element={
                  <PrivateRoute>
                    <OrderManagePage />
                  </PrivateRoute>
                }
              />

              {/* 고객용 주문 페이지 (공개) */}
              <Route path="/order" element={<CustomerOrderPage />} />
              <Route path="/order/checkout" element={<OrderCheckoutPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/payment/success" element={<PaymentSuccessPage />} />
              <Route path="/payment/fail" element={<PaymentFailPage />} />
              <Route path="/order/complete" element={<OrderCompletePage />} />
              <Route path="/order/status/:orderId" element={<OrderStatusPage />} />

              {/* 루트 경로는 대시보드로 리다이렉트 */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* 404 페이지 대신 대시보드로 리다이렉트 */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
