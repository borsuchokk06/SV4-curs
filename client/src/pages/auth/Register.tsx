import { Container, Paper, Typography, TextField, Button, Box, Alert, Link as MUILink } from '@mui/material';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { register } from '../../store/authSlice';
import { showSnackbar } from '../../store/snackbarSlice';

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '' });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 6) {
      dispatch(showSnackbar({ message: 'Пароль должен содержать минимум 6 символов', severity: 'warning' }));
      return;
    }
    const res = await dispatch(register(form));
    if (register.fulfilled.match(res)) {
      dispatch(showSnackbar({ message: 'Аккаунт создан!', severity: 'success' }));
      navigate('/');
    }
  }

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }} elevation={0} variant="outlined">
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 800 }}>Создать аккаунт</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Зарегистрируйтесь в SportArena, чтобы отслеживать заказы и сохранять избранное.
        </Typography>
        <form onSubmit={onSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="ФИО" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} size="medium" />
            <TextField label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} size="medium" />
            <TextField label="Телефон (необязательно)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} size="medium" />
            <TextField label="Пароль" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} helperText="Минимум 6 символов" size="medium" />
            {error && <Alert severity="error">{error}</Alert>}
            <Button variant="contained" type="submit" size="large" disabled={status === 'loading'}>
              {status === 'loading' ? 'Создание...' : 'Зарегистрироваться'}
            </Button>
          </Box>
        </form>
        <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
          Уже зарегистрированы?{' '}
          <MUILink component={Link} to="/login" fontWeight={600}>Войти</MUILink>
        </Typography>
      </Paper>
    </Container>
  );
}
