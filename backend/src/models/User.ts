import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserAttributes {
  id?: number;
  name: string;
  email: string;
  password?: string;
  phone: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  role: 'admin' | 'user';
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreationAttributes = Optional<UserAttributes, 'id' | 'role' | 'phone' | 'addressLine1' | 'addressLine2' | 'city' | 'state' | 'pincode'>;

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public phone!: string;
  public addressLine1!: string | null;
  public addressLine2!: string | null;
  public city!: string | null;
  public state!: string | null;
  public pincode!: string | null;
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
    addressLine1: { type: DataTypes.STRING, allowNull: true },
    addressLine2: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
    state: { type: DataTypes.STRING, allowNull: true },
    pincode: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'user' },
  },
  { sequelize, modelName: 'User' }
);

export default User;
