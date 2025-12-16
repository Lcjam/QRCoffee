import { createTheme, alpha } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary'];
  }
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
  }
}

// ----------------------------------------------------------------------

const PRIMARY_MAIN = '#5E35B1'; // Deep Premium Purple
const SECONDARY_MAIN = '#00BFA5'; // Fresh Teal Accent

const theme = createTheme({
  palette: {
    primary: {
      light: '#9162e4',
      main: PRIMARY_MAIN,
      dark: '#280680',
      contrastText: '#fff',
    },
    secondary: {
      light: '#5df2d6',
      main: SECONDARY_MAIN,
      dark: '#008e76',
      contrastText: '#fff',
    },
    background: {
      default: '#F4F6F8', // Light gray background for depth
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212B36',
      secondary: '#637381',
      disabled: '#919EAB',
    },
    neutral: {
      main: '#637381',
      contrastText: '#fff',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 700, fontSize: '2.5rem' },
    h2: { fontWeight: 700, fontSize: '2rem' },
    h3: { fontWeight: 700, fontSize: '1.75rem' },
    h4: { fontWeight: 700, fontSize: '1.5rem' },
    h5: { fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          width: '100%',
          height: '100%',
          WebkitScrolling: 'touch',
        },
        body: {
          width: '100%',
          height: '100%',
        },
        '#root': {
          width: '100%',
          height: '100%',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 16,
        },
        elevation3: {
          boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 8px 16px -4px rgba(94, 53, 177, 0.24)', // Soft primary shadow
          },
        },
        containedPrimary: {
           boxShadow: '0 8px 16px 0 rgba(94, 53, 177, 0.24)',
        },
        sizeLarge: {
          height: 48,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          }
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
          borderRadius: 16,
        },
      },
    }
  },
});

export default theme;
