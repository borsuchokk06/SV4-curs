import { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, Button, Stack, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { categoriesApi, brandsApi } from '../../api/endpoints';
import type { Brand, Category } from '../../types';
import { useAppDispatch } from '../../store';
import { showSnackbar } from '../../store/snackbarSlice';

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '-').replace(/^-+|-+$/g, '');
}

export default function AdminCategories() {
  const dispatch = useAppDispatch();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [catDialog, setCatDialog] = useState<{ open: boolean; item: Category | null }>({ open: false, item: null });
  const [brandDialog, setBrandDialog] = useState<{ open: boolean; item: Brand | null }>({ open: false, item: null });

  async function refresh() {
    setCategories(await categoriesApi.list());
    setBrands(await brandsApi.list());
  }
  useEffect(() => { refresh(); }, []);

  async function saveCat(data: { name: string; slug: string; icon: string }) {
    try {
      if (catDialog.item) await categoriesApi.update(catDialog.item.id, data);
      else await categoriesApi.create(data);
      dispatch(showSnackbar({ message: 'Категория сохранена', severity: 'success' }));
      setCatDialog({ open: false, item: null });
      refresh();
    } catch (err: any) {
      dispatch(showSnackbar({ message: err.response?.data?.error || 'Ошибка', severity: 'error' }));
    }
  }

  async function delCat(c: Category) {
    if (!confirm(`Удалить категорию «${c.name}»?`)) return;
    try {
      await categoriesApi.delete(c.id);
      dispatch(showSnackbar({ message: 'Удалено', severity: 'success' }));
      refresh();
    } catch {
      dispatch(showSnackbar({ message: 'Нельзя удалить — категория используется', severity: 'error' }));
    }
  }

  async function saveBrand(data: { name: string; slug: string; country: string }) {
    try {
      if (brandDialog.item) await brandsApi.update(brandDialog.item.id, data);
      else await brandsApi.create(data);
      dispatch(showSnackbar({ message: 'Бренд сохранён', severity: 'success' }));
      setBrandDialog({ open: false, item: null });
      refresh();
    } catch (err: any) {
      dispatch(showSnackbar({ message: err.response?.data?.error || 'Ошибка', severity: 'error' }));
    }
  }

  async function delBrand(b: Brand) {
    if (!confirm(`Удалить бренд «${b.name}»?`)) return;
    try {
      await brandsApi.delete(b.id);
      dispatch(showSnackbar({ message: 'Удалено', severity: 'success' }));
      refresh();
    } catch {
      dispatch(showSnackbar({ message: 'Нельзя удалить — бренд используется', severity: 'error' }));
    }
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Категории ({categories.length})</Typography>
            <Button startIcon={<Add />} variant="contained" size="small" onClick={() => setCatDialog({ open: true, item: null })}>Добавить</Button>
          </Stack>
          <Stack divider={<Box sx={{ borderBottom: '1px solid #eee' }} />}>
            {categories.map((c) => (
              <Stack key={c.id} direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1 }}>
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>{c.icon} {c.name}</Typography>
                  <Typography variant="caption" color="text.secondary">/{c.slug}</Typography>
                </Box>
                <Box>
                  <IconButton size="small" onClick={() => setCatDialog({ open: true, item: c })}><Edit fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => delCat(c)}><Delete fontSize="small" /></IconButton>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Бренды ({brands.length})</Typography>
            <Button startIcon={<Add />} variant="contained" size="small" onClick={() => setBrandDialog({ open: true, item: null })}>Добавить</Button>
          </Stack>
          <Stack divider={<Box sx={{ borderBottom: '1px solid #eee' }} />}>
            {brands.map((b) => (
              <Stack key={b.id} direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1 }}>
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>{b.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{b.country || '—'}</Typography>
                </Box>
                <Box>
                  <IconButton size="small" onClick={() => setBrandDialog({ open: true, item: b })}><Edit fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => delBrand(b)}><Delete fontSize="small" /></IconButton>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Grid>

      <CategoryDialog
        open={catDialog.open}
        item={catDialog.item}
        onClose={() => setCatDialog({ open: false, item: null })}
        onSave={saveCat}
      />
      <BrandDialog
        open={brandDialog.open}
        item={brandDialog.item}
        onClose={() => setBrandDialog({ open: false, item: null })}
        onSave={saveBrand}
      />
    </Grid>
  );
}

function CategoryDialog({ open, item, onClose, onSave }: any) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  useEffect(() => {
    setName(item?.name || '');
    setIcon(item?.icon || '');
  }, [item, open]);
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{item ? 'Редактирование категории' : 'Новая категория'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1, minWidth: 320 }}>
          <TextField label="Название" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField label="Иконка (эмодзи)" value={icon} onChange={(e) => setIcon(e.target.value)} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={() => onSave({ name, slug: slugify(name), icon })} disabled={!name}>Сохранить</Button>
      </DialogActions>
    </Dialog>
  );
}

function BrandDialog({ open, item, onClose, onSave }: any) {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  useEffect(() => {
    setName(item?.name || '');
    setCountry(item?.country || '');
  }, [item, open]);
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{item ? 'Редактирование бренда' : 'Новый бренд'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1, minWidth: 320 }}>
          <TextField label="Название" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField label="Страна" value={country} onChange={(e) => setCountry(e.target.value)} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={() => onSave({ name, slug: slugify(name), country })} disabled={!name}>Сохранить</Button>
      </DialogActions>
    </Dialog>
  );
}
