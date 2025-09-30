import sequelize from '../config/database';
import Menu from './Menu';
import Order, { OrderStatus } from './Order';
import OrderItem from './OrderItem';

// Define associations
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'orderItems' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

Menu.hasMany(OrderItem, { foreignKey: 'menuItemId', as: 'orderItems' });
OrderItem.belongsTo(Menu, { foreignKey: 'menuItemId', as: 'menuItem' });

// Initialize database
const initializeDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('Database synchronized successfully');

  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

export { Menu, Order, OrderItem, OrderStatus, initializeDatabase };
