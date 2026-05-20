import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  promoCode: string | null;
  promoDiscount: number;
}

const STORAGE_KEY = 'cart_v1';

function loadFromStorage(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { items: [], promoCode: null, promoDiscount: 0 };
}

function persist(state: CartState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const slice = createSlice({
  name: 'cart',
  initialState: loadFromStorage(),
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const idx = state.items.findIndex(
        (i) => i.productId === action.payload.productId && i.size === action.payload.size
      );
      if (idx >= 0) {
        const newQty = state.items[idx].quantity + action.payload.quantity;
        state.items[idx].quantity = Math.min(newQty, state.items[idx].maxStock);
      } else {
        state.items.push(action.payload);
      }
      persist(state);
    },
    updateQuantity(state, action: PayloadAction<{ productId: number; size: string; quantity: number }>) {
      const item = state.items.find(
        (i) => i.productId === action.payload.productId && i.size === action.payload.size
      );
      if (item) {
        item.quantity = Math.max(1, Math.min(action.payload.quantity, item.maxStock));
        persist(state);
      }
    },
    removeItem(state, action: PayloadAction<{ productId: number; size: string }>) {
      state.items = state.items.filter(
        (i) => !(i.productId === action.payload.productId && i.size === action.payload.size)
      );
      persist(state);
    },
    clearCart(state) {
      state.items = [];
      state.promoCode = null;
      state.promoDiscount = 0;
      persist(state);
    },
    applyPromo(state, action: PayloadAction<{ code: string; discount: number }>) {
      state.promoCode = action.payload.code;
      state.promoDiscount = action.payload.discount;
      persist(state);
    },
    clearPromo(state) {
      state.promoCode = null;
      state.promoDiscount = 0;
      persist(state);
    },
  },
});

export const { addItem, updateQuantity, removeItem, clearCart, applyPromo, clearPromo } = slice.actions;
export default slice.reducer;
