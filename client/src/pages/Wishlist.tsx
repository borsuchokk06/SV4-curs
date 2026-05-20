import { Container, Typography, Grid, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchWishlist } from '../store/wishlistSlice';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.wishlist.items);

  useEffect(() => { dispatch(fetchWishlist()); }, [dispatch]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 800 }}>Избранное</Typography>
      {items.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>В избранном пока пусто.</Typography>
          <Button component={Link} to="/catalog" variant="contained">Перейти в каталог</Button>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {items.map((p) => (
            <Grid key={p.id} item xs={6} sm={4} md={3}>
              <ProductCard product={p} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
