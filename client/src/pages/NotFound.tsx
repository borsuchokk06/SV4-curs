import { Container, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
      <Typography variant="h1" sx={{ fontSize: 120, fontWeight: 900, color: 'primary.main', mb: 1 }}>404</Typography>
      <Typography variant="h5" sx={{ mb: 1 }}>Страница не найдена</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Страницы, которую вы ищете, не существует или она была перемещена.
      </Typography>
      <Box>
        <Button component={Link} to="/" variant="contained" size="large">На главную</Button>
      </Box>
    </Container>
  );
}
