import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(160),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(160),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '',
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  sale_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'unisex', 'kids'),
    allowNull: false,
    defaultValue: 'unisex',
  },
  sport_type: {
    type: DataTypes.STRING(60),
    allowNull: true,
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  is_popular: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  brand_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'products',
  indexes: [
    { fields: ['category_id'] },
    { fields: ['brand_id'] },
    { fields: ['gender'] },
  ],
});
