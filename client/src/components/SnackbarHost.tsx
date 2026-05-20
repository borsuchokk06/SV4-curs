import { Snackbar, Alert } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store';
import { hideSnackbar } from '../store/snackbarSlice';

export default function SnackbarHost() {
  const { open, message, severity } = useAppSelector((s) => s.snackbar);
  const dispatch = useAppDispatch();
  return (
    <Snackbar
      open={open}
      autoHideDuration={3500}
      onClose={() => dispatch(hideSnackbar())}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert severity={severity} variant="filled" onClose={() => dispatch(hideSnackbar())} sx={{ minWidth: 280 }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
