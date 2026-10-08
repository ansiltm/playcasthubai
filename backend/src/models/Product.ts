import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ProductAttributes {
  id?: number;
  name: string;
  description: string;
  category: string;
  grade: string;
  price: number;
  wholesalePrice?: number;
  stock: number;
  imageUrl?: string;
  media?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

type ProductCreationAttributes = Optional<ProductAttributes, 'id' | 'imageUrl' | 'media' | 'grade' | 'wholesalePrice'>;

class Product extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public category!: string;
  public grade!: string;
  public price!: number;
  public wholesalePrice!: number;
  public stock!: number;
  public imageUrl!: string;
  public media!: string[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    grade: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Toy-Grade' },
    price: { type: DataTypes.FLOAT, allowNull: false },
    wholesalePrice: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    imageUrl: { type: DataTypes.STRING, allowNull: true },
    media: { type: DataTypes.JSON, allowNull: true },
  },
  { sequelize, modelName: 'Product' }
);

export default Product;
