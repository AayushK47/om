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

    // Check if menu items exist, if not create sample data
    const menuCount = await Menu.count();
    if (menuCount === 0) {
      await Menu.bulkCreate([
        { name: 'Veg Corn Cheese Sandwich', price: 149 },
        { name: 'Cheeseballs', price: 149 },
        { name: 'Chocolate Sandwich', price: 149 },
        { name: 'Pav Bhaji', price: 149 },
      ]);
      console.log('Sample menu items created');
    }

  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

export { Menu, Order, OrderItem, OrderStatus, initializeDatabase };
