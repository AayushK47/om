import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface OrderItemAttributes {
  id?: number;
  orderId: number;
  menuItemId: number;
  quantity: number;
}

class OrderItem extends Model<OrderItemAttributes> implements OrderItemAttributes {
  public id!: number;
  public orderId!: number;
  public menuItemId!: number;
  public quantity!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Orders',
        key: 'id',
      },
    },
    menuItemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Menus',
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'OrderItems',
    timestamps: true,
  }
);

export default OrderItem;
