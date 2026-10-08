import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CartAttributes {
  id?: number;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type CartCreationAttributes = Optional<CartAttributes, 'id'>;

class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
  public id!: number;
  public userId!: number;
  public CartItems?: any[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Cart.init(
  {
    userId: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, modelName: 'Cart' }
);

export default Cart;
