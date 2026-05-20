import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ProductFilters } from '../types';

const STORAGE_KEY = 'filters_v1';

export const DEFAULT_FILTERS: ProductFilters = {
  q: '',
  categoryId: '',
  brandId: '',
  gender: '',
  sportType: '',
  minPrice: 0,
  maxPrice: 500,
  popular: false,
  size: '',
  sort: 'newest',
  page: 1,
};

function load(): ProductFilters {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_FILTERS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_FILTERS;
}

const slice = createSlice({
  name: 'filters',
  initialState: load(),
  reducers: {
    setFilter(state, action: PayloadAction<{ key: keyof ProductFilters; value: any }>) {
      (state as any)[action.payload.key] = action.payload.value;
      if (action.payload.key !== 'page') state.page = 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    setMany(state, action: PayloadAction<Partial<ProductFilters>>) {
      Object.assign(state, action.payload);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    resetFilters() {
      localStorage.removeItem(STORAGE_KEY);
      return { ...DEFAULT_FILTERS };
    },
  },
});

export const { setFilter, setMany, resetFilters } = slice.actions;
export default slice.reducer;
