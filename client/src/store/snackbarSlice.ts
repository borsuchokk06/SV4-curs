import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

const initialState: SnackbarState = { open: false, message: '', severity: 'info' };

const slice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    show(state, action: PayloadAction<{ message: string; severity?: SnackbarState['severity'] }>) {
      state.open = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity || 'info';
    },
    hide(state) {
      state.open = false;
    },
  },
});

export const { show: showSnackbar, hide: hideSnackbar } = slice.actions;
export default slice.reducer;
