import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  QrCode as QrCodeIcon,
  TableBar as TableBarIcon,
  Person as PersonIcon,
  PersonOff as PersonOffIcon,
  PowerSettingsNew as PowerIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { Seat, SeatRequest, SeatStats } from '../types/seat';
import { seatService } from '../services/seatService';

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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SeatManagePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [stats, setStats] = useState<SeatStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모달 상태
  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const [editingSeat, setEditingSeat] = useState<Seat | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);

  // 폼 상태
  const [formData, setFormData] = useState<SeatRequest>({
    seatNumber: '',
    description: '',
    maxCapacity: 2,
  });

  useEffect(() => {
    fetchSeats();
    fetchStats();
  }, []);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      const seatsData = await seatService.getSeats();
      setSeats(seatsData);
      setError(null);
    } catch (err: any) {
      setError(err.message || '좌석 목록을 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await seatService.getStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('통계 조회 실패:', err);
    }
  };

  const handleCreateSeat = () => {
    setEditingSeat(null);
    setFormData({ seatNumber: '', description: '', maxCapacity: 2 });
    setSeatModalOpen(true);
  };

  const handleEditSeat = (seat: Seat) => {
    setEditingSeat(seat);
    setFormData({
      seatNumber: seat.seatNumber,
      description: seat.description || '',
      maxCapacity: seat.maxCapacity,
    });
    setSeatModalOpen(true);
  };

  const handleSaveSeat = async () => {
    try {
      setLoading(true);
      if (editingSeat) {
        await seatService.updateSeat(editingSeat.id, formData);
      } else {
        await seatService.createSeat(formData);
      }
      setSeatModalOpen(false);
      await fetchSeats();
      await fetchStats();
      setError(null);
    } catch (err: any) {
      setError(err.message || '좌석 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (seat: Seat) => {
    try {
      setLoading(true);
      await seatService.toggleSeatStatus(seat.id);
      await fetchSeats();
      await fetchStats();
      setError(null);
    } catch (err: any) {
      setError(err.message || '상태 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOccupancy = async (seat: Seat) => {
    try {
      setLoading(true);
      await seatService.toggleOccupancy(seat.id);
      await fetchSeats();
      await fetchStats();
      setError(null);
    } catch (err: any) {
      setError(err.message || '점유 상태 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateQR = async (seat: Seat) => {
    try {
      setLoading(true);
      await seatService.regenerateQRCode(seat.id);
      await fetchSeats();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'QR코드 재생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSeat = async (seat: Seat) => {
    if (!window.confirm(`좌석 ${seat.seatNumber}을(를) 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setLoading(true);
      await seatService.deleteSeat(seat.id);
      await fetchSeats();
      await fetchStats();
      setError(null);
    } catch (err: any) {
      setError(err.message || '좌석 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowQR = (seat: Seat) => {
    setSelectedSeat(seat);
    setQrModalOpen(true);
  };

  const getStatusChip = (seat: Seat) => {
    if (!seat.isActive) {
      return <Chip label="비활성" color="default" size="small" />;
    }
    if (seat.isOccupied) {
      return <Chip label="사용중" color="error" size="small" />;
    }
    return <Chip label="사용가능" color="success" size="small" />;
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        좌석 관리
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="좌석 현황" />
        <Tab label="좌석 관리" />
      </Tabs>

      <TabPanel value={activeTab} index={0}>
        {/* 통계 카드 */}
        {stats && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 4 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  전체 좌석
                </Typography>
                <Typography variant="h4" component="div">
                  {stats.totalSeats}
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  활성 좌석
                </Typography>
                <Typography variant="h4" component="div" color="primary">
                  {stats.activeSeats}
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  사용중
                </Typography>
                <Typography variant="h4" component="div" color="error">
                  {stats.occupiedSeats}
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  사용가능
                </Typography>
                <Typography variant="h4" component="div" color="success">
                  {stats.availableSeats}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* 좌석 현황 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
          {seats.map((seat) => (
            <Card key={seat.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{seat.seatNumber}</Typography>
                  {getStatusChip(seat)}
                </Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  최대 인원: {seat.maxCapacity}명
                </Typography>
                {seat.description && (
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {seat.description}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Tooltip title={seat.isOccupied ? '사용가능으로 변경' : '사용중으로 변경'}>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleOccupancy(seat)}
                      color={seat.isOccupied ? 'error' : 'success'}
                    >
                      {seat.isOccupied ? <PersonOffIcon /> : <PersonIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="QR코드 보기">
                    <IconButton size="small" onClick={() => handleShowQR(seat)}>
                      <QrCodeIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">좌석 목록</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateSeat}
          >
            좌석 추가
          </Button>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 2 }}>
          {seats.map((seat) => (
            <Card key={seat.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{seat.seatNumber}</Typography>
                  {getStatusChip(seat)}
                </Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  최대 인원: {seat.maxCapacity}명
                </Typography>
                {seat.description && (
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {seat.description}
                  </Typography>
                )}
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  QR코드: {seat.qrCode.substring(0, 8)}...
                </Typography>
                
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Tooltip title="편집">
                    <IconButton size="small" onClick={() => handleEditSeat(seat)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={seat.isActive ? '비활성화' : '활성화'}>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleStatus(seat)}
                      color={seat.isActive ? 'primary' : 'default'}
                    >
                      <PowerIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={seat.isOccupied ? '사용가능으로 변경' : '사용중으로 변경'}>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleOccupancy(seat)}
                      color={seat.isOccupied ? 'error' : 'success'}
                    >
                      {seat.isOccupied ? <PersonOffIcon /> : <PersonIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="QR코드 재생성">
                    <IconButton size="small" onClick={() => handleRegenerateQR(seat)}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="QR코드 보기">
                    <IconButton size="small" onClick={() => handleShowQR(seat)}>
                      <QrCodeIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="삭제">
                    <IconButton size="small" onClick={() => handleDeleteSeat(seat)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      </TabPanel>

      {/* 좌석 생성/수정 모달 */}
      <Dialog open={seatModalOpen} onClose={() => setSeatModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSeat ? '좌석 수정' : '좌석 추가'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="좌석 번호"
            fullWidth
            variant="outlined"
            value={formData.seatNumber}
            onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="설명 (선택사항)"
            fullWidth
            variant="outlined"
            multiline
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="최대 인원"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.maxCapacity}
            onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 1 })}
            inputProps={{ min: 1, max: 10 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSeatModalOpen(false)}>취소</Button>
          <Button 
            onClick={handleSaveSeat} 
            variant="contained"
            disabled={!formData.seatNumber.trim() || loading}
          >
            {loading ? <CircularProgress size={20} /> : (editingSeat ? '수정' : '추가')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR코드 보기 모달 */}
      <Dialog open={qrModalOpen} onClose={() => setQrModalOpen(false)}>
        <DialogTitle>QR코드 - {selectedSeat?.seatNumber}</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="body1" gutterBottom>
              QR코드: {selectedSeat?.qrCode}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              고객이 이 QR코드를 스캔하여 좌석을 확인할 수 있습니다.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrModalOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SeatManagePage; 