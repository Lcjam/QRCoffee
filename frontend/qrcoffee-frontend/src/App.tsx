import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './components/MainLayout';
import NewLoginPage from './pages/NewLoginPage';
import SignupPage from './pages/SignupPage';
import NewDashboardPage from './pages/NewDashboardPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import StoreManagePage from './pages/StoreManagePage';
import SubAccountManagePage from './pages/SubAccountManagePage';
import MenuManagePage from './pages/MenuManagePage';
import SeatManagePage from './pages/SeatManagePage';
import OrderManagePage from './pages/OrderManagePage';
import CustomerOrderPage from './pages/CustomerOrderPage';
import OrderStatusPage from './pages/OrderStatusPage';
import PaymentPage from './pages/PaymentPage';
import CartPaymentPage from './pages/CartPaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailPage from './pages/PaymentFailPage';

// Ant Design 테마 설정
const theme = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    borderRadius: 6,
    wireframe: false,
  },
  components: {
    Layout: {
      bodyBg: '#f0f2f5',
      headerBg: '#fff',
      siderBg: '#001529',
    },
    Menu: {
      darkItemBg: '#001529',
      darkItemSelectedBg: '#1890ff',
    },
  },
};

function App() {
  return (
    <ConfigProvider locale={koKR} theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* 공개 라우트 */}
            <Route path="/login" element={<NewLoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* 고객용 주문 페이지 (인증 불필요) */}
            <Route path="/order" element={<CustomerOrderPage />} />
            
            {/* 주문 상태 조회 페이지 (인증 불필요) */}
            <Route path="/order-status" element={<OrderStatusPage />} />
            
            {/* 결제 페이지 (인증 불필요) */}
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/payment/cart" element={<CartPaymentPage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/payment/fail" element={<PaymentFailPage />} />
            
            {/* 보호된 라우트 - MainLayout 적용 */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <MainLayout>
                    <NewDashboardPage />
                  </MainLayout>
                </PrivateRoute>
              } 
            />
            
            {/* 매장 관리 페이지 (마스터만) */}
            <Route 
              path="/store-management" 
              element={
                <PrivateRoute>
                  <MainLayout>
                    <StoreManagePage />
                  </MainLayout>
                </PrivateRoute>
              } 
            />
            
            {/* 서브계정 관리 페이지 (마스터만) */}
            <Route 
              path="/sub-account-management" 
              element={
                <PrivateRoute>
                  <MainLayout>
                    <SubAccountManagePage />
                  </MainLayout>
                </PrivateRoute>
              } 
            />
            
            {/* 메뉴 관리 페이지 */}
            <Route 
              path="/menu-management" 
              element={
                <PrivateRoute>
                  <MainLayout>
                    <MenuManagePage />
                  </MainLayout>
                </PrivateRoute>
              } 
            />
            
            {/* 좌석 관리 페이지 */}
            <Route 
              path="/seat-management" 
              element={
                <PrivateRoute>
                  <MainLayout>
                    <SeatManagePage />
                  </MainLayout>
                </PrivateRoute>
              } 
            />
            
            {/* 주문 관리 페이지 */}
            <Route 
              path="/order-management" 
              element={
                <PrivateRoute>
                  <MainLayout>
                    <OrderManagePage />
                  </MainLayout>
                </PrivateRoute>
              } 
            />
            
            {/* 루트 경로는 대시보드로 리다이렉트 */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 페이지 대신 대시보드로 리다이렉트 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
