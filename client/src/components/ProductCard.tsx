import { Card, CardMedia, CardContent, CardActions, Box, Typography, IconButton, Chip, Rating, Tooltip, Button } from '@mui/material';
import { Favorite, FavoriteBorder, ShoppingCart } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../types';
import { useAppDispatch, useAppSelector } from '../store';
import { toggleWishlistItem } from '../store/wishlistSlice';
import { showSnackbar } from '../store/snackbarSlice';

export default function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isInWishlist = useAppSelector((s) => s.wishlist.ids.includes(product.id));
  const user = useAppSelector((s) => s.auth.user);

  const onSale = !!product.sale_price && Number(product.sale_price) < Number(product.price);
  const displayPrice = onSale ? Number(product.sale_price) : Number(product.price);

  function go() { navigate(`/product/${product.id}`); }

  function onWishlist(e: React.MouseEvent) {
    e.stopPropagation();
    if (!user) {
      dispatch(showSnackbar({ message: 'Войдите, чтобы добавить в избранное', severity: 'info' }));
      return;
    }
    dispatch(toggleWishlistItem({ productId: product.id, isInWishlist }))
      .unwrap()
      .then(() => dispatch(showSnackbar({
        message: isInWishlist ? 'Удалено из избранного' : 'Добавлено в избранное',
        severity: 'success',
      })))
      .catch(() => dispatch(showSnackbar({ message: 'Не удалось обновить избранное', severity: 'error' })));
  }

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,.10)' },
        '&:hover .product-image': { transform: 'scale(1.04)' },
      }}
    >
      <Box onClick={go} sx={{ position: 'relative', pt: '100%', overflow: 'hidden', bgcolor: '#f0f2f5', cursor: 'pointer' }}>
        <CardMedia
          className="product-image"
          component="img"
          image={product.image_url}
          alt={product.name}
          sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s' }}
        />
        <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 0.5 }}>
          {onSale && <Chip label="СКИДКА" color="secondary" size="small" sx={{ fontWeight: 700 }} />}
          {product.is_popular && <Chip label="ХИТ" color="primary" size="small" />}
        </Box>
        <Tooltip title={isInWishlist ? 'Удалить из избранного' : 'Добавить в избранное'}>
          <IconButton
            onClick={onWishlist}
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper', '&:hover': { bgcolor: 'background.paper' } }}
          >
            {isInWishlist ? <Favorite color="secondary" /> : <FavoriteBorder />}
          </IconButton>
        </Tooltip>
      </Box>

      <CardContent onClick={go} sx={{ flex: 1, pb: 1, cursor: 'pointer' }}>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {product.brand?.name} · {product.category?.name}
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 0.5, lineHeight: 1.2, color: 'text.primary' }}>
          {product.name}
        </Typography>
        {(product.rating || 0) > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <Rating value={product.rating || 0} size="small" readOnly precision={0.5} />
            <Typography variant="caption" color="text.secondary">({product.reviewCount})</Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 1 }}>
          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
            {displayPrice.toFixed(2)} BYN
          </Typography>
          {onSale && (
            <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
              {Number(product.price).toFixed(2)} BYN
            </Typography>
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Button fullWidth variant="outlined" startIcon={<ShoppingCart />} size="small" onClick={go}>
          Подробнее
        </Button>
      </CardActions>
    </Card>
  );
}
