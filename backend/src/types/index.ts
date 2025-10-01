export interface CreateOrderRequest {
  customerName: string;
  items: Array<{
    menuItemId: number;
    quantity: number;
  }>;
  paid: boolean;
  paymentMode?: 'cash' | 'upi';
}

export interface OrderResponse {
  id: number;
  customerName: string;
  status: 'pending' | 'completed';
  paid: boolean;
  totalCost: number;
  items: Array<{
    id: number;
    menuItem: {
      id: number;
      name: string;
      price: number;
    };
    quantity: number;
    subtotal: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItemResponse {
  id: number;
  name: string;
  price: number;
}

export interface UpdateOrderStatusRequest {
  status: 'pending' | 'completed';
}

export interface UpdatePaymentRequest {
  paid: boolean;
  paymentMode?: 'cash' | 'upi';
}
