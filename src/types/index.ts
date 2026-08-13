export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  availableStock: number;
  category?: string;
  description?: string;
  updatedAt?: any;
}

export type OrderStatus = 'Fulfilled' | 'Completed' | 'Pending' | 'CANCELLED' | 'Cancelled';

export interface OrderItem {
  id?: string;
  orderId?: string;
  productId: string;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  totalAmount: number;
  totalItems: number;
  items: OrderItem[];
  createdAt: any; // Timestamp or ISO string
  createdBy?: string;
}

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  customerName: string;
  items: CreateOrderItemInput[];
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName?: string | null;
}
