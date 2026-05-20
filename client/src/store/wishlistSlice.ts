import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { wishlistApi } from '../api/endpoints';
import type { Product } from '../types';

interface WishlistState {
  items: Product[];
  ids: number[];
  status: 'idle' | 'loading';
}

const STORAGE_KEY = 'wishlist_ids_v1';

function loadIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

const initialState: WishlistState = {
  items: [],
  ids: loadIds(),
  status: 'idle',
};

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async () => {
  return await wishlistApi.list();
});

export const toggleWishlistItem = createAsyncThunk(
  'wishlist/toggle',
  async ({ productId, isInWishlist }: { productId: number; isInWishlist: boolean }) => {
    if (isInWishlist) {
      await wishlistApi.remove(productId);
      return { productId, action: 'removed' as const };
    } else {
      await wishlistApi.add(productId);
      return { productId, action: 'added' as const };
    }
  }
);

function persistIds(ids: number[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

const slice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clear(state) {
      state.items = [];
      state.ids = [];
      persistIds([]);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (s) => { s.status = 'loading'; })
      .addCase(fetchWishlist.fulfilled, (s, a: PayloadAction<Product[]>) => {
        s.status = 'idle';
        s.items = a.payload;
        s.ids = a.payload.map((p) => p.id);
        persistIds(s.ids);
      })
      .addCase(toggleWishlistItem.fulfilled, (s, a) => {
        const { productId, action } = a.payload;
        if (action === 'removed') {
          s.ids = s.ids.filter((id) => id !== productId);
          s.items = s.items.filter((p) => p.id !== productId);
        } else {
          if (!s.ids.includes(productId)) s.ids.push(productId);
        }
        persistIds(s.ids);
      });
  },
});

export const { clear } = slice.actions;
export default slice.reducer;
