import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link
} from '@mui/material';
import { Store, StoreRequest } from '../types/store';
import { useAuth } from '../contexts/AuthContext';
import { storeService } from '../services/storeService';
import StoreInfoForm from '../components/StoreInfoForm';

const StoreManagePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // 마스터 계정만 접근 가능
    if (user && user.role !== 'MASTER') {
      navigate('/dashboard');
      return;
    }

    loadStoreData();
  }, [user, navigate]);

  const loadStoreData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const storeData = await storeService.getMyStore();
      setStore(storeData);
    } catch (err: any) {
      setError(err.message || '매장 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoreUpdate = async (storeData: StoreRequest) => {
    try {
      setIsSaving(true);
      const updatedStore = await storeService.updateMyStore(storeData);
      setStore(updatedStore);
    } catch (err: any) {
      throw err; // StoreInfoForm에서 처리
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (user.role !== 'MASTER') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          매장 관리는 마스터 계정만 접근할 수 있습니다.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/dashboard" underline="hover">
          대시보드
        </Link>
        <Typography color="text.primary">매장 관리</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          매장 관리
        </Typography>
        <Typography variant="body1" color="text.secondary">
          매장의 기본 정보와 운영 시간을 관리할 수 있습니다.
        </Typography>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        /* Store Form */
        <StoreInfoForm
          store={store}
          onSubmit={handleStoreUpdate}
          isLoading={isSaving}
        />
      )}
    </Container>
  );
};

export default StoreManagePage; 
