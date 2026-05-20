import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import filtersReducer from './filtersSlice';
import wishlistReducer from './wishlistSlice';
import snackbarReducer from './snackbarSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    filters: filtersReducer,
    wishlist: wishlistReducer,
    snackbar: snackbarReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
