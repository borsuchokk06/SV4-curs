import { Box, Container, Typography, Link as MUILink, Divider, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <Box sx={{ bgcolor: 'primary.dark', color: '#fff', mt: 'auto', pt: 6, pb: 3 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr' }, gap: 4, mb: 4 }}>
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>SportArena</Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, maxWidth: 320 }}>
              Онлайн-платформа для управления магазином спортивной одежды. Тщательно подобранный ассортимент экипировки для каждого спортсмена.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Магазин</Typography>
            <Stack spacing={0.5}>
              <MUILink component={Link} to="/catalog" color="inherit" sx={{ opacity: 0.85 }}>Все товары</MUILink>
              <MUILink component={Link} to="/catalog?popular=true" color="inherit" sx={{ opacity: 0.85 }}>Популярные</MUILink>
              <MUILink component={Link} to="/catalog?gender=male" color="inherit" sx={{ opacity: 0.85 }}>Мужское</MUILink>
              <MUILink component={Link} to="/catalog?gender=female" color="inherit" sx={{ opacity: 0.85 }}>Женское</MUILink>
            </Stack>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Кабинет</Typography>
            <Stack spacing={0.5}>
              <MUILink component={Link} to="/profile" color="inherit" sx={{ opacity: 0.85 }}>Профиль</MUILink>
              <MUILink component={Link} to="/orders" color="inherit" sx={{ opacity: 0.85 }}>Мои заказы</MUILink>
              <MUILink component={Link} to="/wishlist" color="inherit" sx={{ opacity: 0.85 }}>Избранное</MUILink>
            </Stack>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Контакты</Typography>
            <Stack spacing={0.5}>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>info@sportarena.by</Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>+375 29 000-00-00</Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>г. Могилёв, Беларусь</Typography>
            </Stack>
          </Box>
        </Box>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,.15)' }} />
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', opacity: 0.7, mt: 2 }}>
          © {new Date().getFullYear()} SportArena. Курсовой проект. Все права защищены.
        </Typography>
      </Container>
    </Box>
  );
}
