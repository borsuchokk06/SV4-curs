import { Box, TextField, Select, MenuItem, FormControl, InputLabel, Slider, Typography, FormControlLabel, Switch, Button, Stack, Chip, Divider } from '@mui/material';
import { RestartAlt, Search } from '@mui/icons-material';
import type { Brand, Category, ProductFilters } from '../types';

interface Props {
  filters: ProductFilters;
  categories: Category[];
  brands: Brand[];
  onChange: <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => void;
  onReset: () => void;
}

const SPORT_TYPES = [
  { value: 'Running', label: 'Бег' },
  { value: 'Football', label: 'Футбол' },
  { value: 'Basketball', label: 'Баскетбол' },
  { value: 'Yoga', label: 'Йога' },
  { value: 'Training', label: 'Тренировки' },
  { value: 'Tennis', label: 'Теннис' },
  { value: 'Hiking', label: 'Хайкинг' },
];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42', '43', '44', '45'];

export default function ProductFiltersBar({ filters, categories, brands, onChange, onReset }: Props) {
  return (
    <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Фильтры</Typography>
        <Button onClick={onReset} startIcon={<RestartAlt />} size="small" color="inherit">
          Сбросить
        </Button>
      </Stack>

      <TextField
        fullWidth
        placeholder="Поиск товаров..."
        value={filters.q}
        onChange={(e) => onChange('q', e.target.value)}
        InputProps={{ startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }}
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Категория</InputLabel>
        <Select
          value={filters.categoryId}
          label="Категория"
          onChange={(e) => onChange('categoryId', e.target.value as any)}
        >
          <MenuItem value="">Все категории</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.id} value={c.id}>{c.icon} {c.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Бренд</InputLabel>
        <Select
          value={filters.brandId}
          label="Бренд"
          onChange={(e) => onChange('brandId', e.target.value as any)}
        >
          <MenuItem value="">Все бренды</MenuItem>
          {brands.map((b) => (
            <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Пол</InputLabel>
        <Select
          value={filters.gender}
          label="Пол"
          onChange={(e) => onChange('gender', e.target.value as any)}
        >
          <MenuItem value="">Любой</MenuItem>
          <MenuItem value="male">Мужской</MenuItem>
          <MenuItem value="female">Женский</MenuItem>
          <MenuItem value="unisex">Унисекс</MenuItem>
          <MenuItem value="kids">Детский</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Вид спорта</InputLabel>
        <Select
          value={filters.sportType}
          label="Вид спорта"
          onChange={(e) => onChange('sportType', e.target.value as any)}
        >
          <MenuItem value="">Все виды</MenuItem>
          {SPORT_TYPES.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Размер</InputLabel>
        <Select
          value={filters.size}
          label="Размер"
          onChange={(e) => onChange('size', e.target.value as any)}
        >
          <MenuItem value="">Любой размер</MenuItem>
          {SIZES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </Select>
      </FormControl>

      <Typography variant="caption" color="text.secondary">Диапазон цен (BYN)</Typography>
      <Box sx={{ px: 1 }}>
        <Slider
          value={[filters.minPrice, filters.maxPrice]}
          min={0}
          max={500}
          step={10}
          onChange={(_, val) => {
            const [mn, mx] = val as number[];
            onChange('minPrice', mn);
            onChange('maxPrice', mx);
          }}
          valueLabelDisplay="auto"
          valueLabelFormat={(v) => `${v} BYN`}
        />
        <Stack direction="row" justifyContent="space-between">
          <Chip label={`${filters.minPrice} BYN`} size="small" />
          <Chip label={`${filters.maxPrice} BYN`} size="small" />
        </Stack>
      </Box>

      <Divider sx={{ my: 2 }} />

      <FormControlLabel
        control={
          <Switch
            checked={filters.popular}
            onChange={(e) => onChange('popular', e.target.checked)}
          />
        }
        label="Только хиты продаж"
      />
    </Box>
  );
}
