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
