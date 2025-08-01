export interface PaymentRequest {
  orderId: number;
  amount: number;
  orderName: string;
  customerEmail?: string;
  customerName?: string;
  successUrl?: string;
  failUrl?: string;
}

export interface CartPaymentRequest {
  storeId: number;
  seatId: number;
  orderItems: Array<{
    menuId: number;
    quantity: number;
    options?: string;
  }>;
  totalAmount: number;
  orderName: string;
  customerRequest?: string;
  customerEmail?: string;
  customerName?: string;
  successUrl?: string;
  failUrl?: string;
}

export interface PaymentResponse {
  id: number;
  orderId: number;
  orderIdToss: string;
  paymentKey?: string;
  tossPaymentKey?: string;
  status: PaymentStatus;
  method?: PaymentMethod;
  amount: number;
  requestedAt?: string;
  approvedAt?: string;
  cancelledAt?: string;
  failureCode?: string;
  failureMessage?: string;
  cancelReason?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
  orderNumber?: string;
  seatNumber?: string;
}

export enum PaymentStatus {
  READY = 'READY',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_FOR_DEPOSIT = 'WAITING_FOR_DEPOSIT',
  DONE = 'DONE',
  CANCELED = 'CANCELED',
  PARTIAL_CANCELED = 'PARTIAL_CANCELED',
  ABORTED = 'ABORTED',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED'
}

export enum PaymentMethod {
  CARD = 'CARD',
  VIRTUAL_ACCOUNT = 'VIRTUAL_ACCOUNT',
  SIMPLE_PAYMENT = 'SIMPLE_PAYMENT',
  MOBILE_PHONE = 'MOBILE_PHONE',
  ACCOUNT_TRANSFER = 'ACCOUNT_TRANSFER',
  CULTURE_GIFT_CERTIFICATE = 'CULTURE_GIFT_CERTIFICATE'
}

export interface PaymentConfig {
  clientKey: string;
}

export interface TossPaymentsWidget {
  renderPaymentMethods: (selector: string, options: any) => void;
  requestPayment: (paymentMethod: string, options: any) => Promise<any>;
}

export interface TossPaymentsOptions {
  orderId: string;
  orderName: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  successUrl?: string;
  failUrl?: string;
}

export interface PaymentStats {
  today: number;
  thisMonth: number;
} 