export interface Category {
  id: number;
  storeId: number;
  name: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRequest {
  name: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface Menu {
  id: number;
  storeId: number;
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  categoryName?: string; // 조인된 카테고리 정보
}

export interface MenuRequest {
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable?: boolean;
  displayOrder?: number;
}

export interface MenuWithCategory extends Menu {
  categoryName: string;
}

// 메뉴 관리 컨텍스트 타입
export interface MenuManagementContextType {
  // 카테고리 관련
  categories: Category[];
  selectedCategory: Category | null;
  loadCategories: () => Promise<void>;
  createCategory: (request: CategoryRequest) => Promise<void>;
  updateCategory: (id: number, request: CategoryRequest) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  toggleCategoryStatus: (id: number) => Promise<void>;
  setSelectedCategory: (category: Category | null) => void;
  
  // 메뉴 관련
  menus: Menu[];
  selectedMenu: Menu | null;
  loadMenus: () => Promise<void>;
  loadMenusByCategory: (categoryId: number) => Promise<void>;
  createMenu: (request: MenuRequest) => Promise<void>;
  updateMenu: (id: number, request: MenuRequest) => Promise<void>;
  deleteMenu: (id: number) => Promise<void>;
  toggleMenuAvailability: (id: number) => Promise<void>;
  setSelectedMenu: (menu: Menu | null) => void;
  
  // UI 상태 관리
  isLoading: boolean;
  isModalOpen: boolean;
  modalType: 'category' | 'menu' | null;
  setIsModalOpen: (open: boolean) => void;
  setModalType: (type: 'category' | 'menu' | null) => void;
  
  // 에러 처리
  error: string | null;
  clearError: () => void;
} 