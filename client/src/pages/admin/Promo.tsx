import { useEffect, useState } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Stack, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Switch, FormControlLabel,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { promoApi } from '../../api/endpoints';
import type { PromoCode } from '../../types';
import { useAppDispatch } from '../../store';
import { showSnackbar } from '../../store/snackbarSlice';

function todayPlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function AdminPromo() {
  const dispatch = useAppDispatch();
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [form, setForm] = useState({ code: '', discount_percent: 10, valid_until: todayPlus(30), max_uses: 100, is_active: true });

  async function refresh() { setCodes(await promoApi.list()); }
  useEffect(() => { refresh(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ code: '', discount_percent: 10, valid_until: todayPlus(30), max_uses: 100, is_active: true });
    setOpen(true);
  }
  function openEdit(p: PromoCode) {
    setEditing(p);
    setForm({
      code: p.code,
      discount_percent: p.discount_percent,
      valid_until: p.valid_until.slice(0, 10),
      max_uses: p.max_uses,
      is_active: p.is_active,
    });
    setOpen(true);
  }

  async function save() {
    try {
      if (editing) await promoApi.update(editing.id, form);
      else await promoApi.create(form as any);
      dispatch(showSnackbar({ message: 'Сохранено', severity: 'success' }));
      setOpen(false);
      refresh();
    } catch (err: any) {
      dispatch(showSnackbar({ message: err.response?.data?.error || 'Не удалось сохранить', severity: 'error' }));
    }
  }

  async function remove(p: PromoCode) {
    if (!confirm(`Удалить промокод «${p.code}»?`)) return;
    await promoApi.delete(p.id);
    dispatch(showSnackbar({ message: 'Удалено', severity: 'success' }));
    refresh();
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Промокодов: {codes.length}</Typography>
        <Button startIcon={<Add />} variant="contained" onClick={openCreate}>Новый промокод</Button>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Код</TableCell>
              <TableCell>Скидка</TableCell>
              <TableCell>Действует до</TableCell>
              <TableCell>Использовано</TableCell>
              <TableCell>Активен</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {codes.map((p) => {
              const expired = new Date(p.valid_until) < new Date();
              return (
                <TableRow key={p.id} hover>
                  <TableCell><b>{p.code}</b></TableCell>
                  <TableCell><Chip label={`${p.discount_percent}%`} color="secondary" size="small" /></TableCell>
                  <TableCell>
                    {new Date(p.valid_until).toLocaleDateString('ru-RU')}
                    {expired && <Chip label="ИСТЁК" size="small" color="error" sx={{ ml: 1 }} />}
                  </TableCell>
                  <TableCell>{p.used_count} / {p.max_uses}</TableCell>
                  <TableCell>
                    <Chip label={p.is_active ? 'активен' : 'отключён'} color={p.is_active ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(p)}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => remove(p)}><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? 'Редактирование промокода' : 'Новый промокод'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Код" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} fullWidth />
            <TextField label="Скидка, %" type="number" required value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: Number(e.target.value) })} fullWidth />
            <TextField label="Действует до" type="date" required value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Макс. использований" type="number" required value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: Number(e.target.value) })} fullWidth />
            <FormControlLabel control={<Switch checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />} label="Активен" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={save} disabled={!form.code || !form.discount_percent}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
