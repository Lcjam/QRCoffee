import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  PersonOff as PersonOffIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { User } from '../types/auth';

interface SubAccountListProps {
  subAccounts: User[];
  isLoading?: boolean;
  error?: string;
  onToggleStatus?: (userId: number) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

const SubAccountList: React.FC<SubAccountListProps> = ({
  subAccounts,
  isLoading = false,
  error = '',
  onToggleStatus,
  onRefresh
}) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'MASTER':
        return 'primary';
      case 'SUB':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'MASTER':
        return '마스터';
      case 'SUB':
        return '서브';
      default:
        return role;
    }
  };

  const handleToggleStatus = async (userId: number) => {
    if (onToggleStatus) {
      try {
        await onToggleStatus(userId);
      } catch (err) {
        console.error('Failed to toggle user status:', err);
      }
    }
  };

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        {onRefresh && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton onClick={onRefresh} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Box>
        )}
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          서브계정 목록 ({subAccounts.length}명)
        </Typography>
        {onRefresh && (
          <Tooltip title="새로고침">
            <IconButton onClick={onRefresh} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : subAccounts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            등록된 서브계정이 없습니다.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            새로운 서브계정을 생성해보세요.
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>이메일</TableCell>
                <TableCell>이름</TableCell>
                <TableCell>전화번호</TableCell>
                <TableCell>권한</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>최근 로그인</TableCell>
                <TableCell>생성일</TableCell>
                {onToggleStatus && <TableCell align="center">관리</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {subAccounts.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleText(user.role)}
                      color={getRoleColor(user.role) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? '활성' : '비활성'}
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : '로그인 기록 없음'}
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  {onToggleStatus && (
                    <TableCell align="center">
                      <Tooltip title={user.isActive ? '계정 비활성화' : '계정 활성화'}>
                        <IconButton
                          onClick={() => handleToggleStatus(user.id)}
                          disabled={isLoading}
                          color={user.isActive ? 'warning' : 'success'}
                          size="small"
                        >
                          {user.isActive ? <PersonOffIcon /> : <PersonIcon />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default SubAccountList; 