// 주문 관련 타입 정의

export interface OrderItem {
  id?: number;
  menuId: number;
  menuName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  options?: string[];
  createdAt?: string;
}

export interface Order {
  id: number;
  storeId: number;
  seatId: number;
  seatNumber?: string;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  customerRequest?: string;
  accessToken?: string; // 주문 접근 토큰 (소유권 검증용)
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 
  | 'PENDING'      // 주문접수
  | 'PREPARING'    // 제조시작
  | 'COMPLETED'    // 제조완료
  | 'PICKED_UP'    // 수령완료
  | 'CANCELLED';   // 취소됨

export type PaymentStatus = 
  | 'PENDING'      // 결제 대기
  | 'PAID'         // 결제 완료
  | 'FAILED'       // 결제 실패
  | 'CANCELLED'    // 결제 취소
  | 'REFUNDED';    // 환불됨

export interface OrderRequest {
  storeId: number;
  seatId: number;
  orderItems: OrderItemRequest[];
  customerRequest?: string;
  customerName?: string;
  customerPhone?: string;
}

export interface OrderItemRequest {
  menuId: number;
  quantity: number;
  options?: string[];
}

// 장바구니 아이템
export interface CartItem {
  menuId: number;
  menuName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  options?: string[];
}

// 주문 상태 변경 요청
export interface OrderStatusUpdateRequest {
  status: OrderStatus;
}

// 주문 상태별 한글 표시
export const getOrderStatusText = (status: OrderStatus): string => {
  const statusMap: Record<OrderStatus, string> = {
    PENDING: '주문접수',
    PREPARING: '제조시작',
    COMPLETED: '제조완료',
    PICKED_UP: '수령완료',
    CANCELLED: '취소됨'
  };
  return statusMap[status] || status;
};

// 결제 상태별 한글 표시
export const getPaymentStatusText = (status: PaymentStatus): string => {
  const statusMap: Record<PaymentStatus, string> = {
    PENDING: '결제 대기',
    PAID: '결제 완료',
    FAILED: '결제 실패',
    CANCELLED: '결제 취소',
    REFUNDED: '환불됨'
  };
  return statusMap[status] || status;
};

