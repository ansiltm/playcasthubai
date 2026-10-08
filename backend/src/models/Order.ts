import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface OrderAttributes {
  id?: number;
  orderNumber?: string;
  userId: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

type OrderCreationAttributes = Optional<OrderAttributes, 'id' | 'status' | 'orderNumber'>;

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public orderNumber!: string;
  public userId!: number;
  public totalAmount!: number;
  public status!: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    orderNumber: { type: DataTypes.STRING, allowNull: true, unique: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    totalAmount: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
  },
  { 
    sequelize, 
    modelName: 'Order',
    hooks: {
      beforeCreate: (order) => {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
        order.orderNumber = `ORD-${dateStr}-${randomStr}`;
      }
    }
  }
);

export default Order;
