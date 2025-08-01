export interface OrderItem {
  id?: number;
  menuId: number;
  menuName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  options?: string;
}

export interface OrderItemRequest {
  menuId: number;
  quantity: number;
  options?: string;
}

export interface Order {
  id: number;
  storeId: number;
  seatId: number;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  statusDescription: string;
  paymentStatus: PaymentStatus;
  paymentStatusDescription: string;
  customerRequest?: string;
  createdAt: string;
  updatedAt: string;
  seatNumber?: string;
  orderItems: OrderItem[];
  canCancel: boolean;
  isPaid: boolean;
}

export interface OrderRequest {
  storeId: number;
  seatId: number;
  orderItems: OrderItemRequest[];
  customerRequest?: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  COMPLETED = 'COMPLETED',
  PICKED_UP = 'PICKED_UP',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export interface OrderStats {
  todayOrderCount: number;
  pendingOrderCount: number;
}

export interface OrderStatusStats {
  pendingCount: number;
  preparingCount: number;
  completedCount: number;
  pickedUpCount: number;
  cancelledCount: number;
}

// 장바구니 관련 인터페이스
export interface CartItem {
  menuId: number;
  menuName: string;
  price: number;
  quantity: number;
  options?: string;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
  totalQuantity: number;
}

// 고객용 주문 컨텍스트
export interface CustomerOrderContextType {
  cart: Cart;
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  
  // 장바구니 관리
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (menuId: number) => void;
  updateQuantity: (menuId: number, quantity: number) => void;
  clearCart: () => void;
  
  // 주문 관리
  createOrder: (orderData: OrderRequest) => Promise<Order>;
  getOrder: (orderId: number) => Promise<Order>;
  cancelOrder: (orderId: number) => Promise<Order>;
  
  // 상태 관리
  setError: (error: string | null) => void;
  clearError: () => void;
}

// 관리자용 주문 관리 컨텍스트
export interface AdminOrderContextType {
  orders: Order[];
  stats: OrderStats | null;
  statusStats: OrderStatusStats | null;
  isLoading: boolean;
  error: string | null;
  
  // 주문 목록 관리
  fetchOrders: (status?: OrderStatus) => Promise<void>;
  getOrder: (orderId: number) => Promise<Order>;
  
  // 주문 상태 관리
  updateOrderStatus: (orderId: number, status: OrderStatus) => Promise<void>;
  cancelOrder: (orderId: number) => Promise<void>;
  
  // 통계 조회
  fetchStats: () => Promise<void>;
  fetchStatusStats: () => Promise<void>;
  
  // 상태 관리
  setError: (error: string | null) => void;
  clearError: () => void;
} 