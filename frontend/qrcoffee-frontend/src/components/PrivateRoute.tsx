import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { PrivateRouteProps } from '../types/auth';

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requireMaster = false }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // 로딩 중일 때 스피너 표시
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 마스터 권한이 필요한데 서브 계정인 경우 접근 거부
  if (requireMaster && user?.role !== 'MASTER') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute; 
