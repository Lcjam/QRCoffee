import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Stack,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material';
import { Store, StoreRequest, BusinessHours } from '../types/store';

interface StoreInfoFormProps {
  store: Store | null;
  onSubmit: (data: StoreRequest) => Promise<void>;
  isLoading?: boolean;
}

const StoreInfoForm: React.FC<StoreInfoFormProps> = ({
  store,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<StoreRequest>({
    name: '',
    address: '',
    phone: '',
    businessHours: '',
    isActive: true
  });
  const [businessHours, setBusinessHours] = useState<BusinessHours>({});
  const [activeDays, setActiveDays] = useState<{[key: string]: boolean}>({});
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name,
        address: store.address || '',
        phone: store.phone || '',
        businessHours: store.businessHours || '',
        isActive: store.isActive
      });

      // businessHours JSON 파싱
      if (store.businessHours) {
        try {
          const parsedHours = JSON.parse(store.businessHours);
          setBusinessHours(parsedHours);
          
          // 활성화된 요일 설정
          const activeDaysObj: {[key: string]: boolean} = {};
          Object.keys(parsedHours).forEach(day => {
            activeDaysObj[day] = Boolean(parsedHours[day]);
          });
          setActiveDays(activeDaysObj);
        } catch (e) {
          console.warn('Failed to parse business hours:', e);
        }
      }
    }
  }, [store]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    
    if (name === 'isActive') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleDayToggle = (day: string, checked: boolean) => {
    setActiveDays(prev => ({ ...prev, [day]: checked }));
    if (!checked) {
      // 체크 해제시 영업시간도 제거
      setBusinessHours(prev => {
        const newHours = { ...prev };
        delete newHours[day as keyof BusinessHours];
        return newHours;
      });
    }
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleTimeChange = (day: string, type: 'open' | 'close', value: string) => {
    setBusinessHours(prev => {
      const currentHours = prev[day as keyof BusinessHours] || '';
      const [openTime, closeTime] = currentHours.split('-');
      
      if (type === 'open') {
        return { ...prev, [day]: `${value}-${closeTime || '22:00'}` };
      } else {
        return { ...prev, [day]: `${openTime || '09:00'}-${value}` };
      }
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  // 시간 옵션 생성 (30분 단위)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('매장명은 필수입니다.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const businessHoursJson = Object.keys(businessHours).length > 0 
        ? JSON.stringify(businessHours) 
        : formData.businessHours;

      await onSubmit({
        ...formData,
        businessHours: businessHoursJson
      });
      
      setSuccess('매장 정보가 성공적으로 수정되었습니다.');
      setError('');
    } catch (err: any) {
      setError(err.message || '매장 정보 수정 중 오류가 발생했습니다.');
      setSuccess('');
    }
  };

  const daysOfWeek = [
    { key: 'mon', label: '월요일' },
    { key: 'tue', label: '화요일' },
    { key: 'wed', label: '수요일' },
    { key: 'thu', label: '목요일' },
    { key: 'fri', label: '금요일' },
    { key: 'sat', label: '토요일' },
    { key: 'sun', label: '일요일' }
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        매장 정보 수정
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
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: '300px' }}>
              <TextField
                fullWidth
                label="매장명"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: '300px' }}>
              <TextField
                fullWidth
                label="전화번호"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={isLoading}
              />
            </Box>
          </Box>

          <TextField
            fullWidth
            label="주소"
            name="address"
            value={formData.address}
            onChange={handleChange}
            multiline
            rows={2}
            disabled={isLoading}
          />

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              영업시간
            </Typography>
            <Stack spacing={2}>
              {daysOfWeek.map(({ key, label }) => {
                const isActive = activeDays[key] || false;
                const currentHours = businessHours[key as keyof BusinessHours] || '';
                const [openTime, closeTime] = currentHours.split('-');
                
                return (
                  <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isActive}
                          onChange={(e) => handleDayToggle(key, e.target.checked)}
                          disabled={isLoading}
                        />
                      }
                      label={label}
                      sx={{ minWidth: '100px' }}
                    />
                    
                    {isActive && (
                      <>
                        <FormControl size="small" sx={{ minWidth: '100px' }}>
                          <InputLabel>오픈</InputLabel>
                          <Select
                            value={openTime || '09:00'}
                            onChange={(e) => handleTimeChange(key, 'open', e.target.value)}
                            disabled={isLoading}
                            label="오픈"
                          >
                            {timeOptions.map(time => (
                              <MenuItem key={time} value={time}>{time}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        
                        <Typography>~</Typography>
                        
                        <FormControl size="small" sx={{ minWidth: '100px' }}>
                          <InputLabel>마감</InputLabel>
                          <Select
                            value={closeTime || '22:00'}
                            onChange={(e) => handleTimeChange(key, 'close', e.target.value)}
                            disabled={isLoading}
                            label="마감"
                          >
                            {timeOptions.map(time => (
                              <MenuItem key={time} value={time}>{time}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </>
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={handleChange}
                name="isActive"
                disabled={isLoading}
              />
            }
            label="매장 활성화"
          />

          <Box>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mr: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : '매장 정보 수정'}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};

export default StoreInfoForm; 