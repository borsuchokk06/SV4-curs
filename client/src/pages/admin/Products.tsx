import { useEffect, useState } from 'react';
import {
  Box, Button, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Avatar, Chip, Switch, Typography, FormControl, InputLabel, Select, FormControlLabel, Grid,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { productsApi, categoriesApi, brandsApi } from '../../api/endpoints';
import type { Product, Category, Brand } from '../../types';
import { useAppDispatch } from '../../store';
import { showSnackbar } from '../../store/snackbarSlice';

const DEFAULT_SIZES_APPAREL = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function emptyForm() {
  return {
    name: '', description: '', price: '', sale_price: '',
    gender: 'unisex', sport_type: '', image_url: '',
    is_popular: false, category_id: '', brand_id: '',
    sizes: [] as { size: string; stock: number }[],
  };
}

export default function AdminProducts() {
  const dispatch = useAppDispatch();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm());

  async function refresh() {
    const r = await productsApi.list({ limit: 100 });
    setProducts(r.items);
  }
  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    categoriesApi.list().then(setCategories);
    brandsApi.list().then(setBrands);
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm(), sizes: DEFAULT_SIZES_APPAREL.map((s) => ({ size: s, stock: 10 })) });
    setOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      sale_price: p.sale_price ? String(p.sale_price) : '',
      gender: p.gender,
      sport_type: p.sport_type || '',
      image_url: p.image_url,
      is_popular: p.is_popular,
      category_id: String(p.category_id),
      brand_id: String(p.brand_id),
      sizes: p.sizes?.map((s) => ({ size: s.size, stock: s.stock })) || [],
    });
    setOpen(true);
  }

  async function save() {
    if (!form.name || !form.price || !form.category_id || !form.brand_id || !form.image_url) {
      dispatch(showSnackbar({ message: 'Заполните все обязательные поля', severity: 'warning' }));
      return;
    }
    const payload: any = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      gender: form.gender,
      sport_type: form.sport_type,
      image_url: form.image_url,
      is_popular: form.is_popular,
      category_id: Number(form.category_id),
      brand_id: Number(form.brand_id),
      sizes: form.sizes.filter((s) => s.size),
    };
    try {
      if (editing) await productsApi.update(editing.id, payload);
      else await productsApi.create(payload);
      dispatch(showSnackbar({ message: editing ? 'Товар обновлён' : 'Товар создан', severity: 'success' }));
      setOpen(false);
      refresh();
    } catch (err: any) {
      dispatch(showSnackbar({ message: err.response?.data?.error || 'Не удалось сохранить', severity: 'error' }));
    }
  }

  async function remove(p: Product) {
    if (!confirm(`Деактивировать товар «${p.name}»?`)) return;
    await productsApi.delete(p.id);
    dispatch(showSnackbar({ message: 'Товар деактивирован', severity: 'success' }));
    refresh();
  }

  function updateSize(idx: number, field: 'size' | 'stock', value: string) {
    const copy = [...form.sizes];
    if (field === 'stock') copy[idx].stock = Number(value);
    else copy[idx].size = value;
    setForm({ ...form, sizes: copy });
  }
  function addSizeRow() { setForm({ ...form, sizes: [...form.sizes, { size: '', stock: 0 }] }); }
  function removeSizeRow(idx: number) { setForm({ ...form, sizes: form.sizes.filter((_, i) => i !== idx) }); }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Всего товаров: {products.length}</Typography>
        <Button startIcon={<Add />} variant="contained" onClick={openCreate}>Новый товар</Button>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Бренд</TableCell>
              <TableCell>Категория</TableCell>
              <TableCell>Цена</TableCell>
              <TableCell>Метки</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell><Avatar src={p.image_url} variant="rounded" /></TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.brand?.name}</TableCell>
                <TableCell>{p.category?.name}</TableCell>
                <TableCell>
                  {p.sale_price ? (
                    <>
                      <b>{Number(p.sale_price).toFixed(2)} BYN</b>{' '}
                      <span style={{ textDecoration: 'line-through', color: '#888', fontSize: 12 }}>
                        {Number(p.price).toFixed(2)}
                      </span>
                    </>
                  ) : <b>{Number(p.price).toFixed(2)} BYN</b>}
                </TableCell>
                <TableCell>
                  {p.is_popular && <Chip label="Хит" size="small" color="primary" sx={{ mr: 0.5 }} />}
                  {!p.is_active && <Chip label="Неактивен" size="small" color="error" />}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(p)}><Edit fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => remove(p)}><Delete fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Редактирование товара' : 'Новый товар'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField label="Название *" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Описание" fullWidth multiline rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Цена *" type="number" fullWidth value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Цена со скидкой" type="number" fullWidth value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Категория *</InputLabel>
                <Select value={form.category_id} label="Категория *" onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                  {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Бренд *</InputLabel>
                <Select value={form.brand_id} label="Бренд *" onChange={(e) => setForm({ ...form, brand_id: e.target.value })}>
                  {brands.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Пол</InputLabel>
                <Select value={form.gender} label="Пол" onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <MenuItem value="male">Мужской</MenuItem>
                  <MenuItem value="female">Женский</MenuItem>
                  <MenuItem value="unisex">Унисекс</MenuItem>
                  <MenuItem value="kids">Детский</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField label="Вид спорта" fullWidth value={form.sport_type} onChange={(e) => setForm({ ...form, sport_type: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="URL изображения *" fullWidth value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={form.is_popular} onChange={(e) => setForm({ ...form, is_popular: e.target.checked })} />}
                label="Хит продаж"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Размеры и остатки</Typography>
              <Stack spacing={1}>
                {form.sizes.map((s, idx) => (
                  <Stack key={idx} direction="row" spacing={1}>
                    <TextField label="Размер" value={s.size} onChange={(e) => updateSize(idx, 'size', e.target.value)} sx={{ flex: 1 }} />
                    <TextField label="Остаток" type="number" value={s.stock} onChange={(e) => updateSize(idx, 'stock', e.target.value)} sx={{ flex: 1 }} />
                    <IconButton color="error" onClick={() => removeSizeRow(idx)}><Delete /></IconButton>
                  </Stack>
                ))}
                <Button startIcon={<Add />} onClick={addSizeRow} variant="outlined" size="small" sx={{ alignSelf: 'flex-start' }}>Добавить размер</Button>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={save}>{editing ? 'Сохранить' : 'Создать'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
