export interface MenuItem {
  id: number;
  name: string;
  price: number;
}

export interface OrderItem {
  id: number;
  menuItem: MenuItem;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  customerName: string;
  phoneNumber?: string;
  status: 'pending' | 'completed';
  paid: boolean;
  paymentMode?: 'cash' | 'upi';
  totalCost: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  customerName: string;
  phoneNumber?: string;
  items: Array<{
    menuItemId: number;
    quantity: number;
  }>;
  paid: boolean;
  paymentMode?: 'cash' | 'upi';
}

export interface SelectedItem {
  menuItem: MenuItem;
  quantity: number;
}
