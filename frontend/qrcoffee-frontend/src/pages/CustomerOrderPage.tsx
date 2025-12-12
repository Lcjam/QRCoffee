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
  Paper
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

  useEffect(() => {
    if (!qrCode) {
      setError('QR코드 정보가 없습니다.');
      setLoading(false);
      return;
    }

    loadSeatAndMenus();
  }, [qrCode]);

  const loadSeatAndMenus = async () => {
    if (!qrCode) {
      setError('QR코드 정보가 없습니다.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // QR코드로 좌석 정보 조회
      const seatData = await publicSeatService.getSeatByQRCode(qrCode);
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

  const addToCart = (menu: Menu) => {
    const existingItem = cart.find(item => item.menuId === menu.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.menuId === menu.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        menuId: menu.id,
        menuName: menu.name,
        price: Number(menu.price),
        quantity: 1,
        imageUrl: menu.imageUrl
      }]);
    }
    setCartOpen(true);
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

    // 주문 페이지로 이동 (다음 단계에서 구현)
    navigate('/order/checkout', {
      state: {
        seat,
        cart,
        totalPrice: getTotalPrice()
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
    <Box sx={{ pb: 10 }}>
      {/* 헤더 */}
      <AppBar position="sticky" color="primary">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {seat?.seatNumber ? `좌석 ${seat.seatNumber}` : '주문하기'}
          </Typography>
          <IconButton color="inherit" onClick={() => setCartOpen(true)}>
            <Badge badgeContent={cart.length} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 2, mb: 2 }}>
        {/* 카테고리 탭 */}
        {Object.keys(categories).length > 0 && (
          <Box sx={{ mb: 3, overflowX: 'auto' }}>
            <Stack direction="row" spacing={1} sx={{ pb: 1 }}>
              <Button
                variant={selectedCategory === null ? 'contained' : 'outlined'}
                onClick={() => setSelectedCategory(null)}
                size="small"
              >
                전체
              </Button>
              {Object.keys(categories).map(categoryId => {
                const categoryMenus = categories[Number(categoryId)];
                const categoryName = categoryMenus[0]?.categoryName || `카테고리 ${categoryId}`;
                return (
                  <Button
                    key={categoryId}
                    variant={selectedCategory === Number(categoryId) ? 'contained' : 'outlined'}
                    onClick={() => setSelectedCategory(Number(categoryId))}
                    size="small"
                  >
                    {categoryName}
                  </Button>
                );
              })}
            </Stack>
          </Box>
        )}

        {/* 메뉴 목록 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 2 }}>
          {getFilteredMenus().map((menu) => (
            <Card key={menu.id} sx={{ cursor: 'pointer' }} onClick={() => addToCart(menu)}>
              {menu.imageUrl && (
                <CardMedia
                  component="img"
                  height="140"
                  image={menu.imageUrl}
                  alt={menu.name}
                />
              )}
              <CardContent>
                <Typography variant="h6" component="div" noWrap>
                  {menu.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {menu.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  {Number(menu.price).toLocaleString()}원
                </Typography>
                {!menu.isAvailable && (
                  <Chip label="품절" color="error" size="small" sx={{ mt: 1 }} />
                )}
              </CardContent>
            </Card>
          ))}
        </Box>

        {getFilteredMenus().length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              표시할 메뉴가 없습니다.
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
          sx: { maxHeight: '80vh', borderTopLeftRadius: 16, borderTopRightRadius: 16 }
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
                      <IconButton edge="end" onClick={() => removeFromCart(item.menuId)}>
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
                        size="small"
                        onClick={() => updateCartQuantity(item.menuId, item.quantity - 1)}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography variant="body1" sx={{ minWidth: 30, textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateCartQuantity(item.menuId, item.quantity + 1)}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
              
              <Divider sx={{ my: 2 }} />
              
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
                >
                  주문하기
                </Button>
              </Paper>
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default CustomerOrderPage;

