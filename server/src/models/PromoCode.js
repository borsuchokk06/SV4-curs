import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const PromoCode = sequelize.define('PromoCode', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING(40),
    allowNull: false,
    unique: true,
  },
  discount_percent: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 90 },
  },
  valid_until: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  max_uses: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
  },
  used_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'promo_codes',
});
