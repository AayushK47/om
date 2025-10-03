import 'reflect-metadata';
import { beforeAll, afterAll } from 'vitest';
import { initializeDatabase, Menu, Order, OrderItem } from '../models';

// Global test setup
beforeAll(async () => {
  // Initialize test database
  await initializeDatabase();
});

afterAll(async () => {
  // Cleanup test database
  await OrderItem.destroy({ where: {} });
  await Order.destroy({ where: {} });
  await Menu.destroy({ where: {} });
});
