import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface MenuAttributes {
  id?: number;
  name: string;
  price: number;
}

class Menu extends Model<MenuAttributes> implements MenuAttributes {
  public id!: number;
  public name!: string;
  public price!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Menu.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'Menus',
    timestamps: true,
  }
);

export default Menu;
