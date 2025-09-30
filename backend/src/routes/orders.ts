import { Router } from 'express';
import { Order, OrderItem, Menu, OrderStatus } from '../models';
import { CreateOrderRequest, UpdateOrderStatusRequest } from '../types';

const router = Router();

// GET /api/orders - Get all orders (oldest first)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Menu,
              as: 'menuItem',
            },
          ],
        },
      ],
      order: [['createdAt', 'ASC']], // Oldest first
    });

    const formattedOrders = orders.map(order => {
      const totalCost = order.orderItems!.reduce((sum, item) => {
        return sum + (item.menuItem.price * item.quantity);
      }, 0);

      return {
        id: order.id,
        customerName: order.customerName,
        status: order.status,
        paid: order.paid,
        paymentMode: order.paymentMode,
        totalCost: Number(totalCost.toFixed(2)),
        items: order.orderItems!.map(item => ({
          id: item.id,
          menuItem: {
            id: item.menuItem.id,
            name: item.menuItem.name,
            price: item.menuItem.price,
          },
          quantity: item.quantity,
          subtotal: Number((item.menuItem.price * item.quantity).toFixed(2)),
        })),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    });

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /api/orders - Create a new order
router.post('/', async (req, res) => {
  try {
    const { customerName, items, paid, paymentMode }: CreateOrderRequest = req.body;

    if (!customerName || !items || items.length === 0) {
      return res.status(400).json({ 
        error: 'Customer name and at least one item are required' 
      });
    }

    // Validate menu items exist
    const menuItemIds = items.map(item => item.menuItemId);
    const menuItems = await Menu.findAll({
      where: { id: menuItemIds },
    });

    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({ 
        error: 'One or more menu items do not exist' 
      });
    }

    // Create order and order items in a transaction
    const transaction = await Order.sequelize!.transaction();

    try {
      const order = await Order.create({
        customerName,
        status: OrderStatus.PENDING,
        paid: paid || false,
        paymentMode: paid ? paymentMode : undefined,
      }, { transaction });

      const orderItems = await Promise.all(
        items.map(item =>
          OrderItem.create({
            orderId: order.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
          }, { transaction })
        )
      );

      await transaction.commit();

      // Fetch the complete order with associations
      const completeOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: OrderItem,
            as: 'orderItems',
            include: [
              {
                model: Menu,
                as: 'menuItem',
              },
            ],
          },
        ],
      });

      const totalCost = completeOrder!.orderItems!.reduce((sum, item) => {
        return sum + (item.menuItem.price * item.quantity);
      }, 0);

      const response = {
        id: completeOrder!.id,
        customerName: completeOrder!.customerName,
        status: completeOrder!.status,
        paid: completeOrder!.paid,
        paymentMode: completeOrder!.paymentMode,
        totalCost: Number(totalCost.toFixed(2)),
        items: completeOrder!.orderItems!.map(item => ({
          id: item.id,
          menuItem: {
            id: item.menuItem.id,
            name: item.menuItem.name,
            price: item.menuItem.price,
          },
          quantity: item.quantity,
          subtotal: Number((item.menuItem.price * item.quantity).toFixed(2)),
        })),
        createdAt: completeOrder!.createdAt,
        updatedAt: completeOrder!.updatedAt,
      };

      res.status(201).json(response);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status }: UpdateOrderStatusRequest = req.body;

    if (!status || !Object.values(OrderStatus).includes(status as OrderStatus)) {
      return res.status(400).json({ 
        error: 'Valid status (pending/completed) is required' 
      });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await order.update({ status: status as OrderStatus });

    res.json({ 
      id: order.id, 
      status: order.status,
      message: 'Order status updated successfully' 
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
