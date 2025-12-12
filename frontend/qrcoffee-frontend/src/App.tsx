import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import StoreManagePage from './pages/StoreManagePage';
import SubAccountManagePage from './pages/SubAccountManagePage';
import MenuManagePage from './pages/MenuManagePage';
import SeatManagePage from './pages/SeatManagePage';
import CustomerOrderPage from './pages/CustomerOrderPage';
import OrderCheckoutPage from './pages/OrderCheckoutPage';
import OrderCompletePage from './pages/OrderCompletePage';
import OrderStatusPage from './pages/OrderStatusPage';
import OrderManagePage from './pages/OrderManagePage';

// Material-UI 테마 설정
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
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
            <Route path="/order/complete" element={<OrderCompletePage />} />
            <Route path="/order/status/:orderId" element={<OrderStatusPage />} />
            
            {/* 루트 경로는 대시보드로 리다이렉트 */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 페이지 대신 대시보드로 리다이렉트 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
