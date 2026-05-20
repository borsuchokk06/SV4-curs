import { useEffect, useState } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Select, MenuItem, Typography, Avatar, Stack } from '@mui/material';
import { usersApi } from '../../api/endpoints';
import type { User } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store';
import { showSnackbar } from '../../store/snackbarSlice';

export default function AdminUsers() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s) => s.auth.user);
  const [users, setUsers] = useState<User[]>([]);

  async function refresh() {
    setUsers(await usersApi.list());
  }
  useEffect(() => { refresh(); }, []);

  async function changeRole(id: number, role: 'admin' | 'customer') {
    try {
      await usersApi.setRole(id, role);
      dispatch(showSnackbar({ message: 'Роль обновлена', severity: 'success' }));
      refresh();
    } catch (err: any) {
      dispatch(showSnackbar({ message: err.response?.data?.error || 'Ошибка', severity: 'error' }));
    }
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Пользователей: {users.length}</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Пользователь</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Зарегистрирован</TableCell>
              <TableCell>Роль</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 14 }}>
                      {u.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{u.name}</Typography>
                      <Typography variant="caption" color="text.secondary">ID №{u.id}</Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.phone || '—'}</TableCell>
                <TableCell>{new Date((u as any).created_at).toLocaleDateString('ru-RU')}</TableCell>
                <TableCell>
                  {u.id === currentUser?.id ? (
                    <Chip label="Вы (админ)" color="secondary" size="small" />
                  ) : (
                    <Select
                      size="small"
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value as any)}
                    >
                      <MenuItem value="customer">Покупатель</MenuItem>
                      <MenuItem value="admin">Администратор</MenuItem>
                    </Select>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
