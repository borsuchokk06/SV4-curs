import { Container, Paper, Typography, TextField, Button, Box, Alert, Link as MUILink, Divider } from '@mui/material';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { login } from '../../store/authSlice';
import { showSnackbar } from '../../store/snackbarSlice';

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loc = useLocation() as any;
  const { status, error, user } = useAppSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) navigate(loc.state?.from || (user.role === 'admin' ? '/admin' : '/'), { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await dispatch(login({ email, password }));
    if (login.fulfilled.match(res)) {
      dispatch(showSnackbar({ message: 'С возвращением!', severity: 'success' }));
      navigate(loc.state?.from || (res.payload.user.role === 'admin' ? '/admin' : '/'));
    }
  }

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }} elevation={0} variant="outlined">
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 800 }}>С возвращением</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Войдите, чтобы получить доступ к заказам, избранному и истории.
        </Typography>
        <form onSubmit={onSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              size="medium"
            />
            <TextField
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              size="medium"
            />
            {error && <Alert severity="error">{error}</Alert>}
            <Button
              variant="contained"
              size="large"
              type="submit"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Вход...' : 'Войти'}
            </Button>
          </Box>
        </form>
        <Divider sx={{ my: 3 }}>или</Divider>
        <Typography variant="body2" textAlign="center">
          Впервые здесь?{' '}
          <MUILink component={Link} to="/register" fontWeight={600}>Создать аккаунт</MUILink>
        </Typography>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Демо-аккаунты:</Typography>
          <Typography variant="caption" sx={{ display: 'block' }}>
            <b>Админ:</b> admin@sportarena.com / admin12345
          </Typography>
          <Typography variant="caption" sx={{ display: 'block' }}>
            <b>Покупатель:</b> ivan@mail.com / user12345
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
