import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserAttributes {
  id?: number;
  name: string;
  email: string;
  password?: string;
  phone: string;
  address: string;
  pincode: string;
  role: 'admin' | 'user';
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreationAttributes = Optional<UserAttributes, 'id' | 'role' | 'phone' | 'address' | 'pincode'>;

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public phone!: string;
  public address!: string;
  public pincode!: string;
  public role!: 'admin' | 'user';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false, defaultValue: '0000000000' },
    address: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'N/A' },
    pincode: { type: DataTypes.STRING, allowNull: false, defaultValue: '000000' },
    role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'user' },
  },
  { sequelize, modelName: 'User' }
);

export default User;
