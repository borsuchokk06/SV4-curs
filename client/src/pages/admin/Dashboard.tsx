import { Box, Grid, Paper, Typography, Stack, Avatar, Skeleton } from '@mui/material';
import { ShoppingBag, AttachMoney, ShowChart, People } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, CartesianGrid, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { reportsApi } from '../../api/endpoints';

interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  avgCheck: number;
  customers: number;
  daily: { day: string; revenue: number; orders: number }[];
  topProducts: { productId: number; name: string; image: string; units: number; revenue: number }[];
  byStatus: { status: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  paid: '#3b82f6',
  shipped: '#1a3a5c',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Ожидает',
  paid: 'Оплачен',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

export default function AdminDashboard() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    reportsApi.analytics().then(setData);
  }, []);

  if (!data) {
    return <Skeleton variant="rounded" height={400} />;
  }

  const kpi = [
    { label: 'Общая выручка', value: `${Number(data.totalRevenue).toFixed(2)} BYN`, icon: <AttachMoney />, color: '#10b981' },
    { label: 'Всего заказов', value: data.totalOrders, icon: <ShoppingBag />, color: '#3b82f6' },
    { label: 'Средний чек', value: `${Number(data.avgCheck).toFixed(2)} BYN`, icon: <ShowChart />, color: '#ff6b35' },
    { label: 'Покупателей', value: data.customers, icon: <People />, color: '#1a3a5c' },
  ];

  const statusData = data.byStatus.map((s) => ({ ...s, label: STATUS_LABELS[s.status] || s.status }));

  return (
    <Box>
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {kpi.map((k, idx) => (
          <Grid key={idx} item xs={12} sm={6} md={3}>
            <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: k.color + '22', color: k.color, width: 48, height: 48 }}>{k.icon}</Avatar>
                <Box>
                  <Typography color="text.secondary" variant="caption" sx={{ display: 'block' }}>{k.label}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{k.value}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Динамика выручки</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.daily}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a3a5c" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#1a3a5c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#1a3a5c" fill="url(#rev)" strokeWidth={2} name="Выручка" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Заказы по статусам</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(p) => `${p.label}: ${p.count}`}
                >
                  {statusData.map((s) => (
                    <Cell key={s.status} fill={STATUS_COLORS[s.status] || '#888'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Топ-5 товаров по продажам</Typography>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.topProducts}>
                <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={70} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="units" fill="#ff6b35" name="Продано шт." radius={[6, 6, 0, 0]} />
                <Bar dataKey="revenue" fill="#1a3a5c" name="Выручка (BYN)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
