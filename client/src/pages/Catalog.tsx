import { Container, Grid, Typography, Box, Select, MenuItem, FormControl, InputLabel, Pagination, Stack, Drawer, Button, useMediaQuery, useTheme, Alert, Skeleton } from '@mui/material';
import { FilterList } from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ProductFiltersBar from '../components/ProductFilters';
import { productsApi, categoriesApi, brandsApi } from '../api/endpoints';
import { useAppDispatch, useAppSelector } from '../store';
import { setFilter, resetFilters, setMany } from '../store/filtersSlice';
import type { Brand, Category, Product, ProductFilters } from '../types';

export default function Catalog() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.filters);
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [items, setItems] = useState<Product[] | null>(null);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Sync URL → filters whenever the URL query changes (header links, back/forward, etc.)
  const isFirstRender = useRef(true);
  useEffect(() => {
    const cId = searchParams.get('categoryId');
    const g = searchParams.get('gender');
    const pop = searchParams.get('popular');
    const hasUrlParams = cId !== null || g !== null || pop !== null;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      // On first mount, only override Redux/localStorage if URL has params
      if (hasUrlParams) {
        dispatch(setMany({
          categoryId: cId ? Number(cId) : '',
          gender: (g as any) || '',
          popular: pop === 'true',
          page: 1,
        }));
      }
      return;
    }
    // On subsequent URL changes, URL is authoritative for these three filters
    dispatch(setMany({
      categoryId: cId ? Number(cId) : '',
      gender: (g as any) || '',
      popular: pop === 'true',
      page: 1,
    }));
  }, [searchParams, dispatch]);

  useEffect(() => {
    categoriesApi.list().then(setCategories);
    brandsApi.list().then(setBrands);
  }, []);

  useEffect(() => {
    setItems(null);
    const params: any = { ...filters, limit: 12 };
    productsApi.list(params).then((r) => {
      setItems(r.items);
      setTotal(r.total);
      setPages(r.pages);
    });
  }, [filters]);

  function handleChange<K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) {
    dispatch(setFilter({ key, value }));
    if (key === 'categoryId' || key === 'gender' || key === 'popular') {
      const newParams = new URLSearchParams(searchParams);
      if (value === '' || value === false) newParams.delete(key);
      else newParams.set(key, String(value));
      setSearchParams(newParams, { replace: true });
    }
  }

  function handleReset() {
    dispatch(resetFilters());
    setSearchParams({}, { replace: true });
  }

  const filtersNode = (
    <ProductFiltersBar
      filters={filters}
      categories={categories}
      brands={brands}
      onChange={handleChange}
      onReset={handleReset}
    />
  );

  function pluralizeProducts(n: number) {
    const last = n % 10;
    const lastTwo = n % 100;
    if (lastTwo >= 11 && lastTwo <= 14) return 'товаров';
    if (last === 1) return 'товар';
    if (last >= 2 && last <= 4) return 'товара';
    return 'товаров';
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Каталог</Typography>
          {items !== null && (
            <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
              Найдено {total} {pluralizeProducts(total)}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1}>
          {isMobile && (
            <Button startIcon={<FilterList />} variant="outlined" onClick={() => setDrawerOpen(true)}>
              Фильтры
            </Button>
          )}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Сортировка</InputLabel>
            <Select
              value={filters.sort}
              label="Сортировка"
              onChange={(e) => handleChange('sort', e.target.value)}
            >
              <MenuItem value="newest">Сначала новые</MenuItem>
              <MenuItem value="oldest">Сначала старые</MenuItem>
              <MenuItem value="price_asc">Цена: по возрастанию</MenuItem>
              <MenuItem value="price_desc">Цена: по убыванию</MenuItem>
              <MenuItem value="name_asc">Название: А → Я</MenuItem>
              <MenuItem value="name_desc">Название: Я → А</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {!isMobile && (
          <Grid item md={3}>
            <Box sx={{ position: 'sticky', top: 80 }}>{filtersNode}</Box>
          </Grid>
        )}
        <Grid item xs={12} md={9}>
          {items && items.length === 0 ? (
            <Alert severity="info">По выбранным фильтрам ничего не найдено. Попробуйте сбросить настройки.</Alert>
          ) : (
            <Grid container spacing={2.5}>
              {(items || Array.from({ length: 9 })).map((p, idx) =>
                items ? (
                  <Grid key={(p as Product).id} item xs={6} sm={4} md={4}>
                    <ProductCard product={p as Product} />
                  </Grid>
                ) : (
                  <Grid key={idx} item xs={6} sm={4} md={4}>
                    <Skeleton variant="rounded" height={360} />
                  </Grid>
                )
              )}
            </Grid>
          )}
          {pages > 1 && (
            <Stack alignItems="center" sx={{ mt: 4 }}>
              <Pagination
                count={pages}
                page={filters.page}
                onChange={(_, p) => handleChange('page', p)}
                color="primary"
                shape="rounded"
              />
            </Stack>
          )}
        </Grid>
      </Grid>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 300, p: 1 }}>{filtersNode}</Box>
      </Drawer>
    </Container>
  );
}
