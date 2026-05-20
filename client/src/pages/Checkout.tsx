import { Container, Grid, Paper, Typography, TextField, Button, Stack, Radio, RadioGroup, FormControlLabel, FormLabel, FormControl, Divider, Alert } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { ordersApi } from '../api/endpoints';
import { clearCart } from '../store/cartSlice';
import { showSnackbar } from '../store/snackbarSlice';

export default function Checkout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const items = useAppSelector((s) => s.cart.items);
  const promoCode = useAppSelector((s) => s.cart.promoCode);
  const promoDiscount = useAppSelector((s) => s.cart.promoDiscount);
  const user = useAppSelector((s) => s.auth.user);

  const [form, setForm] = useState({
    shipping_address: '',
    contact_phone: '',
    payment_method: 'card' as 'card' | 'cash',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        shipping_address: f.shipping_address || user.address || '',
        contact_phone: f.contact_phone || user.phone || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (items.length === 0) navigate('/cart');
  }, [items.length, navigate]);

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const discountAmount = promoDiscount ? Math.round(subtotal * promoDiscount) / 100 : 0;
  const total = Math.max(0, subtotal - discountAmount);

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const order = await ordersApi.create({
        items: items.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
        shipping_address: form.shipping_address,
        contact_phone: form.contact_phone,
        payment_method: form.payment_method,
        promoCode: promoCode || undefined,
      });
      dispatch(clearCart());
      dispatch(showSnackbar({ message: `Заказ №${order.id} успешно оформлен`, severity: 'success' }));
      navigate(`/orders/${order.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось оформить заказ');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 800 }}>Оформление заказа</Typography>
      <form onSubmit={placeOrder}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Данные доставки</Typography>
              <Stack spacing={2}>
                <TextField
                  label="Адрес доставки"
                  required
                  fullWidth
                  multiline
                  rows={2}
                  value={form.shipping_address}
                  onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
                />
                <TextField
                  label="Телефон для связи"
                  required
                  fullWidth
                  value={form.contact_phone}
                  onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                />
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <FormControl>
                <FormLabel sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>Способ оплаты</FormLabel>
                <RadioGroup
                  value={form.payment_method}
                  onChange={(e) => setForm({ ...form, payment_method: e.target.value as any })}
                >
                  <FormControlLabel value="card" control={<Radio />} label="Картой на сайте (демо)" />
                  <FormControlLabel value="cash" control={<Radio />} label="Наличными при получении" />
                </RadioGroup>
              </FormControl>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 3, position: 'sticky', top: 80 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Сумма заказа</Typography>
              <Stack spacing={1} sx={{ mb: 2 }}>
                {items.map((it) => (
                  <Stack key={`${it.productId}-${it.size}`} direction="row" justifyContent="space-between">
                    <Typography variant="body2">
                      {it.productName.length > 22 ? it.productName.slice(0, 22) + '…' : it.productName} × {it.quantity}
                    </Typography>
                    <Typography variant="body2">{(it.unitPrice * it.quantity).toFixed(2)} BYN</Typography>
                  </Stack>
                ))}
              </Stack>
              <Divider sx={{ my: 1.5 }} />
              <Stack spacing={0.5} sx={{ mb: 2 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Подытог</Typography>
                  <Typography>{subtotal.toFixed(2)} BYN</Typography>
                </Stack>
                {promoCode && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Промокод {promoCode}</Typography>
                    <Typography color="secondary.main">-{discountAmount.toFixed(2)} BYN</Typography>
                  </Stack>
                )}
                <Stack direction="row" justifyContent="space-between" sx={{ pt: 1 }}>
                  <Typography sx={{ fontWeight: 700 }}>Итого</Typography>
                  <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>
                    {total.toFixed(2)} BYN
                  </Typography>
                </Stack>
              </Stack>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Button type="submit" fullWidth variant="contained" size="large" disabled={submitting}>
                {submitting ? 'Оформление...' : `Подтвердить — ${total.toFixed(2)} BYN`}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}
