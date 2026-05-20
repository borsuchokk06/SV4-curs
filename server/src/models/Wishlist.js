import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Wishlist = sequelize.define('Wishlist', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'wishlist',
  indexes: [
    { fields: ['user_id', 'product_id'], unique: true },
  ],
});
