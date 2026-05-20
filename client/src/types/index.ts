export type Role = 'admin' | 'customer';

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  address?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  country?: string;
  logo_url?: string;
}

export interface ProductSize {
  id: number;
  product_id: number;
  size: string;
  stock: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price: number | null;
  gender: 'male' | 'female' | 'unisex' | 'kids';
  sport_type?: string;
  image_url: string;
  is_popular: boolean;
  is_active: boolean;
  category_id: number;
  brand_id: number;
  category?: Category;
  brand?: Brand;
  sizes?: ProductSize[];
  rating?: number;
  reviewCount?: number;
}

export interface CartItem {
  productId: number;
  productName: string;
  productImage: string;
  size: string;
  quantity: number;
  unitPrice: number;
  maxStock: number;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItemFull {
  id: number;
  order_id: number;
  product_id: number;
  size: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface Order {
  id: number;
  user_id: number;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  total: number;
  promo_code_id?: number | null;
  shipping_address: string;
  contact_phone: string;
  payment_method: 'card' | 'cash';
  created_at: string;
  items?: OrderItemFull[];
  user?: User;
  promoCode?: PromoCode | null;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  text: string;
  created_at: string;
  user?: { id: number; name: string };
}

export interface PromoCode {
  id: number;
  code: string;
  discount_percent: number;
  valid_until: string;
  max_uses: number;
  used_count: number;
  is_active: boolean;
}

export interface ProductFilters {
  q: string;
  categoryId: number | '';
  brandId: number | '';
  gender: '' | 'male' | 'female' | 'unisex' | 'kids';
  sportType: string;
  minPrice: number;
  maxPrice: number;
  popular: boolean;
  size: string;
  sort: string;
  page: number;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  pages: number;
}
