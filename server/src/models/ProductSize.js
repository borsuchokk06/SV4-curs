import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const ProductSize = sequelize.define('ProductSize', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  size: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'product_sizes',
  indexes: [
    { fields: ['product_id', 'size'], unique: true },
  ],
});
