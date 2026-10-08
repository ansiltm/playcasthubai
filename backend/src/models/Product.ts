import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ProductAttributes {
  id?: number;
  name: string;
  description: string;
  category: string;
  grade: string;
  price: number;
  stock: number;
  imageUrl?: string;
  images?: string[];
  videoUrl?: string;
  model3dUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type ProductCreationAttributes = Optional<ProductAttributes, 'id' | 'imageUrl' | 'images' | 'videoUrl' | 'model3dUrl' | 'grade'>;

class Product extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public category!: string;
  public grade!: string;
  public price!: number;
  public stock!: number;
  public imageUrl!: string;
  public images!: string[];
  public videoUrl!: string;
  public model3dUrl!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    grade: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Toy Grade' },
    price: { type: DataTypes.FLOAT, allowNull: false },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    imageUrl: { type: DataTypes.STRING, allowNull: true },
    images: { type: DataTypes.JSON, allowNull: true },
    videoUrl: { type: DataTypes.STRING, allowNull: true },
    model3dUrl: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, modelName: 'Product' }
);

export default Product;
