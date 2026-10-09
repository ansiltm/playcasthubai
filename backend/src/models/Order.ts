import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface OrderAttributes {
  id?: number;
  orderNumber?: string;
  userId: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  paymentMethod?: string;
  paymentStatus?: string;
  shippingAddressLine1?: string | null;
  shippingAddressLine2?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingPincode?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type OrderCreationAttributes = Optional<OrderAttributes, 'id' | 'status' | 'orderNumber' | 'paymentMethod' | 'paymentStatus' | 'shippingAddressLine1' | 'shippingAddressLine2' | 'shippingCity' | 'shippingState' | 'shippingPincode'>;

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public orderNumber!: string;
  public userId!: number;
  public totalAmount!: number;
  public status!: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  public paymentMethod!: string;
  public paymentStatus!: string;
  public shippingAddressLine1!: string | null;
  public shippingAddressLine2!: string | null;
  public shippingCity!: string | null;
  public shippingState!: string | null;
  public shippingPincode!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    orderNumber: { type: DataTypes.STRING, allowNull: true, unique: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    totalAmount: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
    paymentMethod: { type: DataTypes.STRING, allowNull: false, defaultValue: 'COD' },
    paymentStatus: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
    shippingAddressLine1: { type: DataTypes.STRING, allowNull: true },
    shippingAddressLine2: { type: DataTypes.STRING, allowNull: true },
    shippingCity: { type: DataTypes.STRING, allowNull: true },
    shippingState: { type: DataTypes.STRING, allowNull: true },
    shippingPincode: { type: DataTypes.STRING, allowNull: true },
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
