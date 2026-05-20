import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'reviews',
  indexes: [
    { fields: ['product_id'] },
    { fields: ['user_id', 'product_id'], unique: true },
  ],
});
