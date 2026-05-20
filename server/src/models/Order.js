import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  promo_code_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  shipping_address: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  contact_phone: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  payment_method: {
    type: DataTypes.ENUM('card', 'cash'),
    allowNull: false,
    defaultValue: 'card',
  },
}, {
  tableName: 'orders',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['status'] },
  ],
});
