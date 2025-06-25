import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  Stack,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon
} from '@mui/icons-material';
import { categoryService, menuService } from '../services/menuService';
import { Category, CategoryRequest, Menu, MenuRequest } from '../types/menu';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const MenuManagePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 카테고리 모달 관련
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState<CategoryRequest>({
    name: '',
    displayOrder: 0,
    isActive: true
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // 메뉴 모달 관련
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [menuFormData, setMenuFormData] = useState<MenuRequest>({
    categoryId: 0,
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    isAvailable: true,
    displayOrder: 0
  });
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  // 데이터 로드
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      setError('카테고리 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadMenus = async () => {
    try {
      setLoading(true);
      const data = await menuService.getAllMenus();
      setMenus(data);
    } catch (err) {
      setError('메뉴 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadMenus();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 카테고리 관련 핸들러
  const handleCreateCategory = () => {
    setCategoryFormData({ name: '', displayOrder: 0, isActive: true });
    setEditingCategory(null);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setCategoryFormData({
      name: category.name,
      displayOrder: category.displayOrder,
      isActive: category.isActive
    });
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, categoryFormData);
        setSuccess('카테고리가 수정되었습니다.');
      } else {
        await categoryService.createCategory(categoryFormData);
        setSuccess('카테고리가 생성되었습니다.');
      }
      setCategoryModalOpen(false);
      loadCategories();
    } catch (err) {
      setError('카테고리 저장에 실패했습니다.');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (window.confirm('정말로 이 카테고리를 삭제하시겠습니까?')) {
      try {
        await categoryService.deleteCategory(categoryId);
        setSuccess('카테고리가 삭제되었습니다.');
        loadCategories();
      } catch (err) {
        setError('카테고리 삭제에 실패했습니다.');
      }
    }
  };

  const handleToggleCategoryStatus = async (categoryId: number) => {
    try {
      await categoryService.toggleCategoryStatus(categoryId);
      setSuccess('카테고리 상태가 변경되었습니다.');
      loadCategories();
    } catch (err) {
      setError('카테고리 상태 변경에 실패했습니다.');
    }
  };

  // 메뉴 관련 핸들러
  const handleCreateMenu = () => {
    setMenuFormData({
      categoryId: categories.length > 0 ? categories[0].id : 0,
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      isAvailable: true,
      displayOrder: 0
    });
    setEditingMenu(null);
    setMenuModalOpen(true);
  };

  const handleEditMenu = (menu: Menu) => {
    setMenuFormData({
      categoryId: menu.categoryId,
      name: menu.name,
      description: menu.description || '',
      price: menu.price,
      imageUrl: menu.imageUrl || '',
      isAvailable: menu.isAvailable,
      displayOrder: menu.displayOrder
    });
    setEditingMenu(menu);
    setMenuModalOpen(true);
  };

  const handleSaveMenu = async () => {
    try {
      if (editingMenu) {
        await menuService.updateMenu(editingMenu.id, menuFormData);
        setSuccess('메뉴가 수정되었습니다.');
      } else {
        await menuService.createMenu(menuFormData);
        setSuccess('메뉴가 생성되었습니다.');
      }
      setMenuModalOpen(false);
      loadMenus();
    } catch (err) {
      setError('메뉴 저장에 실패했습니다.');
    }
  };

  const handleDeleteMenu = async (menuId: number) => {
    if (window.confirm('정말로 이 메뉴를 삭제하시겠습니까?')) {
      try {
        await menuService.deleteMenu(menuId);
        setSuccess('메뉴가 삭제되었습니다.');
        loadMenus();
      } catch (err) {
        setError('메뉴 삭제에 실패했습니다.');
      }
    }
  };

  const handleToggleMenuAvailability = async (menuId: number) => {
    try {
      await menuService.toggleMenuAvailability(menuId);
      setSuccess('메뉴 상태가 변경되었습니다.');
      loadMenus();
    } catch (err) {
      setError('메뉴 상태 변경에 실패했습니다.');
    }
  };

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '알 수 없음';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          메뉴 관리
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="카테고리 관리" />
            <Tab label="메뉴 관리" />
          </Tabs>
        </Box>

        {/* 카테고리 관리 탭 */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2">
              카테고리 목록
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateCategory}
            >
              카테고리 추가
            </Button>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
                     ) : (
             <Stack spacing={3} direction="row" flexWrap="wrap">
               {categories.map((category) => (
                 <Box key={category.id} sx={{ width: { xs: '100%', sm: '48%', md: '32%' } }}>
                   <Card>
                     <CardContent>
                       <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                         <Typography variant="h6" component="h3">
                           {category.name}
                         </Typography>
                         <Chip
                           label={category.isActive ? '활성' : '비활성'}
                           color={category.isActive ? 'success' : 'default'}
                           size="small"
                         />
                       </Box>
                       <Typography color="text.secondary" variant="body2">
                         진열 순서: {category.displayOrder}
                       </Typography>
                     </CardContent>
                     <CardActions>
                       <IconButton
                         size="small"
                         onClick={() => handleEditCategory(category)}
                         color="primary"
                       >
                         <EditIcon />
                       </IconButton>
                       <IconButton
                         size="small"
                         onClick={() => handleToggleCategoryStatus(category.id)}
                         color="info"
                       >
                         {category.isActive ? <ToggleOnIcon /> : <ToggleOffIcon />}
                       </IconButton>
                       <IconButton
                         size="small"
                         onClick={() => handleDeleteCategory(category.id)}
                         color="error"
                       >
                         <DeleteIcon />
                       </IconButton>
                     </CardActions>
                   </Card>
                 </Box>
               ))}
             </Stack>
          )}
        </TabPanel>

        {/* 메뉴 관리 탭 */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2">
              메뉴 목록
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateMenu}
              disabled={categories.length === 0}
            >
              메뉴 추가
            </Button>
          </Box>

          {categories.length === 0 ? (
            <Alert severity="warning">
              메뉴를 추가하려면 먼저 카테고리를 생성해주세요.
            </Alert>
          ) : loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
                     ) : (
             <Stack spacing={3} direction="row" flexWrap="wrap">
               {menus.map((menu) => (
                 <Box key={menu.id} sx={{ width: { xs: '100%', sm: '48%', md: '32%' } }}>
                   <Card>
                     <CardContent>
                       <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                         <Typography variant="h6" component="h3">
                           {menu.name}
                         </Typography>
                         <Chip
                           label={menu.isAvailable ? '판매중' : '품절'}
                           color={menu.isAvailable ? 'success' : 'error'}
                           size="small"
                         />
                       </Box>
                       <Typography color="text.secondary" variant="body2" gutterBottom>
                         카테고리: {getCategoryName(menu.categoryId)}
                       </Typography>
                       <Typography variant="body2" gutterBottom>
                         {menu.description}
                       </Typography>
                       <Typography variant="h6" color="primary">
                         {menu.price.toLocaleString()}원
                       </Typography>
                       <Typography color="text.secondary" variant="body2">
                         진열 순서: {menu.displayOrder}
                       </Typography>
                     </CardContent>
                     <CardActions>
                       <IconButton
                         size="small"
                         onClick={() => handleEditMenu(menu)}
                         color="primary"
                       >
                         <EditIcon />
                       </IconButton>
                       <IconButton
                         size="small"
                         onClick={() => handleToggleMenuAvailability(menu.id)}
                         color="info"
                       >
                         {menu.isAvailable ? <ToggleOnIcon /> : <ToggleOffIcon />}
                       </IconButton>
                       <IconButton
                         size="small"
                         onClick={() => handleDeleteMenu(menu.id)}
                         color="error"
                       >
                         <DeleteIcon />
                       </IconButton>
                     </CardActions>
                   </Card>
                 </Box>
               ))}
             </Stack>
          )}
        </TabPanel>
      </Box>

      {/* 카테고리 생성/수정 모달 */}
      <Dialog open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? '카테고리 수정' : '카테고리 생성'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="카테고리명"
              fullWidth
              variant="outlined"
              value={categoryFormData.name}
              onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="진열 순서"
              type="number"
              fullWidth
              variant="outlined"
              value={categoryFormData.displayOrder}
              onChange={(e) => setCategoryFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={categoryFormData.isActive}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
              }
              label="활성화"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryModalOpen(false)}>취소</Button>
          <Button onClick={handleSaveCategory} variant="contained">
            {editingCategory ? '수정' : '생성'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 메뉴 생성/수정 모달 */}
      <Dialog open={menuModalOpen} onClose={() => setMenuModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMenu ? '메뉴 수정' : '메뉴 생성'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={menuFormData.categoryId}
                label="카테고리"
                onChange={(e) => setMenuFormData(prev => ({ ...prev, categoryId: e.target.value as number }))}
              >
                {categories.filter(c => c.isActive).map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="메뉴명"
              fullWidth
              variant="outlined"
              value={menuFormData.name}
              onChange={(e) => setMenuFormData(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="메뉴 설명"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={menuFormData.description}
              onChange={(e) => setMenuFormData(prev => ({ ...prev, description: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="가격 (원)"
              type="number"
              fullWidth
              variant="outlined"
              value={menuFormData.price}
              onChange={(e) => setMenuFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="이미지 URL"
              fullWidth
              variant="outlined"
              value={menuFormData.imageUrl}
              onChange={(e) => setMenuFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="진열 순서"
              type="number"
              fullWidth
              variant="outlined"
              value={menuFormData.displayOrder}
              onChange={(e) => setMenuFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={menuFormData.isAvailable}
                  onChange={(e) => setMenuFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                />
              }
              label="판매 가능"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMenuModalOpen(false)}>취소</Button>
          <Button onClick={handleSaveMenu} variant="contained">
            {editingMenu ? '수정' : '생성'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 성공/에러 메시지 */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MenuManagePage; 