import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Stack,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { Menu } from '../types/menu';
import { CartItem } from '../types/order';
import { publicMenuService } from '../services/menuService';
import { publicSeatService } from '../services/seatService';
import { Seat } from '../types/seat';

const CustomerOrderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const qrCode = searchParams.get('seat') || searchParams.get('qr');
  const [seat, setSeat] = useState<Seat | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<{ [key: number]: Menu[] }>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [customerRequest, setCustomerRequest] = useState('');
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [quantityDialogOpen, setQuantityDialogOpen] = useState(false);
  const [tempQuantity, setTempQuantity] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showCartButton, setShowCartButton] = useState(false);

  useEffect(() => {
    if (!qrCode) {
      setError('QR코드 정보가 없습니다.');
      setLoading(false);
      return;
    }

    loadSeatAndMenus(qrCode);
  }, [qrCode]);

  const loadSeatAndMenus = async (code: string) => {
    try {
      setLoading(true);
      setError('');

      // QR코드로 좌석 정보 조회
      const seatData = await publicSeatService.getSeatByQRCode(code);
      setSeat(seatData);

      // 매장의 메뉴 목록 조회
      const menusData = await publicMenuService.getMenusForCustomer(seatData.storeId);
      setMenus(menusData);

      // 카테고리별로 메뉴 그룹화
      const groupedMenus: { [key: number]: Menu[] } = {};
      menusData.forEach(menu => {
        if (!groupedMenus[menu.categoryId]) {
          groupedMenus[menu.categoryId] = [];
        }
        groupedMenus[menu.categoryId].push(menu);
      });
      setCategories(groupedMenus);

      // 첫 번째 카테고리 선택
      const firstCategoryId = Object.keys(groupedMenus)[0];
      if (firstCategoryId) {
        setSelectedCategory(Number(firstCategoryId));
      }
    } catch (err: any) {
      setError(err.message || '좌석 및 메뉴 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (menu: Menu) => {
    if (!menu.isAvailable) {
      return;
    }
    setSelectedMenu(menu);
    const existingItem = cart.find(item => item.menuId === menu.id);
    setTempQuantity(existingItem ? existingItem.quantity : 1);
    setQuantityDialogOpen(true);
  };

  const addToCart = (menu: Menu, quantity: number) => {
    const existingItem = cart.find(item => item.menuId === menu.id);

    if (existingItem) {
      setCart(cart.map(item =>
        item.menuId === menu.id
          ? { ...item, quantity: quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        menuId: menu.id,
        menuName: menu.name,
        price: Number(menu.price),
        quantity: quantity,
        imageUrl: menu.imageUrl
      }]);
    }
  };

  const handleAddToCart = () => {
    if (!selectedMenu) return;
    
    addToCart(selectedMenu, tempQuantity);
    setQuantityDialogOpen(false);
    setSnackbarMessage(`${selectedMenu.name} ${tempQuantity}개가 장바구니에 추가되었습니다.`);
    setSnackbarOpen(true);
    setShowCartButton(true);
    setSelectedMenu(null);
  };

  const handleOrderDirectly = () => {
    if (!selectedMenu || !seat) return;
    
    const singleItemCart: CartItem[] = [{
      menuId: selectedMenu.id,
      menuName: selectedMenu.name,
      price: Number(selectedMenu.price),
      quantity: tempQuantity,
      imageUrl: selectedMenu.imageUrl
    }];

    setQuantityDialogOpen(false);
    navigate('/payment', {
      state: {
        seat,
        cart: singleItemCart,
        totalPrice: Number(selectedMenu.price) * tempQuantity,
        customerRequest: undefined
      }
    });
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, tempQuantity + delta);
    setTempQuantity(newQuantity);
  };

  const removeFromCart = (menuId: number) => {
    setCart(cart.filter(item => item.menuId !== menuId));
  };

  const updateCartQuantity = (menuId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuId);
      return;
    }
    setCart(cart.map(item =>
      item.menuId === menuId ? { ...item, quantity } : item
    ));
  };

  const getTotalPrice = (): number => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleOrder = () => {
    if (cart.length === 0) {
      alert('장바구니가 비어있습니다.');
      return;
    }

    if (!seat) {
      alert('좌석 정보를 찾을 수 없습니다.');
      return;
    }

    setError('');

    // 결제 페이지로 바로 이동
    navigate('/payment', {
      state: {
        seat,
        cart,
        totalPrice: getTotalPrice(),
        customerRequest: customerRequest.trim() || undefined
      }
    });
  };

  const getFilteredMenus = (): Menu[] => {
    if (selectedCategory === null) {
      return menus;
    }
    return categories[selectedCategory] || [];
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/')}>
          홈으로 돌아가기
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ pb: 12, minHeight: '100vh' }}>
      {/* 헤더 */}
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          top: 0,
          zIndex: 1100,
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.3)'
        }}
      >
        <Toolbar>
          <IconButton 
            edge="start" 
            onClick={() => navigate('/')} 
            sx={{ 
              mr: 2, 
              color: 'text.primary',
              minWidth: 44,
              minHeight: 44,
              padding: 1.5
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'text.primary', fontWeight: 'bold' }}>
            {seat?.seatNumber ? `Table ${seat.seatNumber}` : 'Menu'}
          </Typography>
          <IconButton 
            onClick={() => setCartOpen(true)} 
            sx={{ 
              color: 'primary.main',
              minWidth: 44,
              minHeight: 44,
              padding: 1.5
            }}
          >
            <Badge badgeContent={cart.length} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 3, mb: 4 }}>
        {/* 카테고리 탭 */}
        {Object.keys(categories).length > 0 && (
          <Box sx={{ mb: 4, overflowX: 'auto', pb: 1 }}>
            <Stack direction="row" spacing={1.5}>
              <Button
                variant={selectedCategory === null ? 'contained' : 'text'}
                onClick={() => setSelectedCategory(null)}
                size="medium"
                sx={{
                  borderRadius: 100,
                  minWidth: 80,
                  fontWeight: 700,
                  color: selectedCategory === null ? 'white' : 'text.secondary',
                  backgroundColor: selectedCategory === null ? 'primary.main' : 'rgba(255,255,255,0.5)'
                }}
              >
                All
              </Button>
              {Object.keys(categories).map(categoryId => {
                const categoryMenus = categories[Number(categoryId)];
                const categoryName = categoryMenus[0]?.categoryName || `Category ${categoryId}`;
                const isSelected = selectedCategory === Number(categoryId);
                return (
                  <Button
                    key={categoryId}
                    variant={isSelected ? 'contained' : 'text'}
                    onClick={() => setSelectedCategory(Number(categoryId))}
                    size="medium"
                    sx={{
                      borderRadius: 100,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      color: isSelected ? 'white' : 'text.secondary',
                      backgroundColor: isSelected ? 'primary.main' : 'rgba(255,255,255,0.5)',
                      '&:hover': {
                        backgroundColor: isSelected ? 'primary.dark' : 'rgba(255,255,255,0.8)'
                      }
                    }}
                  >
                    {categoryName}
                  </Button>
                );
              })}
            </Stack>
          </Box>
        )}

        {/* 메뉴 목록 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 2.5 }}>
          {getFilteredMenus().map((menu) => (
            <Card
              key={menu.id}
              sx={{
                cursor: menu.isAvailable ? 'pointer' : 'not-allowed',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'visible',
                opacity: menu.isAvailable ? 1 : 0.6
              }}
              onClick={() => handleMenuClick(menu)}
            >
              <Box sx={{ position: 'relative', pt: '75%', borderRadius: 4, overflow: 'hidden', mx: 2, mt: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                {menu.imageUrl ? (
                  <CardMedia
                    component="img"
                    image={menu.imageUrl}
                    alt={menu.name}
                    loading="lazy"
                    sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', bgcolor: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.disabled">No Image</Typography>
                  </Box>
                )}
              </Box>

              <CardContent sx={{ flexGrow: 1, pt: 2, pb: 2 }}>
                <Typography variant="subtitle1" component="div" sx={{ fontWeight: 700, lineHeight: 1.3, mb: 0.5 }}>
                  {menu.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1.5, height: 32 }}>
                  {menu.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>
                    {Number(menu.price).toLocaleString()}
                  </Typography>
                  <Box 
                    sx={{ 
                      width: 44, 
                      height: 44, 
                      borderRadius: '50%', 
                      bgcolor: 'primary.main', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      boxShadow: '0 4px 10px rgba(108, 93, 211, 0.4)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:active': {
                        transform: 'scale(0.95)'
                      }
                    }}
                  >
                    <AddIcon sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                </Box>
                {!menu.isAvailable && (
                  <Chip
                    label="Sold Out"
                    color="error"
                    size="small"
                    sx={{ position: 'absolute', top: 10, right: 10, fontWeight: 'bold' }}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </Box>

        {getFilteredMenus().length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No menus available.
            </Typography>
          </Box>
        )}
      </Container>

      {/* 장바구니 Drawer */}
      <Drawer
        anchor="bottom"
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        PaperProps={{
          sx: {
            maxHeight: '80vh',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            장바구니 ({cart.length}개)
          </Typography>
          <Divider sx={{ my: 2 }} />

          {cart.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                장바구니가 비어있습니다.
              </Typography>
            </Box>
          ) : (
            <>
              <List>
                {cart.map((item) => (
                  <ListItem
                    key={item.menuId}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        onClick={() => removeFromCart(item.menuId)}
                        sx={{
                          minWidth: 44,
                          minHeight: 44,
                          padding: 1
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={item.menuName}
                      secondary={`${item.price.toLocaleString()}원 × ${item.quantity} = ${(item.price * item.quantity).toLocaleString()}원`}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                      <IconButton
                        onClick={() => updateCartQuantity(item.menuId, item.quantity - 1)}
                        sx={{
                          minWidth: 44,
                          minHeight: 44,
                          padding: 1
                        }}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography variant="body1" sx={{ minWidth: 30, textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        onClick={() => updateCartQuantity(item.menuId, item.quantity + 1)}
                        sx={{
                          minWidth: 44,
                          minHeight: 44,
                          padding: 1
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              {/* 요청사항 입력 */}
              <Paper sx={{ p: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="요청사항 (선택)"
                  value={customerRequest}
                  onChange={(e) => setCustomerRequest(e.target.value)}
                  multiline
                  rows={2}
                  placeholder="예: 얼음 적게, 뜨거운 물 추가 등"
                  inputProps={{
                    style: { fontSize: '16px' } // iOS 줌 방지
                  }}
                />
              </Paper>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">총 금액</Typography>
                  <Typography variant="h6" color="primary">
                    {getTotalPrice().toLocaleString()}원
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleOrder}
                  disabled={cart.length === 0}
                  sx={{
                    minHeight: 48,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    py: 1.5
                  }}
                >
                  주문하기
                </Button>
              </Paper>
            </>
          )}
        </Box>
      </Drawer>

      {/* 수량 설정 다이얼로그 */}
      <Dialog
        open={quantityDialogOpen}
        onClose={() => setQuantityDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            {selectedMenu?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedMenu?.description}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 2 }}>
            <Typography variant="h5" color="primary.main" fontWeight={800}>
              {selectedMenu && (Number(selectedMenu.price) * tempQuantity).toLocaleString()}원
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <IconButton
                onClick={() => handleQuantityChange(-1)}
                sx={{
                  minWidth: 48,
                  minHeight: 48,
                  border: '2px solid',
                  borderColor: 'primary.main',
                  color: 'primary.main'
                }}
              >
                <RemoveIcon />
              </IconButton>
              <Typography variant="h4" sx={{ minWidth: 60, textAlign: 'center', fontWeight: 700 }}>
                {tempQuantity}
              </Typography>
              <IconButton
                onClick={() => handleQuantityChange(1)}
                sx={{
                  minWidth: 48,
                  minHeight: 48,
                  border: '2px solid',
                  borderColor: 'primary.main',
                  color: 'primary.main'
                }}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', gap: 1, px: 2, pb: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            size="large"
            startIcon={<ShoppingCartIcon />}
            onClick={handleAddToCart}
            sx={{
              minHeight: 48,
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            담기
          </Button>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleOrderDirectly}
            sx={{
              minHeight: 48,
              fontSize: '1.1rem',
              fontWeight: 700
            }}
          >
            주문하기
          </Button>
        </DialogActions>
      </Dialog>

      {/* 담기 성공 스낵바 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%' }}
          action={
            showCartButton && (
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  setCartOpen(true);
                  setShowCartButton(false);
                }}
              >
                장바구니 가기
              </Button>
            )
          }
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerOrderPage;

