import { Container, Typography, Box, Paper, IconButton, Stack, Button, Divider, TextField, Alert, Grid } from '@mui/material';
import { Add, Remove, DeleteOutline, ShoppingCartCheckout, LocalOffer } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { updateQuantity, removeItem, clearCart, applyPromo, clearPromo } from '../store/cartSlice';
import { promoApi } from '../api/endpoints';
import { showSnackbar } from '../store/snackbarSlice';

export default function Cart() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const items = useAppSelector((s) => s.cart.items);
  const promoCode = useAppSelector((s) => s.cart.promoCode);
  const promoDiscount = useAppSelector((s) => s.cart.promoDiscount);
  const user = useAppSelector((s) => s.auth.user);

  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const discountAmount = promoDiscount ? Math.round(subtotal * promoDiscount) / 100 : 0;
  const total = Math.max(0, subtotal - discountAmount);

  async function checkPromo() {
    if (!code.trim()) return;
    setChecking(true);
    try {
      const r = await promoApi.validate(code.trim().toUpperCase());
      if (r.valid) {
        dispatch(applyPromo({ code: r.code, discount: r.discount_percent }));
        dispatch(showSnackbar({ message: `Промокод применён: скидка ${r.discount_percent}%`, severity: 'success' }));
      }
    } catch (err: any) {
      dispatch(showSnackbar({
        message: err.response?.data?.error || 'Неверный промокод',
        severity: 'error',
      }));
    } finally {
      setChecking(false);
    }
  }

  function goCheckout() {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  }

  if (items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 800 }}>Корзина пуста</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Перейдите в каталог и выберите что-нибудь по душе.
        </Typography>
        <Button component={Link} to="/catalog" variant="contained" size="large">К каталогу</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 800 }}>Корзина ({items.length})</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Stack spacing={2}>
            {items.map((item) => (
              <Paper key={`${item.productId}-${item.size}`} variant="outlined" sx={{ p: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                  <Box component={Link} to={`/product/${item.productId}`} sx={{ width: 100, height: 100, flexShrink: 0 }}>
                    <Box component="img" src={item.productImage} alt={item.productName}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      component={Link}
                      to={`/product/${item.productId}`}
                      sx={{ fontWeight: 600, color: 'inherit', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                    >
                      {item.productName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Размер: {item.size}</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {item.unitPrice.toFixed(2)} BYN за шт.
                    </Typography>
                  </Box>
                  <Stack direction="row" alignItems="center" sx={{ border: '1px solid #ddd', borderRadius: 1 }}>
                    <IconButton size="small" onClick={() => dispatch(updateQuantity({
                      productId: item.productId, size: item.size, quantity: item.quantity - 1,
                    }))}><Remove /></IconButton>
                    <Typography sx={{ minWidth: 28, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</Typography>
                    <IconButton size="small" onClick={() => dispatch(updateQuantity({
                      productId: item.productId, size: item.size, quantity: item.quantity + 1,
                    }))}><Add /></IconButton>
                  </Stack>
                  <Typography sx={{ fontWeight: 700, minWidth: 100, textAlign: 'right' }}>
                    {(item.unitPrice * item.quantity).toFixed(2)} BYN
                  </Typography>
                  <IconButton onClick={() => dispatch(removeItem({ productId: item.productId, size: item.size }))} color="error">
                    <DeleteOutline />
                  </IconButton>
                </Stack>
              </Paper>
            ))}
          </Stack>
          <Button onClick={() => dispatch(clearCart())} color="error" sx={{ mt: 2 }}>Очистить корзину</Button>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 3, position: 'sticky', top: 80 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Сумма заказа</Typography>

            <Stack spacing={1.5} sx={{ mb: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Подытог</Typography>
                <Typography>{subtotal.toFixed(2)} BYN</Typography>
              </Stack>
              {promoCode && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Промокод ({promoCode})</Typography>
                  <Typography color="secondary.main">-{discountAmount.toFixed(2)} BYN</Typography>
                </Stack>
              )}
              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontWeight: 700 }}>Итого</Typography>
                <Typography variant="h5" color="primary.main" sx={{ fontWeight: 800 }}>
                  {total.toFixed(2)} BYN
                </Typography>
              </Stack>
            </Stack>

            {!promoCode ? (
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <TextField
                  placeholder="Промокод"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  fullWidth
                  InputProps={{ startAdornment: <LocalOffer fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }}
                />
                <Button variant="outlined" onClick={checkPromo} disabled={checking || !code.trim()}>Применить</Button>
              </Stack>
            ) : (
              <Alert
                severity="success"
                action={<Button size="small" onClick={() => dispatch(clearPromo())}>Убрать</Button>}
                sx={{ mb: 2 }}
              >
                Промокод <b>{promoCode}</b> применён
              </Alert>
            )}

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Попробуйте: <b>WELCOME10</b>, <b>SPORT20</b>, <b>SUMMER15</b>
            </Typography>

            <Button
              fullWidth
              variant="contained"
              size="large"
              endIcon={<ShoppingCartCheckout />}
              onClick={goCheckout}
            >
              Оформить заказ
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
