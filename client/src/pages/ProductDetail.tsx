import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Grid, Box, Typography, Button, Chip, Rating, Stack, Divider, ToggleButton, ToggleButtonGroup, IconButton, TextField, Paper, Avatar, Alert, Skeleton, Breadcrumbs, Link as MUILink, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { Favorite, FavoriteBorder, ShoppingCart, Add, Remove, ExpandMore } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { productsApi, reviewsApi } from '../api/endpoints';
import type { Product, Review } from '../types';
import { useAppDispatch, useAppSelector } from '../store';
import { addItem } from '../store/cartSlice';
import { toggleWishlistItem } from '../store/wishlistSlice';
import { showSnackbar } from '../store/snackbarSlice';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const isInWishlist = useAppSelector((s) => id ? s.wishlist.ids.includes(Number(id)) : false);

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [qty, setQty] = useState(1);

  const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    setProduct(null);
    productsApi.get(Number(id))
      .then((p) => {
        setProduct(p);
        const firstAvailable = p.sizes?.find((s) => s.stock > 0);
        if (firstAvailable) setSelectedSize(firstAvailable.size);
      })
      .catch(() => navigate('/404'));
    reviewsApi.forProduct(Number(id)).then(setReviews);
  }, [id, navigate]);

  function handleAddToCart() {
    if (!product || !selectedSize) {
      dispatch(showSnackbar({ message: 'Сначала выберите размер', severity: 'warning' }));
      return;
    }
    const sizeRow = product.sizes?.find((s) => s.size === selectedSize);
    if (!sizeRow || sizeRow.stock < 1) {
      dispatch(showSnackbar({ message: 'Нет в наличии для этого размера', severity: 'error' }));
      return;
    }
    dispatch(addItem({
      productId: product.id,
      productName: product.name,
      productImage: product.image_url,
      size: selectedSize,
      quantity: qty,
      unitPrice: Number(product.sale_price || product.price),
      maxStock: sizeRow.stock,
    }));
    dispatch(showSnackbar({ message: 'Добавлено в корзину', severity: 'success' }));
  }

  function handleWishlist() {
    if (!user) {
      dispatch(showSnackbar({ message: 'Войдите, чтобы пользоваться избранным', severity: 'info' }));
      return;
    }
    if (!product) return;
    dispatch(toggleWishlistItem({ productId: product.id, isInWishlist }));
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !product) return;
    if (!reviewForm.text.trim()) {
      dispatch(showSnackbar({ message: 'Напишите текст отзыва', severity: 'warning' }));
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewsApi.create({
        product_id: product.id,
        rating: reviewForm.rating,
        text: reviewForm.text,
      });
      const updated = await reviewsApi.forProduct(product.id);
      setReviews(updated);
      setReviewForm({ rating: 5, text: '' });
      dispatch(showSnackbar({ message: 'Отзыв сохранён', severity: 'success' }));
    } catch (err: any) {
      dispatch(showSnackbar({ message: err.response?.data?.error || 'Не удалось сохранить отзыв', severity: 'error' }));
    } finally {
      setSubmittingReview(false);
    }
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}><Skeleton variant="rounded" height={500} /></Grid>
          <Grid item xs={12} md={6}>
            <Skeleton width="60%" height={40} />
            <Skeleton width="80%" height={60} />
            <Skeleton width="40%" height={40} sx={{ mt: 2 }} />
            <Skeleton variant="rounded" height={200} sx={{ mt: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  const onSale = !!product.sale_price && Number(product.sale_price) < Number(product.price);
  const displayPrice = onSale ? Number(product.sale_price) : Number(product.price);
  const selectedStock = product.sizes?.find((s) => s.size === selectedSize)?.stock || 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <MUILink component={Link} to="/" color="inherit">Главная</MUILink>
        <MUILink component={Link} to="/catalog" color="inherit">Каталог</MUILink>
        <MUILink component={Link} to={`/catalog?categoryId=${product.category_id}`} color="inherit">
          {product.category?.name}
        </MUILink>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'relative', bgcolor: '#f0f2f5', borderRadius: 3, overflow: 'hidden', aspectRatio: '1 / 1' }}>
            <Box component="img" src={product.image_url} alt={product.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {onSale && (
              <Chip label="СКИДКА" color="secondary" sx={{ position: 'absolute', top: 16, left: 16, fontWeight: 700 }} />
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="overline" color="text.secondary">
            {product.brand?.name} · {product.sport_type}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5, mb: 1 }}>
            {product.name}
          </Typography>
          {(product.rating || 0) > 0 && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Rating value={product.rating || 0} readOnly precision={0.5} />
              <Typography variant="body2" color="text.secondary">{product.reviewCount} отзыв(ов)</Typography>
            </Stack>
          )}

          <Stack direction="row" alignItems="baseline" spacing={2} sx={{ mb: 3 }}>
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 800 }}>
              {displayPrice.toFixed(2)} BYN
            </Typography>
            {onSale && (
              <Typography variant="h6" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                {Number(product.price).toFixed(2)} BYN
              </Typography>
            )}
          </Stack>

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Размер</Typography>
          <ToggleButtonGroup
            value={selectedSize}
            exclusive
            onChange={(_, v) => v && setSelectedSize(v)}
            sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}
          >
            {product.sizes?.map((s) => (
              <ToggleButton
                key={s.id}
                value={s.size}
                disabled={s.stock === 0}
                sx={{ minWidth: 56, border: '1px solid #ddd !important', borderRadius: '8px !important', m: '0 !important' }}
              >
                {s.size}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Typography variant="caption" color={selectedStock > 0 ? 'success.main' : 'error.main'} sx={{ display: 'block', mb: 2 }}>
            {selectedSize ? (selectedStock > 0 ? `В наличии: ${selectedStock} шт.` : 'Нет в наличии') : 'Выберите размер'}
          </Typography>

          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" sx={{ border: '1px solid #ddd', borderRadius: 1 }}>
              <IconButton onClick={() => setQty((q) => Math.max(1, q - 1))} size="small"><Remove /></IconButton>
              <Typography sx={{ minWidth: 32, textAlign: 'center', fontWeight: 600 }}>{qty}</Typography>
              <IconButton onClick={() => setQty((q) => Math.min(selectedStock || 99, q + 1))} size="small"><Add /></IconButton>
            </Stack>
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCart />}
              onClick={handleAddToCart}
              disabled={!selectedSize || selectedStock === 0}
              fullWidth
            >
              В корзину
            </Button>
            <IconButton onClick={handleWishlist} sx={{ border: '1px solid #ddd' }}>
              {isInWishlist ? <Favorite color="secondary" /> : <FavoriteBorder />}
            </IconButton>
          </Stack>

          <Accordion defaultExpanded variant="outlined" sx={{ borderRadius: 2, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography fontWeight={600}>Описание</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">{product.description}</Typography>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>

      <Divider sx={{ my: 6 }} />

      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
        Отзывы ({reviews.length})
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          {user ? (
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Написать отзыв</Typography>
              <form onSubmit={submitReview}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption">Ваша оценка</Typography>
                  <Rating
                    value={reviewForm.rating}
                    onChange={(_, v) => setReviewForm({ ...reviewForm, rating: v || 5 })}
                  />
                </Box>
                <TextField
                  multiline
                  minRows={3}
                  fullWidth
                  placeholder="Поделитесь впечатлениями..."
                  value={reviewForm.text}
                  onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <Button variant="contained" type="submit" disabled={submittingReview}>
                  {submittingReview ? 'Отправка...' : 'Опубликовать'}
                </Button>
              </form>
            </Paper>
          ) : (
            <Alert severity="info">
              <MUILink component={Link} to="/login">Войдите</MUILink>, чтобы оставить отзыв.
            </Alert>
          )}
        </Grid>

        <Grid item xs={12} md={7}>
          {reviews.length === 0 ? (
            <Typography color="text.secondary">Отзывов пока нет. Будьте первым!</Typography>
          ) : (
            <Stack spacing={2}>
              {reviews.map((r) => (
                <Paper key={r.id} variant="outlined" sx={{ p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: 14 }}>
                        {r.user?.name?.charAt(0).toUpperCase() || '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{r.user?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(r.created_at).toLocaleDateString('ru-RU')}
                        </Typography>
                      </Box>
                    </Stack>
                    <Rating value={r.rating} readOnly size="small" />
                  </Stack>
                  <Typography variant="body2">{r.text}</Typography>
                </Paper>
              ))}
            </Stack>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
