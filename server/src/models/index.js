import { sequelize } from '../config/database.js';
import { User } from './User.js';
import { Category } from './Category.js';
import { Brand } from './Brand.js';
import { Product } from './Product.js';
import { ProductSize } from './ProductSize.js';
import { Order } from './Order.js';
import { OrderItem } from './OrderItem.js';
import { Review } from './Review.js';
import { Wishlist } from './Wishlist.js';
import { PromoCode } from './PromoCode.js';

// Category 1—N Product
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Brand 1—N Product
Brand.hasMany(Product, { foreignKey: 'brand_id', as: 'products' });
Product.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });

// Product 1—N ProductSize
Product.hasMany(ProductSize, { foreignKey: 'product_id', as: 'sizes', onDelete: 'CASCADE' });
ProductSize.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// User 1—N Order
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Order 1—N OrderItem
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Product 1—N OrderItem
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// PromoCode 1—N Order
PromoCode.hasMany(Order, { foreignKey: 'promo_code_id', as: 'orders' });
Order.belongsTo(PromoCode, { foreignKey: 'promo_code_id', as: 'promoCode' });

// Product 1—N Review, User 1—N Review
Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User M—N Product via Wishlist
User.belongsToMany(Product, { through: Wishlist, foreignKey: 'user_id', otherKey: 'product_id', as: 'wishlistProducts' });
Product.belongsToMany(User, { through: Wishlist, foreignKey: 'product_id', otherKey: 'user_id', as: 'wishlistedBy' });

export {
  sequelize,
  User,
  Category,
  Brand,
  Product,
  ProductSize,
  Order,
  OrderItem,
  Review,
  Wishlist,
  PromoCode,
};
