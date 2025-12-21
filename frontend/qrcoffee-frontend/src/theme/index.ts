import { createTheme, alpha } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary'];
    gradients: {
      primary: string;
      success: string;
      info: string;
      warning: string;
      error: string;
    };
  }
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
    gradients?: {
      primary: string;
      success: string;
      info: string;
      warning: string;
      error: string;
    };
  }
}

// ----------------------------------------------------------------------

// Modern Glassmorphism Palette
const PRIMARY_MAIN = '#6C5DD3'; // Deep Violet
const SECONDARY_MAIN = '#00E5FF'; // Cyan Accent
const SUCCESS_MAIN = '#00B074';
const WARNING_MAIN = '#FFB547';
const ERROR_MAIN = '#FF4C61';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      light: '#A098F5',
      main: PRIMARY_MAIN,
      dark: '#3F33A3',
      contrastText: '#FFFFFF',
    },
    secondary: {
      light: '#84FFFF',
      main: SECONDARY_MAIN,
      dark: '#00B2CC',
      contrastText: '#002933',
    },
    success: {
      main: SUCCESS_MAIN,
      contrastText: '#FFFFFF',
    },
    warning: {
      main: WARNING_MAIN,
      contrastText: '#212B36',
    },
    error: {
      main: ERROR_MAIN,
      contrastText: '#FFFFFF',
    },
    background: {
      default: 'transparent', // Handled by global CSS (Aurora Gradient)
      paper: alpha('#FFFFFF', 0.8), // Glass effect base
    },
    text: {
      primary: '#2B2B2B',
      secondary: '#6E7191',
      disabled: '#A0A3BD',
    },
    neutral: {
      main: '#6E7191', // Gray purple
      contrastText: '#FFFFFF',
    },
    gradients: {
      primary: `linear-gradient(135deg, ${PRIMARY_MAIN} 0%, #A098F5 100%)`,
      success: `linear-gradient(135deg, ${SUCCESS_MAIN} 0%, #4AD991 100%)`,
      info: `linear-gradient(135deg, #00B8D9 0%, #6CC3F5 100%)`,
      warning: `linear-gradient(135deg, ${WARNING_MAIN} 0%, #FFE58F 100%)`,
      error: `linear-gradient(135deg, ${ERROR_MAIN} 0%, #FF99AC 100%)`,
    },
  },
  typography: {
    fontFamily: [
      'Outfit',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 800, fontSize: '3rem', letterSpacing: '-0.02em', lineHeight: 1.2 },
    h2: { fontWeight: 700, fontSize: '2.5rem', letterSpacing: '-0.01em', lineHeight: 1.3 },
    h3: { fontWeight: 700, fontSize: '2rem', lineHeight: 1.4 },
    h4: { fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.4 },
    h5: { fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontWeight: 600, fontSize: '1.125rem' },
    button: { textTransform: 'none', fontWeight: 600, fontSize: '1rem', letterSpacing: '0.02em' },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
  },
  shape: {
    borderRadius: 20, // More rounded for friendliness
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': { boxSizing: 'border-box' },
        html: {
          width: '100%',
          height: '100%',
          WebkitScrolling: 'touch',
          scrollBehavior: 'smooth'
        },
        body: {
          width: '100%',
          height: '100%',
          overflowX: 'hidden'
        },
        '#root': { width: '100%', height: '100%' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          border: '1px solid rgba(255, 255, 255, 0.4)',
        },
        elevation1: {
          boxShadow: '0 4px 24px -1px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.05)',
        },
        elevation3: {
          boxShadow: '0 12px 48px -4px rgba(145, 158, 171, 0.12)',
        },
      },
      defaultProps: {
        elevation: 0,
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: alpha('#FFFFFF', 0.65), // Stronger glass effect
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 20,
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          boxShadow: 'none',
          transition: 'all 0.3s ease',
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${PRIMARY_MAIN} 0%, #A098F5 100%)`,
          boxShadow: '0 8px 20px -4px rgba(108, 93, 211, 0.4)',
          '&:hover': {
            boxShadow: '0 12px 28px -4px rgba(108, 93, 211, 0.6)',
            filter: 'brightness(1.05)',
          },
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${SECONDARY_MAIN} 0%, #00B2CC 100%)`,
          color: '#003344',
          fontWeight: 700,
          '&:hover': {
            filter: 'brightness(1.05)',
          }
        },
        sizeLarge: {
          height: 52,
          fontSize: '1.1rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
            backgroundColor: alpha('#FFFFFF', 0.6),
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s',
            '& fieldset': {
              borderColor: 'rgba(108, 93, 211, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(108, 93, 211, 0.5)',
            },
            '&.Mui-focused': {
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
              '& fieldset': {
                borderColor: PRIMARY_MAIN,
                borderWidth: 2,
              }
            }
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha('#FFFFFF', 0.8),
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          color: '#2B2B2B',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
        filled: {
          border: '1px solid rgba(0,0,0,0.05)',
        }
      }
    }
  },
});

export default theme;
