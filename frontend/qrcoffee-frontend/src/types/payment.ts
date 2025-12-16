// 결제 관련 타입 정의

export interface CartPaymentRequest {
  totalAmount: number;
  orderName: string;
  customerName: string;
  customerPhone: string;
  storeId: number;
  seatId: number;
  orderItems: OrderItemRequest[];
  successUrl: string;
  failUrl: string;
}

export interface OrderItemRequest {
  menuId: number;
  quantity: number;
  options?: string[];
}

export interface PaymentConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface PaymentResponse {
  id?: number;
  orderId?: number;
  paymentKey?: string;
  orderIdToss: string;
  orderName: string;
  totalAmount: number;
  balanceAmount?: number;
  suppliedAmount?: number;
  vat?: number;
  status: string;
  method?: string;
  currency?: string;
  country?: string;
  version?: string;
  requestedAt?: string;
  approvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  customerName?: string;
  successUrl?: string;
  failUrl?: string;
}

