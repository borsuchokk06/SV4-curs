import { Container, Box, Typography, Button, Grid, Paper, Stack, Skeleton } from '@mui/material';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowForward, LocalShipping, Verified, SupportAgent } from '@mui/icons-material';
import ProductCard from '../components/ProductCard';
import { productsApi, categoriesApi } from '../api/endpoints';
import type { Product, Category } from '../types';

export default function Home() {
  const [popular, setPopular] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    productsApi.popular().then(setPopular).catch(() => setPopular([]));
    categoriesApi.list().then(setCategories).catch(() => setCategories([]));
  }, []);

  return (
    <Box>
      {/* HERO */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1a3a5c 0%, #2d5681 70%, #ff6b35 200%)',
        color: '#fff',
        py: { xs: 6, md: 10 },
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.9 }}>
                НОВЫЙ СЕЗОН · НОВАЯ ЭКИПИРОВКА
              </Typography>
              <Typography variant="h2" sx={{ fontSize: { xs: 36, md: 56 }, mb: 2, mt: 1 }}>
                Двигайся ярче.<br />Тренируйся умнее.
              </Typography>
              <Typography sx={{ opacity: 0.92, fontSize: 18, mb: 4, maxWidth: 520 }}>
                Премиальная спортивная одежда от мировых брендов — отобрано для тех, кто не идёт на компромиссы.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  component={Link}
                  to="/catalog"
                  variant="contained"
                  color="secondary"
                  size="large"
                  endIcon={<ArrowForward />}
                >
                  В каталог
                </Button>
                <Button
                  component={Link}
                  to="/catalog?popular=true"
                  variant="outlined"
                  size="large"
                  sx={{ color: '#fff', borderColor: 'rgba(255,255,255,.5)' }}
                >
                  Хиты продаж
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* TRUST */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={3}>
          {[
            { icon: <LocalShipping />, title: 'Бесплатная доставка', text: 'При заказе от 200 BYN по всей Беларуси и России' },
            { icon: <Verified />, title: '100% оригиналы', text: 'Только подлинные товары от официальных дистрибьюторов' },
            { icon: <SupportAgent />, title: 'Лёгкий возврат', text: '30 дней на возврат без объяснения причин' },
          ].map((b, i) => (
            <Grid key={i} item xs={12} sm={4}>
              <Paper variant="outlined" sx={{ p: 3, display: 'flex', gap: 2, alignItems: 'flex-start', height: '100%' }}>
                <Box sx={{ color: 'secondary.main' }}>{b.icon}</Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{b.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{b.text}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CATEGORIES */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 800 }}>Выбор по категориям</Typography>
        <Grid container spacing={2}>
          {categories.slice(0, 10).map((c) => (
            <Grid key={c.id} item xs={6} sm={4} md={2.4}>
              <Paper
                component={Link}
                to={`/catalog?categoryId=${c.id}`}
                sx={{
                  p: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  textDecoration: 'none', color: 'inherit',
                  transition: 'all .2s',
                  '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' },
                }}
                variant="outlined"
              >
                <Box sx={{ fontSize: 32, mb: 1 }}>{c.icon}</Box>
                <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'center' }}>{c.name}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* POPULAR */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Сейчас популярно</Typography>
          <Button component={Link} to="/catalog?popular=true" endIcon={<ArrowForward />}>Все хиты</Button>
        </Stack>
        <Grid container spacing={3}>
          {(popular || Array.from({ length: 4 })).slice(0, 8).map((p, idx) =>
            popular ? (
              <Grid key={(p as Product).id} item xs={6} sm={4} md={3}>
                <ProductCard product={p as Product} />
              </Grid>
            ) : (
              <Grid key={idx} item xs={6} sm={4} md={3}>
                <Skeleton variant="rounded" height={360} />
              </Grid>
            )
          )}
        </Grid>
      </Container>
    </Box>
  );
}
