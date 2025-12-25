import api from './api';
import { Category, CategoryRequest, Menu, MenuRequest } from '../types/menu';

// 카테고리 관련 API
export const categoryService = {
  // 활성 카테고리 목록 조회
  getActiveCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories/active');
    return response.data.data;
  },

  // 모든 카테고리 목록 조회 (관리자용)
  getAllCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data.data;
  },

  // 카테고리 상세 조회
  getCategoryById: async (categoryId: number): Promise<Category> => {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data.data;
  },

  // 카테고리 생성
  createCategory: async (request: CategoryRequest): Promise<Category> => {
    const response = await api.post('/categories', request);
    return response.data.data;
  },

  // 카테고리 수정
  updateCategory: async (categoryId: number, request: CategoryRequest): Promise<Category> => {
    const response = await api.put(`/categories/${categoryId}`, request);
    return response.data.data;
  },

  // 카테고리 삭제
  deleteCategory: async (categoryId: number): Promise<void> => {
    await api.delete(`/categories/${categoryId}`);
  },

  // 카테고리 상태 변경
  toggleCategoryStatus: async (categoryId: number): Promise<Category> => {
    const response = await api.put(`/categories/${categoryId}/status`);
    return response.data.data;
  }
};

// 메뉴 관련 API
export const menuService = {
  // 활성 메뉴 목록 조회
  getActiveMenus: async (): Promise<Menu[]> => {
    const response = await api.get('/menus/active');
    return response.data.data;
  },

  // 모든 메뉴 목록 조회 (관리자용)
  getAllMenus: async (): Promise<Menu[]> => {
    const response = await api.get('/menus');
    return response.data.data;
  },

  // 카테고리별 메뉴 목록 조회
  getMenusByCategory: async (categoryId: number): Promise<Menu[]> => {
    const response = await api.get(`/menus/category/${categoryId}`);
    return response.data.data;
  },

  // 메뉴 상세 조회
  getMenuById: async (menuId: number): Promise<Menu> => {
    const response = await api.get(`/menus/${menuId}`);
    return response.data.data;
  },

  // 메뉴 생성
  createMenu: async (request: MenuRequest): Promise<Menu> => {
    const response = await api.post('/menus', request);
    return response.data.data;
  },

  // 메뉴 수정
  updateMenu: async (menuId: number, request: MenuRequest): Promise<Menu> => {
    const response = await api.put(`/menus/${menuId}`, request);
    return response.data.data;
  },

  // 메뉴 삭제
  deleteMenu: async (menuId: number): Promise<void> => {
    await api.delete(`/menus/${menuId}`);
  },

  // 메뉴 상태 변경 (품절/판매중)
  toggleMenuAvailability: async (menuId: number): Promise<Menu> => {
    const response = await api.put(`/menus/${menuId}/status`);
    return response.data.data;
  }
};

// 고객용 메뉴 조회 API (인증 불필요)
export const publicMenuService = {
  // 고객용 메뉴 목록 조회
  getMenusForCustomer: async (storeId: number): Promise<Menu[]> => {
    const response = await api.get(`/public/stores/${storeId}/menus`);
    return response.data.data;
  }
}; 
