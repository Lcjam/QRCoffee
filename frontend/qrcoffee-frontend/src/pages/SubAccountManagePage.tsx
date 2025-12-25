import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Tabs,
  Tab
} from '@mui/material';
import { User } from '../types/auth';
import { SubAccountRequest } from '../types/user';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import SubAccountForm from '../components/SubAccountForm';
import SubAccountList from '../components/SubAccountList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const SubAccountManagePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [subAccounts, setSubAccounts] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // 마스터 계정만 접근 가능
    if (user && user.role !== 'MASTER') {
      navigate('/dashboard');
      return;
    }

    loadSubAccounts();
  }, [user, navigate]);

  const loadSubAccounts = async () => {
    try {
      setIsLoading(true);
      setError('');
      const subAccountsData = await userService.getSubAccounts();
      setSubAccounts(subAccountsData);
    } catch (err: any) {
      setError(err.message || '서브계정 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubAccount = async (subAccountData: SubAccountRequest) => {
    try {
      setIsCreating(true);
      await userService.createSubAccount(subAccountData);
      
      // 목록 새로고침
      await loadSubAccounts();
      
      // 목록 탭으로 이동
      setCurrentTab(0);
    } catch (err: any) {
      throw err; // SubAccountForm에서 처리
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleUserStatus = async (userId: number) => {
    try {
      await userService.toggleUserStatus(userId);
      
      // 목록 새로고침
      await loadSubAccounts();
    } catch (err: any) {
      setError(err.message || '사용자 상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
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
          서브계정 관리는 마스터 계정만 접근할 수 있습니다.
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
        <Typography color="text.primary">서브계정 관리</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          서브계정 관리
        </Typography>
        <Typography variant="body1" color="text.secondary">
          매장 직원을 위한 서브계정을 생성하고 관리할 수 있습니다.
        </Typography>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label={`서브계정 목록 (${subAccounts.length})`} />
          <Tab label="새 서브계정 생성" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        <SubAccountList
          subAccounts={subAccounts}
          isLoading={isLoading}
          error={error}
          onToggleStatus={handleToggleUserStatus}
          onRefresh={loadSubAccounts}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <SubAccountForm
          onSubmit={handleCreateSubAccount}
          isLoading={isCreating}
          onCancel={() => setCurrentTab(0)}
        />
      </TabPanel>
    </Container>
  );
};

export default SubAccountManagePage; 
