import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Card,
  CardContent
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        <Button
          variant="outlined"
          color="primary"
          onClick={handleLogout}
        >
          로그아웃
        </Button>
      </Paper>

      {/* 사용자 정보 카드 */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                사용자 정보
              </Typography>
              <Typography variant="body2" color="text.secondary">
                이메일: {user?.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                이름: {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                전화번호: {user?.phone || '미입력'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                계정 유형: {user?.role === 'MASTER' ? '마스터' : '서브'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                매장 ID: {user?.storeId}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                개발 현황
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                ✅ 2단계: 사용자 관리 시스템 완료
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                - 회원가입/로그인 기능
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                - JWT 기반 인증
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                - 인증 가드 적용
              </Typography>
              <Typography variant="body2" color="success.main" paragraph>
                ✅ 3단계: 매장 관리 시스템 완료
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                - 매장 정보 관리 기능
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                - 서브계정 관리 기능
              </Typography>
              <Typography variant="body2" color="warning.main">
                🚧 다음 단계: 메뉴 관리 시스템
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* 기능 메뉴 */}
      <Paper sx={{ p: 3 }}>
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
          <Button variant="outlined" disabled>
            메뉴 관리
          </Button>
          <Button variant="outlined" disabled>
            주문 관리
          </Button>
          <Button variant="outlined" disabled>
            QR코드 관리
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default DashboardPage; 