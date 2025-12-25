import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import { CreateSubAccountFormData, SubAccountRequest } from '../types/user';
import { validateSignupForm } from '../utils/validation';

interface SubAccountFormProps {
  onSubmit: (data: SubAccountRequest) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

const SubAccountForm: React.FC<SubAccountFormProps> = ({
  onSubmit,
  isLoading = false,
  onCancel
}) => {
  const [formData, setFormData] = useState<CreateSubAccountFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: ''
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = (): boolean => {
    const validation = validateSignupForm({
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      name: formData.name,
    });
    
    if (!validation.isValid) {
      setError(validation.error || '입력값 검증에 실패했습니다.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const { confirmPassword, ...subAccountData } = formData;
      await onSubmit(subAccountData);
      
      setSuccess('서브계정이 성공적으로 생성되었습니다.');
      setError('');
      
      // 폼 초기화
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: ''
      });
    } catch (err: any) {
      setError(err.message || '서브계정 생성 중 오류가 발생했습니다.');
      setSuccess('');
    }
  };

  const handleReset = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      phone: ''
    });
    setError('');
    setSuccess('');
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        서브계정 생성
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="이메일"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
            placeholder="example@company.com"
          />

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: '250px' }}>
              <TextField
                fullWidth
                label="비밀번호"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="최소 6자 이상"
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: '250px' }}>
              <TextField
                fullWidth
                label="비밀번호 확인"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="비밀번호 재입력"
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: '250px' }}>
              <TextField
                fullWidth
                label="이름"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="직원 이름"
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: '250px' }}>
              <TextField
                fullWidth
                label="전화번호"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="010-1234-5678"
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={onCancel || handleReset}
              disabled={isLoading}
            >
              {onCancel ? '취소' : '초기화'}
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : '서브계정 생성'}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};

export default SubAccountForm; 
