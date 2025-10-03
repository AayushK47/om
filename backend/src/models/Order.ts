import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed'
}

interface OrderAttributes {
  id?: number;
  customerName: string;
  phoneNumber?: string;
  status: OrderStatus;
  paid: boolean;
  paymentMode?: 'cash' | 'upi';
  createdAt?: Date;
  updatedAt?: Date;
}

class Order extends Model<OrderAttributes> implements OrderAttributes {
  public id!: number;
  public customerName!: string;
  public phoneNumber?: string;
  public status!: OrderStatus;
  public paid!: boolean;
  public paymentMode?: 'cash' | 'upi';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association property
  public readonly orderItems?: any[];
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(OrderStatus.PENDING, OrderStatus.COMPLETED),
      allowNull: false,
      defaultValue: OrderStatus.PENDING,
    },
    paid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    paymentMode: {
      type: DataTypes.ENUM('cash', 'upi'),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'Orders',
    timestamps: true,
  }
);

export default Order;
