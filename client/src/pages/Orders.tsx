import { Container, Typography, Paper, Stack, Chip, Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../api/endpoints';
import type { Order, OrderStatus } from '../types';

const statusColor: Record<OrderStatus, 'default' | 'warning' | 'info' | 'primary' | 'success' | 'error'> = {
  pending: 'warning',
  paid: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
};

const statusLabel: Record<OrderStatus, string> = {
  pending: 'Ожидает оплаты',
  paid: 'Оплачен',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

function pluralItems(n: number) {
  const last = n % 10;
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return 'позиций';
  if (last === 1) return 'позиция';
  if (last >= 2 && last <= 4) return 'позиции';
  return 'позиций';
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => { ordersApi.mine().then(setOrders); }, []);

  if (!orders) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 800 }}>Мои заказы</Typography>
      {orders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Вы ещё не оформили ни одного заказа.</Typography>
          <Button component={Link} to="/catalog" variant="contained">Начать покупки</Button>
        </Box>
      ) : (
        <Stack spacing={2}>
          {orders.map((o) => (
            <Paper key={o.id} variant="outlined" sx={{ p: 2.5 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ md: 'center' }}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Заказ №{o.id}</Typography>
                    <Chip label={statusLabel[o.status]} color={statusColor[o.status]} size="small" sx={{ fontWeight: 600 }} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(o.created_at).toLocaleString('ru-RU')} · {o.items?.length || 0} {pluralItems(o.items?.length || 0)}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: { md: 'right' } }}>
                  <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>
                    {Number(o.total).toFixed(2)} BYN
                  </Typography>
                  <Button component={Link} to={`/orders/${o.id}`} size="small">Подробнее</Button>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Container>
  );
}
