import { Container, Paper, Typography, TextField, Button, Stack, Avatar, Box, Chip } from '@mui/material';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { authApi } from '../api/endpoints';
import { setUser } from '../store/authSlice';
import { showSnackbar } from '../store/snackbarSlice';

export default function Profile() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name, phone: user.phone || '', address: user.address || '' });
  }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await authApi.updateMe(form);
      dispatch(setUser(updated));
      dispatch(showSnackbar({ message: 'Профиль сохранён', severity: 'success' }));
    } catch {
      dispatch(showSnackbar({ message: 'Не удалось сохранить профиль', severity: 'error' }));
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 800 }}>Мой профиль</Typography>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center" sx={{ mb: 4 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 30 }}>
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{user.name}</Typography>
            <Typography color="text.secondary">{user.email}</Typography>
            <Chip
              label={user.role === 'admin' ? 'Администратор' : 'Покупатель'}
              color={user.role === 'admin' ? 'secondary' : 'primary'}
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
        </Stack>
        <form onSubmit={save}>
          <Stack spacing={2}>
            <TextField
              label="ФИО"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextField
              label="Телефон"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <TextField
              label="Адрес доставки по умолчанию"
              multiline
              minRows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <Box>
              <Button variant="contained" type="submit" disabled={saving}>
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
