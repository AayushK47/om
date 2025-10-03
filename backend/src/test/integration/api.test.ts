import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { initializeDatabase, Menu, Order, OrderItem } from '../../models';
import orderRoutes from '../../routes/orders';
import menuRoutes from '../../routes/menu';

// Create test app
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/orders', orderRoutes);
app.use('/api/menu', menuRoutes);

describe('API Integration Tests', () => {
  beforeAll(async () => {
    await initializeDatabase();
  });

  afterAll(async () => {
    // Clean up test data
    await OrderItem.destroy({ where: {} });
    await Order.destroy({ where: {} });
    await Menu.destroy({ where: {} });
  });

  describe('Order Creation Flow', () => {
    it('should create a complete order with all fields', async () => {
      // First, get available menu items
      const menuResponse = await request(app)
        .get('/api/menu')
        .expect(200);

      const menuItems = menuResponse.body;
      expect(menuItems.length).toBeGreaterThan(0);

      // Create an order
      const orderData = {
        customerName: 'Integration Test User',
        phoneNumber: '+1234567890',
        items: [
          { menuItemId: menuItems[0].id, quantity: 2 },
          { menuItemId: menuItems[1].id, quantity: 1 },
        ],
        paid: true,
        paymentMode: 'cash',
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body).toMatchObject({
        customerName: 'Integration Test User',
        phoneNumber: '+1234567890',
        status: 'pending',
        paid: true,
        paymentMode: 'cash',
        totalCost: expect.any(Number),
        items: expect.arrayContaining([
          expect.objectContaining({
            quantity: 2,
            menuItem: expect.objectContaining({
              name: expect.any(String),
              price: expect.any(Number),
            }),
          }),
        ]),
      });

      // Verify the order was created in the database
      const createdOrder = await Order.findByPk(response.body.id, {
        include: [{ model: OrderItem, as: 'orderItems' }],
      });

      expect(createdOrder).not.toBeNull();
      expect(createdOrder?.customerName).toBe('Integration Test User');
      expect(createdOrder?.orderItems).toHaveLength(2);
    });

    it('should create an order without phone number', async () => {
      const menuResponse = await request(app)
        .get('/api/menu')
        .expect(200);

      const menuItems = menuResponse.body;

      const orderData = {
        customerName: 'No Phone User',
        items: [{ menuItemId: menuItems[0].id, quantity: 1 }],
        paid: false,
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.customerName).toBe('No Phone User');
      expect(response.body.phoneNumber).toBeNull();
      expect(response.body.paid).toBe(false);
    });

    it('should reject invalid order data', async () => {
      const invalidOrderData = {
        customerName: 'A', // Too short
        phoneNumber: '123', // Invalid format
        items: [{ menuItemId: 1, quantity: 0 }], // Invalid quantity
        paid: 'yes', // Should be boolean
      };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidOrderData)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.details).toBeDefined();
      expect(Array.isArray(response.body.details)).toBe(true);
    });
  });

  describe('Order Management Flow', () => {
    let orderId: number;

    it('should create an order for management tests', async () => {
      const menuResponse = await request(app)
        .get('/api/menu')
        .expect(200);

      const orderData = {
        customerName: 'Management Test User',
        phoneNumber: '9876543210',
        items: [{ menuItemId: menuResponse.body[0].id, quantity: 1 }],
        paid: false,
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      orderId = response.body.id;
      expect(orderId).toBeDefined();
    });

    it('should update order status', async () => {
      const response = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .send({ status: 'completed' })
        .expect(200);

      expect(response.body).toMatchObject({
        id: orderId,
        status: 'completed',
        message: 'Order status updated successfully',
      });
    });

    it('should update payment information', async () => {
      const response = await request(app)
        .put(`/api/orders/${orderId}/payment`)
        .send({ paid: true, paymentMode: 'upi' })
        .expect(200);

      expect(response.body).toMatchObject({
        id: orderId,
        paid: true,
        paymentMode: 'upi',
        message: 'Order payment information updated successfully',
      });
    });

    it('should retrieve all orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const ourOrder = response.body.find((order: any) => order.id === orderId);
      expect(ourOrder).toBeDefined();
      expect(ourOrder.customerName).toBe('Management Test User');
      expect(ourOrder.status).toBe('completed');
      expect(ourOrder.paid).toBe(true);
    });
  });
});
