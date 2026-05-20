import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Category = sequelize.define('Category', {
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
  icon: {
    type: DataTypes.STRING(80),
    allowNull: true,
  },
}, {
  tableName: 'categories',
});
