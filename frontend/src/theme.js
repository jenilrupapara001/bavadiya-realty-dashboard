import { createTheme } from '@mui/material/styles';

const sharedTypography = {
  fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  h4: { fontWeight: 700 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
  button: { textTransform: 'none', fontWeight: 600 }
};

const sharedComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        textTransform: 'none',
        fontWeight: 600,
        paddingInline: 20
      },
      contained: {
        boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)'
      }
    }
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 18,
        boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 18,
        boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 24px 50px rgba(15, 23, 42, 0.12)'
        }
      }
    }
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        '& th': {
          fontWeight: 600,
          letterSpacing: '0.08em'
        }
      }
    }
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 999,
        fontWeight: 600
      }
    }
  }
};

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2563eb' },
    secondary: { main: '#0f172a' },
    success: { main: '#16a34a' },
    error: { main: '#dc2626' },
    background: {
      default: '#f4f6fb',
      paper: '#ffffff'
    }
  },
  shape: { borderRadius: 18 },
  typography: sharedTypography,
  components: sharedComponents
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#60a5fa' },
    secondary: { main: '#eab308' },
    background: {
      default: '#0f172a',
      paper: '#1e293b'
    }
  },
  shape: { borderRadius: 18 },
  typography: sharedTypography,
  components: sharedComponents
});

export { lightTheme, darkTheme };