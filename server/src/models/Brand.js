import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Brand = sequelize.define('Brand', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(80),
    allowNull: false,
    unique: true,
  },
  slug: {
    type: DataTypes.STRING(80),
    allowNull: false,
    unique: true,
  },
  country: {
    type: DataTypes.STRING(60),
    allowNull: true,
  },
  logo_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'brands',
});
