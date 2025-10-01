import axios from 'axios';
import { MenuItem, Order, CreateOrderRequest } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Menu API
export const menuApi = {
  getAll: async (): Promise<MenuItem[]> => {
    const response = await api.get('/api/menu');
    return response.data;
  },
};

// Health check API
export const healthApi = {
  check: async (): Promise<{ status: string; message: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Orders API
export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    const response = await api.get('/api/orders');
    return response.data;
  },
  
  create: async (orderData: CreateOrderRequest): Promise<Order> => {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  },
  
  updateStatus: async (orderId: number, status: 'pending' | 'completed'): Promise<void> => {
    await api.put(`/api/orders/${orderId}/status`, { status });
  },
  
  updatePayment: async (orderId: number, paid: boolean, paymentMode?: 'cash' | 'upi'): Promise<void> => {
    await api.put(`/api/orders/${orderId}/payment`, { paid, paymentMode });
  },
};

export default api;
