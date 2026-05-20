import { AppBar, Toolbar, Box, Button, IconButton, Badge, Menu, MenuItem, Avatar, Drawer, List, ListItem, ListItemText, Divider, useMediaQuery, useTheme } from '@mui/material';
import {
  ShoppingCart, Favorite, Person, Menu as MenuIcon, AdminPanelSettings, Logout,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/authSlice';
import { clear as clearWishlist } from '../store/wishlistSlice';
import { clearCart } from '../store/cartSlice';

export default function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const user = useAppSelector((s) => s.auth.user);
  const cartCount = useAppSelector((s) => s.cart.items.reduce((sum, i) => sum + i.quantity, 0));
  const wishlistCount = useAppSelector((s) => s.wishlist.ids.length);

  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const [drawer, setDrawer] = useState(false);

  const navLinks = [
    { to: '/', label: 'Главная' },
    { to: '/catalog', label: 'Каталог' },
    { to: '/catalog?categoryId=5', label: 'Кроссовки' },
    { to: '/catalog?gender=female', label: 'Женское' },
    { to: '/catalog?gender=male', label: 'Мужское' },
  ];

  function handleLogout() {
    dispatch(logout());
    dispatch(clearWishlist());
    dispatch(clearCart());
    setAnchor(null);
    navigate('/');
  }

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ gap: 2, py: 0.5 }}>
        {isMobile && (
          <IconButton onClick={() => setDrawer(true)} edge="start"><MenuIcon /></IconButton>
        )}

        <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', mr: 2 }}>
          <Box sx={{
            width: 36, height: 36, mr: 1, borderRadius: 2,
            background: 'linear-gradient(135deg, #1a3a5c, #ff6b35)',
            display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800,
          }}>SA</Box>
          <Box sx={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }}>SportArena</Box>
        </Box>

        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 0.5, flex: 1 }}>
            {navLinks.map((l) => (
              <Button key={l.to} component={Link} to={l.to} color="inherit" sx={{ fontWeight: 500 }}>
                {l.label}
              </Button>
            ))}
          </Box>
        )}
        {isMobile && <Box sx={{ flex: 1 }} />}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {user && (
            <IconButton component={Link} to="/wishlist" color="inherit">
              <Badge badgeContent={wishlistCount} color="secondary"><Favorite /></Badge>
            </IconButton>
          )}
          <IconButton component={Link} to="/cart" color="inherit">
            <Badge badgeContent={cartCount} color="secondary"><ShoppingCart /></Badge>
          </IconButton>

          {user ? (
            <>
              <IconButton onClick={(e) => setAnchor(e.currentTarget)}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
                <MenuItem component={Link} to="/profile" onClick={() => setAnchor(null)}>
                  <Person fontSize="small" sx={{ mr: 1 }} /> Профиль
                </MenuItem>
                <MenuItem component={Link} to="/orders" onClick={() => setAnchor(null)}>
                  Мои заказы
                </MenuItem>
                {user.role === 'admin' && (
                  <MenuItem component={Link} to="/admin" onClick={() => setAnchor(null)}>
                    <AdminPanelSettings fontSize="small" sx={{ mr: 1 }} /> Админ-панель
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <Logout fontSize="small" sx={{ mr: 1 }} /> Выйти
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
              <Button component={Link} to="/login" variant="text">Войти</Button>
              <Button component={Link} to="/register" variant="contained">Регистрация</Button>
            </Box>
          )}
        </Box>
      </Toolbar>

      <Drawer open={drawer} onClose={() => setDrawer(false)}>
        <Box sx={{ width: 240 }} role="presentation" onClick={() => setDrawer(false)}>
          <List>
            {navLinks.map((l) => (
              <ListItem key={l.to} component={Link} to={l.to} sx={{ color: 'inherit', textDecoration: 'none' }}>
                <ListItemText primary={l.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
