import { api } from './axios';
import type {
  Brand, Category, Order, OrderStatus, PaginatedProducts, Product,
  ProductFilters, PromoCode, Review, User,
} from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }).then((r) => r.data),
  register: (data: { email: string; password: string; name: string; phone?: string }) =>
    api.post<{ token: string; user: User }>('/auth/register', data).then((r) => r.data),
  me: () => api.get<User>('/auth/me').then((r) => r.data),
  updateMe: (data: Partial<Pick<User, 'name' | 'phone' | 'address'>>) =>
    api.patch<User>('/auth/me', data).then((r) => r.data),
};

export const productsApi = {
  list: (filters: Partial<ProductFilters> & { limit?: number }) =>
    api.get<PaginatedProducts>('/products', { params: filters }).then((r) => r.data),
  popular: () => api.get<Product[]>('/products/popular').then((r) => r.data),
  get: (id: number) => api.get<Product>(`/products/${id}`).then((r) => r.data),
  create: (data: Partial<Product> & { sizes?: { size: string; stock: number }[] }) =>
    api.post<Product>('/products', data).then((r) => r.data),
  update: (id: number, data: Partial<Product> & { sizes?: { size: string; stock: number }[] }) =>
    api.patch<Product>(`/products/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/products/${id}`).then((r) => r.data),
};

export const categoriesApi = {
  list: () => api.get<Category[]>('/categories').then((r) => r.data),
  create: (data: Partial<Category>) => api.post<Category>('/categories', data).then((r) => r.data),
  update: (id: number, data: Partial<Category>) => api.patch<Category>(`/categories/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/categories/${id}`).then((r) => r.data),
};

export const brandsApi = {
  list: () => api.get<Brand[]>('/brands').then((r) => r.data),
  create: (data: Partial<Brand>) => api.post<Brand>('/brands', data).then((r) => r.data),
  update: (id: number, data: Partial<Brand>) => api.patch<Brand>(`/brands/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/brands/${id}`).then((r) => r.data),
};

export const ordersApi = {
  mine: () => api.get<Order[]>('/orders/mine').then((r) => r.data),
  list: (params?: { status?: string; from?: string; to?: string }) =>
    api.get<Order[]>('/orders', { params }).then((r) => r.data),
  get: (id: number) => api.get<Order>(`/orders/${id}`).then((r) => r.data),
  create: (data: {
    items: { productId: number; size: string; quantity: number }[];
    shipping_address: string;
    contact_phone: string;
    payment_method: 'card' | 'cash';
    promoCode?: string;
  }) => api.post<Order>('/orders', data).then((r) => r.data),
  updateStatus: (id: number, status: OrderStatus) =>
    api.patch<Order>(`/orders/${id}/status`, { status }).then((r) => r.data),
};

export const reviewsApi = {
  forProduct: (productId: number) => api.get<Review[]>(`/reviews/product/${productId}`).then((r) => r.data),
  create: (data: { product_id: number; rating: number; text: string }) =>
    api.post<Review>('/reviews', data).then((r) => r.data),
  delete: (id: number) => api.delete(`/reviews/${id}`).then((r) => r.data),
};

export const wishlistApi = {
  list: () => api.get<Product[]>('/wishlist').then((r) => r.data),
  add: (productId: number) => api.post(`/wishlist/${productId}`).then((r) => r.data),
  remove: (productId: number) => api.delete(`/wishlist/${productId}`).then((r) => r.data),
};

export const promoApi = {
  validate: (code: string) =>
    api.get<{ valid: boolean; code: string; discount_percent: number }>(`/promo-codes/validate/${code}`).then((r) => r.data),
  list: () => api.get<PromoCode[]>('/promo-codes').then((r) => r.data),
  create: (data: Partial<PromoCode>) => api.post<PromoCode>('/promo-codes', data).then((r) => r.data),
  update: (id: number, data: Partial<PromoCode>) => api.patch<PromoCode>(`/promo-codes/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/promo-codes/${id}`).then((r) => r.data),
};

export const usersApi = {
  list: () => api.get<User[]>('/users').then((r) => r.data),
  setRole: (id: number, role: 'admin' | 'customer') =>
    api.patch(`/users/${id}/role`, { role }).then((r) => r.data),
};

export const reportsApi = {
  analytics: (params?: { from?: string; to?: string }) =>
    api.get('/reports/analytics', { params }).then((r) => r.data),
  salesPdfUrl: (params?: { from?: string; to?: string }) => {
    const q = new URLSearchParams();
    if (params?.from) q.set('from', params.from);
    if (params?.to) q.set('to', params.to);
    const token = localStorage.getItem('token') || '';
    return `/api/reports/sales-pdf?${q.toString()}&_t=${token}`;
  },
  downloadSalesPdf: async (params?: { from?: string; to?: string }) => {
    const res = await api.get('/reports/sales-pdf', { params, responseType: 'blob' });
    return res.data as Blob;
  },
  downloadOrderPdf: async (id: number) => {
    const res = await api.get(`/reports/order-pdf/${id}`, { responseType: 'blob' });
    return res.data as Blob;
  },
};
