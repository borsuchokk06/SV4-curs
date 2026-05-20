import { Box, Tabs, Tab, Container, Typography } from '@mui/material';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  Dashboard, Inventory, ShoppingBag, People, Category as CategoryIcon,
  LocalOffer, Assessment,
} from '@mui/icons-material';

const tabs = [
  { to: '/admin', label: 'Сводка', icon: <Dashboard /> },
  { to: '/admin/products', label: 'Товары', icon: <Inventory /> },
  { to: '/admin/orders', label: 'Заказы', icon: <ShoppingBag /> },
  { to: '/admin/users', label: 'Пользователи', icon: <People /> },
  { to: '/admin/categories', label: 'Каталог', icon: <CategoryIcon /> },
  { to: '/admin/promo', label: 'Промокоды', icon: <LocalOffer /> },
  { to: '/admin/reports', label: 'Отчёты', icon: <Assessment /> },
];

export default function AdminLayout() {
  const loc = useLocation();
  const current = tabs.findIndex((t) => t.to === loc.pathname);
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 800 }}>Админ-панель</Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={current === -1 ? 0 : current} variant="scrollable" scrollButtons="auto">
          {tabs.map((t) => (
            <Tab key={t.to} component={Link} to={t.to} icon={t.icon} iconPosition="start" label={t.label} sx={{ minHeight: 56 }} />
          ))}
        </Tabs>
      </Box>
      <Outlet />
    </Container>
  );
}
