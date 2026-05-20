import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Paper, Stack, Chip, Box, Divider, Button, Skeleton, Grid, Alert } from '@mui/material';
import { Download, ArrowBack } from '@mui/icons-material';
import { ordersApi, reportsApi } from '../api/endpoints';
import type { Order, OrderStatus } from '../types';
import { useAppDispatch } from '../store';
import { showSnackbar } from '../store/snackbarSlice';

const statusColor: Record<OrderStatus, 'default' | 'warning' | 'info' | 'primary' | 'success' | 'error'> = {
  pending: 'warning', paid: 'info', shipped: 'primary', delivered: 'success', cancelled: 'error',
};
const statusLabel: Record<OrderStatus, string> = {
  pending: 'Ожидает оплаты', paid: 'Оплачен', shipped: 'Отправлен', delivered: 'Доставлен', cancelled: 'Отменён',
};
const paymentLabel: Record<string, string> = { card: 'Карта', cash: 'Наличные при получении' };

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    ordersApi.get(Number(id))
      .then(setOrder)
      .catch((e) => setError(e.response?.data?.error || 'Не удалось загрузить заказ'));
  }, [id]);

  async function downloadPdf() {
    if (!order) return;
    try {
      const blob = await reportsApi.downloadOrderPdf(order.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order-${order.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      dispatch(showSnackbar({ message: 'Чек скачан', severity: 'success' }));
    } catch {
      dispatch(showSnackbar({ message: 'Не удалось скачать PDF', severity: 'error' }));
    }
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button component={Link} to="/orders" startIcon={<ArrowBack />}>К списку заказов</Button>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Skeleton variant="rounded" height={400} />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button component={Link} to="/orders" startIcon={<ArrowBack />} sx={{ mb: 2 }}>Все заказы</Button>

      <Paper variant="outlined" sx={{ p: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-start' }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Заказ №{order.id}</Typography>
            <Typography color="text.secondary">{new Date(order.created_at).toLocaleString('ru-RU')}</Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={statusLabel[order.status]} color={statusColor[order.status]} sx={{ fontWeight: 600 }} />
            <Button startIcon={<Download />} variant="outlined" onClick={downloadPdf}>Скачать PDF</Button>
          </Stack>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Доставка</Typography>
            <Typography>{order.shipping_address}</Typography>
            <Typography variant="body2" color="text.secondary">{order.contact_phone}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Оплата</Typography>
            <Typography>{paymentLabel[order.payment_method] || order.payment_method}</Typography>
            {order.promoCode && (
              <Typography variant="body2" color="text.secondary">Промокод: {order.promoCode.code}</Typography>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Товары</Typography>
        <Stack spacing={1.5}>
          {order.items?.map((item) => (
            <Paper key={item.id} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ width: 60, height: 60, borderRadius: 1, overflow: 'hidden', flexShrink: 0 }}>
                  <Box component="img" src={item.product?.image_url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>{item.product?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Размер {item.size} · Количество {item.quantity}
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 700 }}>
                  {(Number(item.unit_price) * item.quantity).toFixed(2)} BYN
                </Typography>
              </Stack>
            </Paper>
          ))}
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Stack spacing={1} sx={{ maxWidth: 320, ml: 'auto' }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Подытог</Typography>
            <Typography>{Number(order.subtotal).toFixed(2)} BYN</Typography>
          </Stack>
          {Number(order.discount) > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Скидка</Typography>
              <Typography color="secondary.main">-{Number(order.discount).toFixed(2)} BYN</Typography>
            </Stack>
          )}
          <Divider />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontWeight: 700 }}>Итого</Typography>
            <Typography variant="h5" color="primary.main" sx={{ fontWeight: 800 }}>
              {Number(order.total).toFixed(2)} BYN
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}
