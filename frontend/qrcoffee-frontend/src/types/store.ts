// 매장 관리 관련 타입 정의

export interface Store {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  businessHours?: string; // JSON 형태
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoreRequest {
  name: string;
  address?: string;
  phone?: string;
  businessHours?: string;
  isActive?: boolean;
}

export interface BusinessHours {
  mon?: string;
  tue?: string;
  wed?: string;
  thu?: string;
  fri?: string;
  sat?: string;
  sun?: string;
}

export interface StoreContextType {
  store: Store | null;
  isLoading: boolean;
  getMyStore: () => Promise<void>;
  updateStore: (data: StoreRequest) => Promise<void>;
  refreshStore: () => Promise<void>;
} 
