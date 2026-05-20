import { useEffect, useState } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Stack, Typography, Select, MenuItem, FormControl, InputLabel, Button, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { ordersApi } from '../../api/endpoints';
import type { Order, OrderStatus } from '../../types';
import { useAppDispatch } from '../../store';
import { showSnackbar } from '../../store/snackbarSlice';

const statusColor: Record<OrderStatus, 'default' | 'warning' | 'info' | 'primary' | 'success' | 'error'> = {
  pending: 'warning', paid: 'info', shipped: 'primary', delivered: 'success', cancelled: 'error',
};
const statusLabel: Record<OrderStatus, string> = {
  pending: 'Ожидает', paid: 'Оплачен', shipped: 'Отправлен', delivered: 'Доставлен', cancelled: 'Отменён',
};

export default function AdminOrders() {
  const dispatch = useAppDispatch();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [detail, setDetail] = useState<Order | null>(null);

  async function refresh() {
    const r = await ordersApi.list(statusFilter ? { status: statusFilter } : undefined);
    setOrders(r);
  }
  useEffect(() => { refresh(); }, [statusFilter]);

  async function changeStatus(id: number, status: OrderStatus) {
    try {
      await ordersApi.updateStatus(id, status);
      dispatch(showSnackbar({ message: 'Статус обновлён', severity: 'success' }));
      refresh();
    } catch {
      dispatch(showSnackbar({ message: 'Не удалось обновить статус', severity: 'error' }));
    }
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Всего заказов: {orders.length}</Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Статус</InputLabel>
          <Select value={statusFilter} label="Статус" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="">Все</MenuItem>
            <MenuItem value="pending">Ожидает</MenuItem>
            <MenuItem value="paid">Оплачен</MenuItem>
            <MenuItem value="shipped">Отправлен</MenuItem>
            <MenuItem value="delivered">Доставлен</MenuItem>
            <MenuItem value="cancelled">Отменён</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>№</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell>Покупатель</TableCell>
              <TableCell>Позиций</TableCell>
              <TableCell>Сумма</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id} hover>
                <TableCell><b>№{o.id}</b></TableCell>
                <TableCell>{new Date(o.created_at).toLocaleDateString('ru-RU')}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{o.user?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{o.user?.email}</Typography>
                </TableCell>
                <TableCell>{o.items?.length}</TableCell>
                <TableCell><b>{Number(o.total).toFixed(2)} BYN</b></TableCell>
                <TableCell>
                  <Chip label={statusLabel[o.status]} color={statusColor[o.status]} size="small" />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => setDetail(o)}>Просмотр</Button>
                  <FormControl size="small" sx={{ minWidth: 140, ml: 1 }}>
                    <Select value={o.status} onChange={(e) => changeStatus(o.id, e.target.value as OrderStatus)}>
                      <MenuItem value="pending">Ожидает</MenuItem>
                      <MenuItem value="paid">Оплачен</MenuItem>
                      <MenuItem value="shipped">Отправлен</MenuItem>
                      <MenuItem value="delivered">Доставлен</MenuItem>
                      <MenuItem value="cancelled">Отменён</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Заказ №{detail?.id}</DialogTitle>
        <DialogContent dividers>
          {detail && (
            <Box>
              <Typography variant="body2"><b>Покупатель:</b> {detail.user?.name} ({detail.user?.email})</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}><b>Телефон:</b> {detail.contact_phone}</Typography>
              <Typography variant="body2"><b>Адрес:</b> {detail.shipping_address}</Typography>
              <Typography variant="body2" sx={{ mt: 2, mb: 1 }}><b>Позиции:</b></Typography>
              {detail.items?.map((it) => (
                <Typography key={it.id} variant="body2">
                  • {it.product?.name} ({it.size}) × {it.quantity} = {(Number(it.unit_price) * it.quantity).toFixed(2)} BYN
                </Typography>
              ))}
              <Typography variant="h6" sx={{ mt: 2 }}>Итого: {Number(detail.total).toFixed(2)} BYN</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetail(null)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
