import React from 'react';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom color="error">
            접근 권한이 없습니다
          </Typography>
          
          <Typography variant="body1" sx={{ mt: 2, mb: 4 }} color="text.secondary">
            이 페이지에 접근하려면 마스터 계정 권한이 필요합니다.
            <br />
            현재 로그인된 계정: {user?.email} ({user?.role === 'MASTER' ? '마스터' : '서브'} 계정)
          </Typography>
          
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            대시보드로 돌아가기
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage; 