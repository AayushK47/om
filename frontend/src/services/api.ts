import axios from 'axios';
import { MenuItem, Order, CreateOrderRequest } from '../types';

const API_BASE_URL = 'https://7f5f5809a355.ngrok-free.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Menu API
export const menuApi = {
  getAll: async (): Promise<MenuItem[]> => {
    const response = await api.get('/menu');
    return response.data;
  },
};

// Orders API
export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    const response = await api.get('/orders');
    return response.data;
  },
  
  create: async (orderData: CreateOrderRequest): Promise<Order> => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
  updateStatus: async (orderId: number, status: 'pending' | 'completed'): Promise<void> => {
    await api.put(`/orders/${orderId}/status`, { status });
  },
};

export default api;
