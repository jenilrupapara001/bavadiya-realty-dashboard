import { createTheme } from '@mui/material/styles';

const sharedTypography = {
  fontFamily: '"Josefin Sans", "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  h1: { fontFamily: '"Cinzel", serif', fontWeight: 700 },
  h2: { fontFamily: '"Cinzel", serif', fontWeight: 700 },
  h3: { fontFamily: '"Cinzel", serif', fontWeight: 600 },
  h4: { fontFamily: '"Cinzel", serif', fontWeight: 700 },
  h5: { fontFamily: '"Cinzel", serif', fontWeight: 600 },
  h6: { fontFamily: '"Cinzel", serif', fontWeight: 600 },
  button: { textTransform: 'none', fontWeight: 600 }
};

const sharedComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        textTransform: 'none',
        fontWeight: 600,
        paddingInline: 24,
        paddingBlock: 10,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 10px 20px rgba(15, 118, 110, 0.2)'
        }
      },
      contained: {
        boxShadow: '0 8px 16px rgba(15, 118, 110, 0.15)'
      }
    }
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 24,
        boxShadow: '0 20px 40px rgba(19, 78, 74, 0.05)'
      }
    }
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 24,
        boxShadow: '0 20px 40px rgba(19, 78, 74, 0.05)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 30px 60px rgba(19, 78, 74, 0.1)'
        }
      }
    }
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.8)'
          },
          '&.Mui-focused': {
            backgroundColor: '#ffffff'
          }
        }
      }
    }
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        '& th': {
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          color: '#64748b'
        }
      }
    }
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        fontWeight: 600
      }
    }
  }
};

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { 
      main: '#0F766E', // Trust teal
      light: '#14B8A6',
      dark: '#134E4A',
      contrastText: '#ffffff'
    },
    secondary: { 
      main: '#0369A1', // Professional blue
      light: '#0EA5E9',
      dark: '#0C4A6E'
    },
    success: { main: '#10B981' },
    error: { main: '#EF4444' },
    warning: { main: '#F59E0B' },
    background: {
      default: '#F0FDFA', // Ultra light teal
      paper: '#ffffff',
      subtle: '#F8FAFC'
    },
    text: {
      primary: '#134E4A',
      secondary: '#475569'
    }
  },
  shape: { borderRadius: 16 },
  typography: sharedTypography,
  components: sharedComponents
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { 
      main: '#2DD4BF',
      light: '#5EEAD4',
      dark: '#0F766E'
    },
    secondary: { 
      main: '#38BDF8',
      light: '#7DD3FC',
      dark: '#0369A1'
    },
    background: {
      default: '#020617',
      paper: '#0f172a'
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8'
    }
  },
  shape: { borderRadius: 16 },
  typography: sharedTypography,
  components: sharedComponents
});

export { lightTheme, darkTheme };