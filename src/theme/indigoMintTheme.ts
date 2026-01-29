/**
 * Indigo Mint Theme
 * "Technical but approachable" — Electric Indigo & Fresh Mint
 * Based on VOXEL_INDIGO_MINT_DESIGN_SYSTEM.md
 */

import { createTheme, type Theme } from '@mui/material/styles';

// Color palette from design system
export const indigoMintColors = {
  // Primary - Indigo
  primary: '#4F46E5',        // Electric Indigo
  primaryLight: '#6366F1',   // Indigo Light
  primaryDark: '#3730A3',    // Indigo Dark
  primaryDeep: '#1E1B4B',    // Deep Indigo

  // Accent - Mint
  accent: '#34D399',         // Fresh Mint
  accentLight: '#6EE7B7',    // Mint Light
  accentMedium: '#10B981',   // Mint Medium
  accentDark: '#059669',     // Mint Dark

  // Neutrals
  bgPrimary: '#FAFBFF',      // Snow
  bgSecondary: '#F3F4F6',    // Gray 100
  bgDark: '#1E1B4B',         // Deep Indigo
  surface: '#FFFFFF',        // White
  surfaceDark: '#312E81',    // Indigo 900

  // Text
  textPrimary: '#1E1B4B',    // Deep Indigo
  textSecondary: '#374151',  // Gray 700
  textTertiary: '#6B7280',   // Gray 500

  // Borders
  border: '#E5E7EB',         // Gray 200
  borderLight: '#F3F4F6',    // Gray 100

  // Semantic
  success: '#059669',        // Mint Dark
  successBg: '#D1FAE5',
  warning: '#D97706',
  warningBg: '#FEF3C7',
  error: '#DC2626',
  errorBg: '#FEE2E2',
  info: '#4F46E5',           // Uses Primary
  infoBg: '#EEF2FF',
};

// Font stack
export const indigoMintFonts = {
  display: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
};

// Gradients
export const indigoMintGradients = {
  // Indigo to Mint - Hero gradient, main brand
  primary: 'linear-gradient(135deg, #4F46E5 0%, #34D399 100%)',
  // Indigo only - Buttons, UI elements
  indigo: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
  // Mint only - Accent buttons, highlights
  mint: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
  // Reverse - Mint to Indigo
  reverse: 'linear-gradient(135deg, #34D399 0%, #4F46E5 100%)',
  // Subtle - Lighter version for backgrounds
  subtle: 'linear-gradient(135deg, #6366F1 0%, #6EE7B7 100%)',
  // Destructive
  destructive: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
};

// Shadows
export const indigoMintShadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
  glowIndigo: '0 4px 14px rgba(79, 70, 229, 0.35)',
  glowIndigoLg: '0 6px 20px rgba(79, 70, 229, 0.45)',
  glowMint: '0 4px 14px rgba(52, 211, 153, 0.35)',
  glowMintLg: '0 6px 20px rgba(52, 211, 153, 0.45)',
};

// Create MUI theme
export const indigoMintTheme: Theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: indigoMintColors.primary,
      light: indigoMintColors.primaryLight,
      dark: indigoMintColors.primaryDark,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: indigoMintColors.accent,
      light: indigoMintColors.accentLight,
      dark: indigoMintColors.accentDark,
      contrastText: '#FFFFFF',
    },
    error: {
      main: indigoMintColors.error,
      light: indigoMintColors.errorBg,
    },
    warning: {
      main: indigoMintColors.warning,
      light: indigoMintColors.warningBg,
    },
    success: {
      main: indigoMintColors.success,
      light: indigoMintColors.successBg,
    },
    info: {
      main: indigoMintColors.info,
      light: indigoMintColors.infoBg,
    },
    background: {
      default: indigoMintColors.bgPrimary,
      paper: indigoMintColors.surface,
    },
    text: {
      primary: indigoMintColors.textPrimary,
      secondary: indigoMintColors.textSecondary,
    },
    divider: indigoMintColors.border,
  },
  typography: {
    fontFamily: indigoMintFonts.body,
    h1: {
      fontFamily: indigoMintFonts.display,
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.15,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: indigoMintFonts.display,
      fontSize: '1.875rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontFamily: indigoMintFonts.display,
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontFamily: indigoMintFonts.display,
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontFamily: indigoMintFonts.display,
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontFamily: indigoMintFonts.display,
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0.01em',
    },
    overline: {
      fontSize: '0.6875rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(0, 0, 0, 0.05)',
    '0 1px 3px rgba(0, 0, 0, 0.08)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    '0 4px 14px rgba(79, 70, 229, 0.2)',
    '0 6px 20px rgba(79, 70, 229, 0.25)',
    '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '0.75rem 1.5rem',
          fontWeight: 600,
          fontSize: '0.875rem',
          boxShadow: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          background: indigoMintGradients.indigo,
          boxShadow: indigoMintShadows.glowIndigo,
          '&:hover': {
            background: indigoMintGradients.indigo,
            boxShadow: indigoMintShadows.glowIndigoLg,
          },
        },
        containedSecondary: {
          background: indigoMintGradients.mint,
          boxShadow: indigoMintShadows.glowMint,
          '&:hover': {
            background: indigoMintGradients.mint,
            boxShadow: indigoMintShadows.glowMintLg,
          },
        },
        outlined: {
          borderWidth: 2,
          borderColor: indigoMintColors.border,
          backgroundColor: indigoMintColors.surface,
          color: indigoMintColors.textPrimary,
          '&:hover': {
            borderWidth: 2,
            borderColor: indigoMintColors.primary,
            backgroundColor: indigoMintColors.bgPrimary,
          },
        },
        text: {
          color: indigoMintColors.primary,
          '&:hover': {
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${indigoMintColors.border}`,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          fontWeight: 600,
          fontSize: '0.75rem',
        },
        colorPrimary: {
          backgroundColor: 'rgba(79, 70, 229, 0.15)',
          color: indigoMintColors.primary,
          border: '1px solid rgba(79, 70, 229, 0.3)',
        },
        colorSecondary: {
          backgroundColor: 'rgba(52, 211, 153, 0.15)',
          color: indigoMintColors.accentDark,
          border: '1px solid rgba(52, 211, 153, 0.3)',
        },
        colorSuccess: {
          backgroundColor: 'rgba(5, 150, 105, 0.15)',
          color: indigoMintColors.success,
          border: '1px solid rgba(5, 150, 105, 0.3)',
        },
        colorWarning: {
          backgroundColor: 'rgba(217, 119, 6, 0.15)',
          color: indigoMintColors.warning,
          border: '1px solid rgba(217, 119, 6, 0.3)',
        },
        colorError: {
          backgroundColor: 'rgba(220, 38, 38, 0.15)',
          color: indigoMintColors.error,
          border: '1px solid rgba(220, 38, 38, 0.3)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: indigoMintColors.surface,
            '& fieldset': {
              borderWidth: 2,
              borderColor: indigoMintColors.border,
            },
            '&:hover fieldset': {
              borderColor: indigoMintColors.primaryLight,
            },
            '&.Mui-focused fieldset': {
              borderColor: indigoMintColors.primary,
              boxShadow: '0 0 0 4px rgba(79, 70, 229, 0.1)',
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: indigoMintColors.bgDark,
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: indigoMintColors.bgDark,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: indigoMintColors.primary,
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          '&.Mui-selected': {
            color: indigoMintColors.primary,
            fontWeight: 600,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: indigoMintColors.bgDark,
          fontSize: '0.75rem',
          fontWeight: 500,
          borderRadius: 6,
          padding: '6px 12px',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: 'rgba(79, 70, 229, 0.15)',
        },
        bar: {
          borderRadius: 4,
          background: indigoMintGradients.primary,
        },
      },
    },
  },
});

export default indigoMintTheme;
