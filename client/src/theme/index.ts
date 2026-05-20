import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1a3a5c', dark: '#0e2235', light: '#3d6088' },
    secondary: { main: '#ff6b35' },
    background: { default: '#f7f8fa', paper: '#ffffff' },
    text: { primary: '#1a1a1a', secondary: '#5c6770' },
    divider: '#e6e8eb',
  },
  typography: {
    fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 800, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, paddingInline: 18 },
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 12px rgba(26,58,92,.25)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,.05), 0 1px 2px rgba(0,0,0,.04)',
          transition: 'transform .25s ease, box-shadow .25s ease',
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 6, fontWeight: 500 } },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
  },
});
